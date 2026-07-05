// =========================
// DATA
// =========================
const products = [
    {
        id: 1,
        name: "Running Shoes",
        price: 49,
        category: "Fashion",
        description: "Lightweight running shoes designed for comfort and daily training.",
        image: "https://picsum.photos/600/400?random=1",
        rating: 4.6,
        stock: 12
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 99,
        category: "Electronics",
        description: "Track health, notifications, and activity with a modern smart watch.",
        image: "https://picsum.photos/600/400?random=2",
        rating: 4.4,
        stock: 8
    },
    {
        id: 3,
        name: "Headphones",
        price: 39,
        category: "Electronics",
        description: "High-quality sound with deep bass and noise isolation.",
        image: "https://picsum.photos/600/400?random=3",
        rating: 4.2,
        stock: 20
    },
    {
        id: 4,
        name: "Laptop",
        price: 599,
        category: "Electronics",
        description: "Powerful laptop for work, study, and development.",
        image: "https://picsum.photos/600/400?random=4",
        rating: 4.8,
        stock: 5
    }
];

// =========================
// STATE
// =========================
const state = {
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    orders: JSON.parse(localStorage.getItem("orders")) || [],
    page: "home",
    search: "",
    category: "all",
    drawerOpen: false,
    darkMode: localStorage.getItem("theme") === "dark",
    selectedProduct: null
};

// =========================
// HELPERS
// =========================
const el = (id) => document.getElementById(id);

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(state.cart));
}

function saveOrders() {
    localStorage.setItem("orders", JSON.stringify(state.orders));
}

function findProduct(id) {
    return products.find(p => p.id === id);
}

// =========================
// CART LOGIC (ROBUST)
// =========================
function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;

    const item = state.cart.find(i => i.id === id);

    if (item) {
        item.qty++;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }

    saveCart();
    update();
}

function removeItem(index) {
    if (index < 0 || index >= state.cart.length) return;

    state.cart.splice(index, 1);
    saveCart();
    update();
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        state.cart.splice(index, 1);
    }

    saveCart();
    update();
}

function clearCart() {
    state.cart = [];
    saveCart();
    update();
}

// =========================
// FILTERING (SEARCH + CATEGORY)
// =========================
function getFilteredProducts() {
    return products.filter(p => {
        const matchSearch =
            !state.search ||
            p.name.toLowerCase().includes(state.search);

        const matchCategory =
            state.category === "all" ||
            p.category === state.category;

        return matchSearch && matchCategory;
    });
}

// =========================
// CART COUNT
// =========================
function updateCartCount() {
    const elCount = el("cart-count");
    if (!elCount) return;

    elCount.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

// =========================
// PRODUCT RENDER
// =========================
function renderProducts(containerId, list) {
    const container = el(containerId);
    if (!container) return;

    if (!list.length) {
        container.innerHTML = `<p class="empty-cart">No products found</p>`;
        return;
    }

    container.innerHTML = list.map(p => `
        <article class="card" data-id="${p.id}">
            <div class="image-wrapper">
                <img src="${p.image}" alt="${p.name}">
            </div>

            <div class="card-content">
                <small>${p.category}</small>
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>

                <p style="font-size:12px;color:#64748b;">
                    ⭐ ${p.rating} | Stock: ${p.stock}
                </p>

                <button class="add-to-cart">Add to Cart</button>
                <button class="view-details" style="margin-top:8px;background:#0f172a;">
                    View Details
                </button>
            </div>
        </article>
    `).join("");
}

// =========================
// CART RENDER (FIXED RELIABILITY)
// =========================
function renderCart(containerId, totalId, emptyId) {
    const box = el(containerId);
    const totalEl = el(totalId);
    const emptyEl = el(emptyId);

    if (!box || !totalEl) return;

    box.innerHTML = "";

    if (state.cart.length === 0) {
        if (emptyEl) emptyEl.classList.remove("hidden");
        totalEl.textContent = "Total: $0";
        return;
    }

    if (emptyEl) emptyEl.classList.add("hidden");

    let total = 0;

    state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} × ${item.qty} = <b>$${itemTotal}</b>
            </div>

            <div style="display:flex;gap:8px;">
                <button data-action="dec" data-index="${index}">-</button>
                <button data-action="inc" data-index="${index}">+</button>
                <button data-action="remove" data-index="${index}" class="danger">Remove</button>
            </div>
        `;

        box.appendChild(row);
    });

    totalEl.textContent = "Total: $" + total;
}

// =========================
// MODAL
// =========================
function openProductModal(product) {
    state.selectedProduct = product;

    const modal = el("product-modal");
    const body = el("modal-body");

    if (!modal || !body || !product) return;

    body.innerHTML = `
        <img src="${product.image}" style="width:100%;border-radius:10px;margin-bottom:12px;" />
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p><strong>$${product.price}</strong></p>
        <p>⭐ ${product.rating}</p>

        <button id="modal-add-cart">Add to Cart</button>
    `;

    modal.classList.remove("hidden");
}

function closeModal() {
    el("product-modal")?.classList.add("hidden");
}

// =========================
// CHECKOUT / ORDER SYSTEM (FIXED)
// =========================
function goToCheckout() {
    state.page = "checkout";
    update();
}

function placeOrder() {
    if (!state.cart.length) return;

    const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

    const order = {
        id: Date.now(),
        items: structuredClone(state.cart),
        total,
        date: new Date().toISOString()
    };

    state.orders.push(order);
    saveOrders();

    state.cart = [];
    saveCart();

    alert("Order placed successfully!");

    state.page = "home";
    update();
}

// =========================
// DRAWER
// =========================
function openDrawer() {
    state.drawerOpen = true;
    el("cart-drawer")?.classList.remove("hidden");
    el("overlay")?.classList.remove("hidden");
    update();
}

function closeDrawer() {
    state.drawerOpen = false;
    el("cart-drawer")?.classList.add("hidden");
    el("overlay")?.classList.add("hidden");
}

// =========================
// THEME
// =========================
function applyTheme() {
    document.body.classList.toggle("dark", state.darkMode);
}

function toggleTheme() {
    state.darkMode = !state.darkMode;
    localStorage.setItem("theme", state.darkMode ? "dark" : "light");
    applyTheme();
}

// =========================
// MAIN RENDER ENGINE (CLEAN FIX)
// =========================
function update() {
    const home = el("home-page");
    const productsPage = el("products-page");
    const cartPage = el("cart-page");

    if (!home || !productsPage || !cartPage) return;

    home.style.display = state.page === "home" ? "block" : "none";
    productsPage.style.display = state.page === "products" ? "block" : "none";
    cartPage.style.display = state.page === "cart" || state.page === "checkout" ? "block" : "none";

    const filtered = getFilteredProducts();

    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    if (state.page === "checkout") {
        renderCheckout();
    } else {
        renderCart("cart-items", "total-price", "cart-empty");
    }

    if (state.drawerOpen) {
        renderCart("drawer-items", "drawer-total", null);
    }

    updateCartCount();
}

// =========================
// CHECKOUT UI
// =========================
function renderCheckout() {
    const container = el("cart-page");

    const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);

    container.innerHTML = `
        <div class="container">
            <h2>Checkout</h2>

            ${state.cart.map(i => `
                <p>${i.name} × ${i.qty} = $${i.price * i.qty}</p>
            `).join("")}

            <h3>Total: $${total}</h3>

            <button id="place-order">Place Order</button>
        </div>
    `;
}

// =========================
// EVENTS (FIXED + CLEAN)
// =========================
document.addEventListener("click", (e) => {

    const nav = e.target.closest("[data-page]");
    if (nav) {
        state.page = nav.dataset.page;
        closeDrawer();
        update();
        return;
    }

    const add = e.target.closest(".add-to-cart");
    if (add) {
        const id = Number(add.closest(".card").dataset.id);
        addToCart(id);
        return;
    }

    const view = e.target.closest(".view-details");
    if (view) {
        const id = Number(view.closest(".card").dataset.id);
        openProductModal(findProduct(id));
        return;
    }

    if (e.target.id === "modal-add-cart") {
        addToCart(state.selectedProduct.id);
        closeModal();
        return;
    }

    if (e.target.id === "product-modal") closeModal();

    const action = e.target.dataset.action;
    if (action) {
        const index = Number(e.target.dataset.index);

        if (action === "inc") changeQty(index, 1);
        if (action === "dec") changeQty(index, -1);
        if (action === "remove") removeItem(index);
        return;
    }

    if (e.target.classList.contains("checkout-btn")) {
        goToCheckout();
        return;
    }

    if (e.target.id === "place-order") {
        placeOrder();
        return;
    }

    if (e.target.closest(".cart-link")) {
        e.preventDefault();
        openDrawer();
        return;
    }

    if (e.target.id === "overlay") closeDrawer();
});

// =========================
// INIT
// =========================
applyTheme();
update();
