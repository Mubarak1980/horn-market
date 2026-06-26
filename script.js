// =========================
// DATA
// =========================
const products = [
    { id: 1, name: "Running Shoes", price: 49 },
    { id: 2, name: "Smart Watch", price: 99 },
    { id: 3, name: "Headphones", price: 39 },
    { id: 4, name: "Laptop", price: 599 }
];

const state = {
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    page: "home",
    search: "",
    drawerOpen: false,
    darkMode: localStorage.getItem("theme") === "dark"
};

const el = (id) => document.getElementById(id);

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(state.cart));
}

// =========================
// CART LOGIC
// =========================
function addToCart(id) {
    const product = products.find(p => p.id === id);
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
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) state.cart.splice(index, 1);
    saveCart();
    render();
}

// =========================
// RENDER ENGINE
// =========================
function renderCartUI(box, totalEl, emptyEl) {
    if (!box) return;
    box.innerHTML = "";
    
    if (state.cart.length === 0) {
        if (emptyEl) emptyEl.classList.remove("hidden");
        if (totalEl) totalEl.textContent = "Total: $0";
        return;
    }
    if (emptyEl) emptyEl.classList.add("hidden");

    let total = 0;
    state.cart.forEach((item, index) => {
        total += item.price * item.qty;
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div><strong>${item.name}</strong><br>$${item.price} × ${item.qty} = <b>$${item.price * item.qty}</b></div>
            <div style="display:flex; gap:8px;">
                <button data-action="dec" data-index="${index}">-</button>
                <button data-action="inc" data-index="${index}">+</button>
                <button class="danger" data-action="remove" data-index="${index}">Remove</button>
            </div>
        `;
        box.appendChild(div);
    });
    if (totalEl) totalEl.textContent = `Total: $${total}`;
}

function render() {
    // Page visibility
    ["home", "products", "cart"].forEach(p => {
        el(`${p}-page`).style.display = state.page === p ? "block" : "none";
    });

    // Product lists
    const filtered = state.search ? products.filter(p => p.name.toLowerCase().includes(state.search)) : products;
    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    // Cart updates
    renderCartUI(el("cart-items"), el("total-price"), el("cart-empty"));
    if (state.drawerOpen) renderCartUI(el("drawer-items"), el("drawer-total"), null);
    
    const count = state.cart.reduce((s, i) => s + i.qty, 0);
    el("cart-count").textContent = count;
}

function renderProducts(id, list) {
    const container = el(id);
    if (!container) return;
    container.innerHTML = list.map(p => `
        <article class="card" data-id="${p.id}">
            <h3>${p.name}</h3><p>$${p.price}</p>
            <button class="add-to-cart">Add to Cart</button>
        </article>`).join("");
}

// =========================
// EVENTS
// =========================
document.addEventListener("click", (e) => {
    // Navigation
    const nav = e.target.closest("[data-page]");
    if (nav) {
        state.page = nav.dataset.page;
        state.drawerOpen = false; // Close drawer when switching pages
        el("cart-drawer").classList.add("hidden");
        el("overlay").classList.add("hidden");
        render();
        return;
    }

    // Cart Actions
    const action = e.target.dataset.action;
    const index = parseInt(e.target.dataset.index);
    if (action === "inc") changeQty(index, 1);
    if (action === "dec") changeQty(index, -1);
    if (action === "remove") removeItem(index);

    // Drawer Toggle
    if (e.target.closest(".cart-link")) {
        e.preventDefault();
        state.drawerOpen = !state.drawerOpen;
        el("cart-drawer").classList.toggle("hidden", !state.drawerOpen);
        el("overlay").classList.toggle("hidden", !state.drawerOpen);
        render();
    }
});

el("search-input")?.addEventListener("input", (e) => { state.search = e.target.value.toLowerCase(); render(); });
el("theme-toggle")?.addEventListener("click", () => { state.darkMode = !state.darkMode; document.body.classList.toggle("dark"); render(); });

render();
