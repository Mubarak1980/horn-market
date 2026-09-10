/* ==========================================================
   HORN MARKET FRONTEND
========================================================== */

const API_URL = "https://horn-market-production.up.railway.app/api";

const state = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user") || "null"),
  products: [],
  cart: { items: [] },
  page: "home",
  search: "",
  category: "all",
  selectedProduct: null
};

const $ = id => document.getElementById(id);
const $$ = selector => document.querySelectorAll(selector);

function formatPrice(price) {
  return Number(price).toLocaleString("en-US") + " Birr";
}

function showToast(message) {
  let toast = $("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function apiRequest(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (state.token) headers["Authorization"] = "Bearer " + state.token;

  const res = await fetch(API_URL + endpoint, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

/* ---------- AUTH ---------- */

async function signup(name, email, password, role) {
  try {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    showToast("✅ Account created");
    renderAccount();
    loadCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

async function login(email, password) {
  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    showToast("✅ Logged in");
    renderAccount();
    loadCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  state.cart = { items: [] };
  showToast("Logged out");
  renderAccount();
  renderCart();
}

function renderAccount() {
  const loginBox = $("login-form-box");
  const infoBox = $("account-info");
  if (!loginBox || !infoBox) return;

  if (state.user) {
    loginBox.classList.add("hidden");
    infoBox.classList.remove("hidden");
    $("account-name").textContent = state.user.name;
    loadMyProducts();
  } else {
    loginBox.classList.remove("hidden");
    infoBox.classList.add("hidden");
  }
}

async function loadMyProducts() {
  const section = $("my-products-section");
  if (!section || !state.user || state.user.role !== "seller") {
    if (section) section.classList.add("hidden");
    return;
  }

  try {
    const all = await apiRequest("/products");
    const mine = all.filter(p => p.sellerId === state.user.id);

    section.classList.remove("hidden");
    const list = $("my-products-list");

    list.innerHTML = mine.length
      ? mine.map(p => `
        <div class="cart-item">
          <div>
            <h4>${p.name}</h4>
            <p>${formatPrice(p.price)}</p>
          </div>
          <div class="cart-controls">
            <button onclick="editProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}', ${p.price})">✏️ Edit</button>
            <button onclick="deleteProduct('${p.id}')">🗑 Delete</button>
          </div>
        </div>
      `).join("")
      : `<p style="font-size:13px;color:var(--text-light)">No products yet.</p>`;
  } catch (err) {
    showToast("❌ Failed to load your products");
  }
}

async function deleteProduct(id) {
  try {
    await apiRequest("/products/" + id, { method: "DELETE" });
    showToast("🗑 Product deleted");
    loadMyProducts();
    loadProducts();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

async function editProduct(id, currentName, currentPrice) {
  const newPrice = prompt(`Update price for "${currentName}" (Birr):`, currentPrice);
  if (newPrice === null) return;
  const price = Number(newPrice);
  if (!price || price <= 0) {
    showToast("❌ Invalid price");
    return;
  }
  try {
    await apiRequest("/products/" + id, {
      method: "PUT",
      body: JSON.stringify({ price })
    });
    showToast("✅ Product updated");
    loadMyProducts();
    loadProducts();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

/* ---------- NAVIGATION ---------- */

function showPage(page) {
  state.page = page;
  $$(".page").forEach(s => s.classList.add("hidden"));
  const target = $(page + "-page");
  if (target) target.classList.remove("hidden");
  $$("[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === page));
}

/* ---------- PRODUCTS ---------- */

async function loadProducts() {
  try {
    let query = "?";
    if (state.search) query += "search=" + encodeURIComponent(state.search) + "&";
    if (state.category !== "all") query += "category=" + encodeURIComponent(state.category);
    const data = await apiRequest("/products" + query);
    state.products = data;
    renderProducts();
  } catch (err) {
    showToast("❌ Failed to load products");
  }
}

function createProductCard(product) {
  return `
    <article class="card" data-id="${product.id}">
      <img src="${product.imageUrl || 'images/default-product.png'}" alt="${product.name}" loading="lazy"
           onerror="this.src='images/default-product.png'">
      <div class="card-content">
        <span class="category">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>
        <button class="add-to-cart" onclick="addToCart('${product.id}')">🛒 Add To Cart</button>
        <button class="primary-btn" onclick="openProductModal('${product.id}')">View Details</button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const productsBox = $("products-container");
  const featuredBox = $("featured-products");
  const empty = `<div class="empty-state"><h2>📦</h2><h3>No Products Found</h3><p>Try another search or category.</p></div>`;

  if (productsBox) {
    productsBox.innerHTML = state.products.length ? state.products.map(createProductCard).join("") : empty;
  }
  if (featuredBox) {
    featuredBox.innerHTML = state.products.slice(0, 4).map(createProductCard).join("");
  }
  if ($("product-count")) $("product-count").textContent = state.products.length;
}

function searchProducts(value) {
  state.search = value.toLowerCase().trim();
  loadProducts();
}

function setCategory(category) {
  state.category = category.toLowerCase();
  $$(".category-btn").forEach(b => b.classList.remove("active"));
  event.target.closest(".category-btn").classList.add("active");
  loadProducts();
}

function openProductModal(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  state.selectedProduct = product;
  $("modal-image").src = product.imageUrl || "images/default-product.png";
  $("modal-name").textContent = product.name;
  $("modal-description").textContent = product.description || "No description available";
  $("modal-price").textContent = formatPrice(product.price);
  $("product-modal").classList.remove("hidden");
}

function closeProductModal() {
  $("product-modal").classList.add("hidden");
}

/* ---------- SELL FORM ---------- */

function setupSellForm() {
  const form = $("sell-form");
  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!state.token) {
      showToast("❌ You must be logged in as a seller");
      return;
    }
    try {
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          name: $("product-name").value,
          price: Number($("product-price").value),
          category: $("product-category").value,
          imageUrl: $("product-image").value,
          description: $("product-description").value,
          stockQty: 10
        })
      });
      form.reset();
      showToast("✅ Product published");
      showPage("home");
      loadProducts();
    } catch (err) {
      showToast("❌ " + err.message);
    }
  });
}

/* ---------- CART ---------- */

async function loadCart() {
  if (!state.token) {
    state.cart = { items: [] };
    renderCart();
    return;
  }
  try {
    state.cart = await apiRequest("/cart");
    renderCart();
  } catch (err) {
    console.warn("Cart load failed", err);
  }
}

async function addToCart(productId) {
  if (!state.token) {
    showToast("❌ Please log in first");
    showPage("account");
    return;
  }
  try {
    await apiRequest("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity: 1 })
    });
    showToast("🛒 Added to cart");
    loadCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

async function changeQuantity(cartItemId, newQty) {
  try {
    if (newQty <= 0) return removeFromCart(cartItemId);
    await apiRequest("/cart/items/" + cartItemId, {
      method: "PUT",
      body: JSON.stringify({ quantity: newQty })
    });
    loadCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

async function removeFromCart(cartItemId) {
  try {
    await apiRequest("/cart/items/" + cartItemId, { method: "DELETE" });
    showToast("🗑 Removed");
    loadCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

function getCartSummary() {
  const items = state.cart.items || [];
  const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
  const delivery = subtotal > 2000 ? 0 : 50;
  return { subtotal, delivery, total: subtotal + delivery };
}

function updateCartCount() {
  const items = state.cart.items || [];
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  if ($("cart-count")) $("cart-count").textContent = count;
}

function renderCart() {
  const box = $("cart-items");
  if (!box) return;
  const items = state.cart.items || [];

  box.innerHTML = items.length
    ? items.map(item => `
      <div class="cart-item">
        <div>
          <h4>${item.product.name}</h4>
          <p>${formatPrice(item.product.price)}</p>
        </div>
        <div class="cart-controls">
          <button onclick="changeQuantity('${item.id}', ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
          <button onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-state"><h3>🛒 Cart Empty</h3><p>Your shopping journey starts here.</p></div>`;

  const summary = getCartSummary();
  if ($("cart-total")) {
    $("cart-total").innerHTML = `Subtotal: ${formatPrice(summary.subtotal)}<br>Delivery: ${formatPrice(summary.delivery)}<hr>Total: ${formatPrice(summary.total)}`;
  }
  updateCartCount();
}

function openCart() {
  $("cart-panel")?.classList.remove("hidden");
}

function closeCart() {
  $("cart-panel")?.classList.add("hidden");
}

/* ---------- CHECKOUT ---------- */

async function checkout() {
  if (!state.token) {
    showToast("❌ Please log in first");
    return;
  }
  if (!(state.cart.items || []).length) {
    showToast("🛒 Cart is empty");
    return;
  }
  try {
    const order = await apiRequest("/orders", { method: "POST" });
    showToast("✅ Order placed! Order #" + order.id.slice(0, 8));
    state.cart = { items: [] };
    renderCart();
    closeCart();
  } catch (err) {
    showToast("❌ " + err.message);
  }
}

/* ---------- EVENTS + INIT ---------- */

function setupNav() {
  $$("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => showPage(btn.dataset.page));
  });
}

function setupModalEvents() {
  $("close-modal")?.addEventListener("click", closeProductModal);
  $("modal-cart")?.addEventListener("click", () => {
    if (state.selectedProduct) addToCart(state.selectedProduct.id);
    closeProductModal();
  });
}

function setupCartEvents() {
  $("open-cart")?.addEventListener("click", openCart);
  $("close-cart")?.addEventListener("click", closeCart);
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupSellForm();
  setupModalEvents();
  setupCartEvents();
  showPage("home");
  renderAccount();
  loadProducts();
  loadCart();
  console.log("🛒 Horn Market frontend started");
});

window.signup = signup;
window.login = login;
window.logout = logout;
window.searchProducts = searchProducts;
window.setCategory = setCategory;
window.addToCart = addToCart;
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.editProduct = editProduct;
