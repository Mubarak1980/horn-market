// =========================
// DATA
// =========================
const products = [
    { id: 1, name: "Running Shoes", price: 49, category: "Fashion", description: "Lightweight running shoes designed for comfort and daily training.", image: "https://picsum.photos/600/400?random=1", rating: 4.6, stock: 12 },
    { id: 2, name: "Smart Watch", price: 99, category: "Electronics", description: "Track health, notifications, and activity with a modern smart watch.", image: "https://picsum.photos/600/400?random=2", rating: 4.4, stock: 8 },
    { id: 3, name: "Headphones", price: 39, category: "Electronics", description: "High-quality sound with deep bass and noise isolation.", image: "https://picsum.photos/600/400?random=3", rating: 4.2, stock: 20 },
    { id: 4, name: "Laptop", price: 599, category: "Electronics", description: "Powerful laptop for work, study, and development.", image: "https://picsum.photos/600/400?random=4", rating: 4.8, stock: 5 }
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
const saveCart = () => localStorage.setItem("cart", JSON.stringify(state.cart));
const saveOrders = () => localStorage.setItem("orders", JSON.stringify(state.orders));
const findProduct = (id) => products.find(p => p.id === id);

// =========================
// CORE LOGIC
// =========================
function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;
    const item = state.cart.find(i => i.id === id);
    item ? item.qty++ : state.cart.push({ ...product, qty: 1 });
    saveCart();
    update();
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart.splice(index, 1);
    saveCart();
    update();
}

function removeItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    update();
}

// =========================
// RENDER ENGINE (IMPROVED)
// =========================
function update() {
    // 1. Toggle Page Visibility using CSS class 'hidden'
    const pages = { home: el("home-page"), products: el("products-page"), cart: el("cart-page") };
    Object.keys(pages).forEach(key => {
        if (!pages[key]) return;
        state.page === key ? pages[key].classList.remove("hidden") : pages[key].classList.add("hidden");
    });

    // 2. Render content
    const filtered = products.filter(p => 
        (!state.search || p.name.toLowerCase().includes(state.search.toLowerCase())) &&
        (state.category === "all" || p.category === state.category)
    );

    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    if (state.page === "checkout") {
        renderCheckout();
    } else {
        renderCart("cart-items", "total-price", "cart-empty");
    }

    if (state.drawerOpen) renderCart("drawer-items", "drawer-total", null);
    
    // Update count
    const elCount = el("cart-count");
    if (elCount) elCount.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

function renderProducts(id, list) {
    const container = el(id);
    if (!container) return;
    container.innerHTML = list.length ? list.map(p => `
        <article class="card" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}">
            <div class="card-content">
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <button class="add-to-cart">Add to Cart</button>
                <button class="view-details">Details</button>
            </div>
        </article>
    `).join("") : "<p>No products found</p>";
}

function renderCart(listId, totalId, emptyId) {
    const box = el(listId), totalEl = el(totalId), emptyEl = el(emptyId);
    if (!box || !totalEl) return;
    
    box.innerHTML = state.cart.map((item, i) => `
        <div class="cart-item">
            <span>${item.name} ($${item.price})</span>
            <button data-action="dec" data-index="${i}">-</button> <span>${item.qty}</span>
            <button data-action="inc" data-index="${i}">+</button>
            <button data-action="remove" data-index="${i}">X</button>
        </div>
    `).join("");
    
    const total = state.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    totalEl.textContent = `Total: $${total}`;
    if (emptyEl) state.cart.length === 0 ? emptyEl.classList.remove("hidden") : emptyEl.classList.add("hidden");
}

// =========================
// EVENT DELEGATION
// =========================
document.addEventListener("click", (e) => {
    // Navigation
    const nav = e.target.closest("[data-page]");
    if (nav) {
        e.preventDefault();
        state.page = nav.dataset.page;
        update();
        return;
    }

    // Actions
    if (e.target.closest(".add-to-cart")) addToCart(Number(e.target.closest(".card").dataset.id));
    if (e.target.dataset.action === "inc") changeQty(Number(e.target.dataset.index), 1);
    if (e.target.dataset.action === "dec") changeQty(Number(e.target.dataset.index), -1);
    if (e.target.dataset.action === "remove") removeItem(Number(e.target.dataset.index));
    
    // Cart Drawer Toggle
    if (e.target.closest(".cart-link")) { e.preventDefault(); state.drawerOpen = true; update(); }
    if (e.target.id === "close-cart" || e.target.id === "overlay") { state.drawerOpen = false; update(); }
});

// Initialization
applyTheme();
update();
