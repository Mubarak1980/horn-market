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
// SEARCH
// =========================

function setSearch(value) {
    state.search = value.trim().toLowerCase();
    render();
}

// =========================
// FILTER PRODUCTS
// =========================

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

    counter.textContent = state.cart.reduce((sum, i) => sum + i.qty, 0);
}

// =========================
// PRODUCT RENDER
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
// CART RENDER
// =========================

function renderCart() {
    const box = el("cart-items");
    const totalEl = el("total-price");
    const emptyEl = el("cart-empty");

    if (!box || !totalEl) return;

    box.innerHTML = "";

    if (state.cart.length === 0) {
        emptyEl?.classList.remove("hidden");
        totalEl.textContent = "Total: $0";
        return;
    }

    emptyEl?.classList.add("hidden");

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
// MODAL
// =========================

function openModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    state.modalProduct = product;

    const modal = el("product-modal");
    const body = el("modal-body");
    const overlay = el("overlay");

    if (!modal || !body || !overlay) return;

    body.innerHTML = `
        <h2>${product.name}</h2>
        <img src="https://picsum.photos/500/400?random=${product.id}">
        <p class="price">$${product.price}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function closeModal() {
    el("product-modal")?.classList.add("hidden");
    el("overlay")?.classList.add("hidden");
}

// =========================
// CART DRAWER
// =========================

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

function renderDrawer() {
    const box = el("drawer-items");
    const totalEl = el("drawer-total");

    if (!box || !totalEl) return;

    box.innerHTML = "";

    if (state.cart.length === 0) {
        box.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
        totalEl.textContent = "Total: $0";
        return;
    }

    let total = 0;

    state.cart.forEach(item => {
        total += item.price * item.qty;

        box.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    $${item.price} × ${item.qty}
                </div>
            </div>
        `;
    });

    totalEl.textContent = "Total: $" + total;
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
// MAIN RENDER ENGINE (FIXED CORE)
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

    renderCart();
    updateCartCount();
}

// =========================
// EVENTS (CLEAN DELEGATION)
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
        closeModal();
        closeDrawer();
    }

    const card = e.target.closest(".card");
    if (card && !e.target.closest("button")) {
        openModal(parseInt(card.dataset.id));
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
