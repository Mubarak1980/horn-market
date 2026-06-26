// =========================
// DATA
// =========================

const products = [
    { id: 1, name: "Running Shoes", price: 49, category: "shoes" },
    { id: 2, name: "Smart Watch", price: 99, category: "electronics" },
    { id: 3, name: "Headphones", price: 39, category: "electronics" },
    { id: 4, name: "Laptop", price: 599, category: "laptops" }
];

// =========================
// STATE (single source of truth)
// =========================

const state = {
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    page: "home",
    search: ""
};

// =========================
// STORAGE
// =========================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(state.cart));
}

// =========================
// CART LOGIC
// =========================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = state.cart.find(i => i.id === id);

    if (existing) {
        existing.qty += 1;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }

    saveCart();
    render();
}

function removeItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    render();
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        state.cart.splice(index, 1);
    }

    saveCart();
    render();
}

// =========================
// NAVIGATION
// =========================

function showPage(page) {
    state.page = page;
    render();
}

// =========================
// SEARCH STATE
// =========================

function setSearch(value) {
    state.search = value.trim().toLowerCase();
    render();
}

// =========================
// FILTER PRODUCTS
// =========================

function getProducts() {
    if (!state.search) return products;

    return products.filter(p =>
        p.name.toLowerCase().includes(state.search)
    );
}

// =========================
// SAFE RENDER HELPERS
// =========================

function el(id) {
    return document.getElementById(id);
}

// =========================
// PRODUCTS RENDER
// =========================

function renderProducts(containerId, list) {
    const container = el(containerId);
    if (!container) return;

    container.innerHTML = list.map(product => `
        <article class="card" data-id="${product.id}">
            <div class="image-wrapper">
                <img src="https://picsum.photos/400/300?random=${product.id}" alt="${product.name}">
            </div>

            <div class="card-content">
                <h3>${product.name}</h3>
                <p class="price">$${product.price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </article>
    `).join("");
}

// =========================
// CART RENDER (FIXED EMPTY STATE)
// =========================

function renderCart() {
    const box = el("cart-items");
    const totalEl = el("total-price");
    const emptyEl = el("cart-empty");

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

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} × ${item.qty} = <b>$${itemTotal}</b>
            </div>

            <div style="display:flex; gap:8px;">
                <button data-action="dec" data-index="${index}">-</button>
                <button data-action="inc" data-index="${index}">+</button>
                <button class="danger" data-action="remove" data-index="${index}">Remove</button>
            </div>
        `;

        box.appendChild(div);
    });

    totalEl.textContent = "Total: $" + total;
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
// VIEW RENDER ENGINE
// =========================

function render() {

    const home = el("home-page");
    const productsPage = el("products-page");
    const cartPage = el("cart-page");

    if (!home || !productsPage || !cartPage) return;

    home.style.display = state.page === "home" ? "block" : "none";
    productsPage.style.display = state.page === "products" ? "block" : "none";
    cartPage.style.display = state.page === "cart" ? "block" : "none";

    const filtered = getProducts();

    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    if (state.page === "cart") {
        renderCart();
    }

    updateCartCount();
}

// =========================
// EVENTS (NO INLINE ONCLICK)
// =========================

// navigation
document.addEventListener("click", (e) => {

    const nav = e.target.closest("[data-page]");
    if (nav) {
        showPage(nav.dataset.page);
        return;
    }

    const btn = e.target.closest(".add-to-cart");
    if (btn) {
        const id = parseInt(btn.closest(".card").dataset.id);
        addToCart(id);
        return;
    }

    const action = e.target.dataset.action;

    if (action) {
        const index = parseInt(e.target.dataset.index);

        if (action === "inc") changeQty(index, 1);
        if (action === "dec") changeQty(index, -1);
        if (action === "remove") removeItem(index);
    }
});

// search
const searchInput = el("search-input");

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        setSearch(e.target.value);
    });
}

// =========================
// INIT
// =========================

render();
