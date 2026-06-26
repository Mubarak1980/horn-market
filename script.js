// =========================
// DATA
// =========================
const products = [
    { id: 1, name: "Running Shoes", price: 49 },
    { id: 2, name: "Smart Watch", price: 99 },
    { id: 3, name: "Headphones", price: 39 },
    { id: 4, name: "Laptop", price: 599 }
];

// =========================
// STATE
// =========================
const state = {
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    page: "home",
    search: "",
    modalProduct: null,
    drawerOpen: false,
    darkMode: localStorage.getItem("theme") === "dark"
};

// =========================
// HELPERS
// =========================
const el = (id) => document.getElementById(id);

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

    if (existing) existing.qty += 1;
    else state.cart.push({ ...product, qty: 1 });

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

    if (item.qty <= 0) state.cart.splice(index, 1);

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
// SEARCH
// =========================
function setSearch(value) {
    state.search = value.trim().toLowerCase();
    render();
}

function getFilteredProducts() {
    if (!state.search) return products;

    return products.filter(p =>
        p.name.toLowerCase().includes(state.search)
    );
}

// =========================
// CART COUNT
// =========================
function updateCartCount() {
    const counter = el("cart-count");
    if (!counter) return;

    counter.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

// =========================
// PRODUCTS RENDER
// =========================
function renderProducts(containerId, list) {
    const container = el(containerId);
    if (!container) return;

    container.innerHTML = list.map(p => `
        <article class="card" data-id="${p.id}">
            <div class="image-wrapper">
                <img src="https://picsum.photos/400/300?random=${p.id}" />
            </div>

            <div class="card-content">
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </article>
    `).join("");
}

// =========================
// ⭐ SINGLE CART RENDER ENGINE (FIX)
// =========================
function renderCartUI(box, totalEl, emptyEl) {
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
// CART PAGE
// =========================
function renderCartPage() {
    renderCartUI(
        el("cart-items"),
        el("total-price"),
        el("cart-empty")
    );
}

// =========================
// CART DRAWER
// =========================
function renderDrawer() {
    renderCartUI(
        el("drawer-items"),
        el("drawer-total"),
        null
    );
}

function openDrawer() {
    state.drawerOpen = true;
    el("cart-drawer")?.classList.remove("hidden");
    el("overlay")?.classList.remove("hidden");
    renderDrawer();
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
// MAIN RENDER ENGINE
// =========================
function render() {

    const home = el("home-page");
    const productsPage = el("products-page");
    const cartPage = el("cart-page");

    if (!home || !productsPage || !cartPage) return;

    home.style.display = state.page === "home" ? "block" : "none";
    productsPage.style.display = state.page === "products" ? "block" : "none";
    cartPage.style.display = state.page === "cart" ? "block" : "none";

    const filtered = getFilteredProducts();

    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    renderCartPage();
    updateCartCount();

    if (state.drawerOpen) {
        renderDrawer();
    }
}

// =========================
// EVENTS
// =========================
document.addEventListener("click", (e) => {

    const nav = e.target.closest("[data-page]");
    if (nav) {
        showPage(nav.dataset.page);
        return;
    }

    const add = e.target.closest(".add-to-cart");
    if (add) {
        const id = parseInt(add.closest(".card").dataset.id);
        addToCart(id);
        return;
    }

    const action = e.target.dataset.action;
    if (action) {
        const index = parseInt(e.target.dataset.index);

        if (action === "inc") changeQty(index, 1);
        if (action === "dec") changeQty(index, -1);
        if (action === "remove") removeItem(index);

        return;
    }

    if (e.target.closest(".cart-link")) {
        e.preventDefault();
        openDrawer();
        return;
    }

    if (e.target.id === "overlay") {
        closeDrawer();
    }
});

// SEARCH
el("search-input")?.addEventListener("input", (e) => {
    setSearch(e.target.value);
});

// THEME
el("theme-toggle")?.addEventListener("click", toggleTheme);

// =========================
// INIT
// =========================
applyTheme();
render();
