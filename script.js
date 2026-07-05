// =========================
// 1. DATA & INITIALIZATION
// =========================
const defaultProducts = [
    { id: 1, name: "Running Shoes", price: 49, category: "Fashion", image: "https://picsum.photos/600/400?random=1" },
    { id: 2, name: "Smart Watch", price: 99, category: "Electronics", image: "https://picsum.photos/600/400?random=2" },
    { id: 3, name: "Headphones", price: 39, category: "Electronics", image: "https://picsum.photos/600/400?random=3" },
    { id: 4, name: "Laptop", price: 599, category: "Electronics", image: "https://picsum.photos/600/400?random=4" }
];

const state = {
    products: JSON.parse(localStorage.getItem("userProducts")) || defaultProducts,
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    page: "home",
    search: "",
    category: "all",
    drawerOpen: false,
    darkMode: localStorage.getItem("theme") === "dark"
};

// =========================
// 2. CORE HELPERS
// =========================
const el = (id) => document.getElementById(id);
const saveState = () => {
    localStorage.setItem("userProducts", JSON.stringify(state.products));
    localStorage.setItem("cart", JSON.stringify(state.cart));
};

// =========================
// 3. LOGIC FUNCTIONS
// =========================
function addToCart(id) {
    const product = state.products.find(p => p.id === id);
    if (!product) return;
    const item = state.cart.find(i => i.id === id);
    item ? item.qty++ : state.cart.push({ ...product, qty: 1 });
    saveState();
    update();
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart.splice(index, 1);
    saveState();
    update();
}

// =========================
// 4. RENDER ENGINE
// =========================
function update() {
    // Toggle Pages
    const pages = { home: "home-page", products: "products-page", cart: "cart-page", "add-product-page": "add-product-page" };
    Object.keys(pages).forEach(key => {
        const pageEl = el(pages[key]);
        if (pageEl) pageEl.classList.toggle("hidden", state.page !== key);
    });

    // Render Product Lists
    const filtered = state.products.filter(p => 
        (state.category === "all" || p.category === state.category)
    );

    renderList("home-products", filtered.slice(0, 2));
    renderList("all-products", filtered);
    renderCart();
    
    const elCount = el("cart-count");
    if (elCount) elCount.textContent = state.cart.reduce((s, i) => s + i.qty, 0);
}

function renderList(id, list) {
    const container = el(id);
    if (!container) return;
    container.innerHTML = list.map(p => `
        <article class="card" data-id="${p.id}">
            <img src="${p.image}" alt="${p.name}">
            <div class="card-content">
                <h3>${p.name}</h3>
                <p class="price">$${p.price}</p>
                <button class="add-to-cart">Add to Cart</button>
            </div>
        </article>
    `).join("");
}

function renderCart() {
    const box = el("cart-items");
    if (!box) return;
    box.innerHTML = state.cart.map((item, i) => `
        <div class="cart-item">
            <span>${item.name} ($${item.price})</span>
            <button data-action="dec" data-index="${i}">-</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-index="${i}">+</button>
            <button data-action="remove" data-index="${i}">X</button>
        </div>
    `).join("");
}

// =========================
// 5. EVENT LISTENERS
// =========================
document.addEventListener("click", (e) => {
    // Nav
    const nav = e.target.closest("[data-page]");
    if (nav) { e.preventDefault(); state.page = nav.dataset.page; update(); }
    
    // Cart Actions
    if (e.target.closest(".add-to-cart")) addToCart(Number(e.target.closest(".card").dataset.id));
    if (e.target.dataset.action === "inc") changeQty(Number(e.target.dataset.index), 1);
    if (e.target.dataset.action === "dec") changeQty(Number(e.target.dataset.index), -1);
    if (e.target.dataset.action === "remove") { state.cart.splice(Number(e.target.dataset.index), 1); saveState(); update(); }
});

document.addEventListener("submit", (e) => {
    if (e.target.id === "product-form") {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: el("new-p-name").value,
            price: Number(el("new-p-price").value),
            category: el("new-p-category").value,
            image: "https://picsum.photos/600/400?random=" + Date.now()
        };
        state.products.push(newProduct);
        saveState();
        alert("Product Added!");
        state.page = "home";
        update();
    }
});

// Init
update();
