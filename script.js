// =========================
// 1. DATA & INITIALIZATION
// =========================
const state = {
    // Start with empty array to ensure only user-registered products exist
    products: JSON.parse(localStorage.getItem("userProducts")) || [],
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    page: "home",
    category: "all"
};

// =========================
// 2. CORE HELPERS & PERSISTENCE
// =========================
const el = (id) => document.getElementById(id);

function saveState() {
    localStorage.setItem("userProducts", JSON.stringify(state.products));
    localStorage.setItem("cart", JSON.stringify(state.cart));
    update(); // Re-render whenever state changes
}

// =========================
// 3. LOGIC (ACTIONS)
// =========================
function addToCart(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    const item = state.cart.find(i => i.id === id);
    item ? item.qty++ : state.cart.push({ ...product, qty: 1 });
    saveState();
}

function updateQty(index, delta) {
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) state.cart.splice(index, 1);
    saveState();
}

function removeCartItem(index) {
    state.cart.splice(index, 1);
    saveState();
}

// =========================
// 4. RENDER ENGINE (UI)
// =========================
function update() {
    // Page Routing
    const pages = ["home-page", "products-page", "cart-page", "add-product-page"];
    pages.forEach(id => {
        const pageEl = el(id);
        if (pageEl) pageEl.classList.toggle("hidden", id !== `${state.page}-page`);
    });

    // Render Product Lists
    const filtered = state.products.filter(p => state.category === "all" || p.category === state.category);
    renderList("home-products", filtered.slice(0, 4)); // Show 4 latest on home
    renderList("all-products", filtered);

    // Update Cart Display
    const cartBox = el("cart-items");
    if (cartBox) {
        cartBox.innerHTML = state.cart.length ? state.cart.map((item, i) => `
            <div class="cart-item">
                <span>${item.name} - $${item.price}</span>
                <button onclick="updateQty(${i}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="updateQty(${i}, 1)">+</button>
                <button onclick="removeCartItem(${i})">Remove</button>
            </div>
        `).join("") : "<p>Your cart is empty.</p>";
    }
    
    const countEl = el("cart-count");
    if (countEl) countEl.textContent = state.cart.reduce((sum, i) => sum + i.qty, 0);
}

function renderList(id, list) {
    const container = el(id);
    if (!container) return;

    // Handle Empty Catalog State
    if (list.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 2rem;">No products registered yet. <a href="#" data-page="add-product-page" onclick="state.page='add-product-page'; update();">Register the first product!</a></p>`;
        return;
    }

    container.innerHTML = list.map(p => `
        <article class="card">
            <img src="${p.image}" alt="${p.name}">
            <div class="card-content">
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <button class="add-to-cart" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        </article>
    `).join("");
}

// =========================
// 5. EVENT DELEGATION
// =========================
document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-page]");
    if (nav) {
        e.preventDefault();
        state.page = nav.dataset.page;
        update();
    }
});

document.addEventListener("submit", (e) => {
    if (e.target.id === "product-form") {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: el("new-p-name").value,
            price: parseFloat(el("new-p-price").value),
            category: el("new-p-category").value,
            image: "https://picsum.photos/600/400?random=" + Date.now()
        };
        state.products.push(newProduct);
        saveState(); // This calls update() automatically
        alert("Product registered successfully!");
        e.target.reset();
        state.page = "home";
    }
});

// Initialization
update();
