// =========================
// DATA (Source of truth)
// =========================

const products = [
    { id: 1, name: "Running Shoes", price: 49, category: "shoes" },
    { id: 2, name: "Smart Watch", price: 99, category: "electronics" },
    { id: 3, name: "Headphones", price: 39, category: "electronics" },
    { id: 4, name: "Laptop", price: 599, category: "laptops" }
];

// =========================
// STATE
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
// CART ACTIONS (PURE LOGIC)
// =========================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const item = state.cart.find(i => i.id === id);

    if (item) {
        item.qty += 1;
    } else {
        state.cart.push({ ...product, qty: 1 });
    }

    saveCart();
    renderUI();
}

function removeItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    renderUI();
}

function changeQty(index, delta) {
    const item = state.cart[index];
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        state.cart.splice(index, 1);
    }

    saveCart();
    renderUI();
}

// =========================
// NAVIGATION (SPA)
// =========================

function showPage(page) {
    state.page = page;
    renderUI();
}

// =========================
// SEARCH (STATE BASED)
// =========================

function setSearch(value) {
    state.search = value.toLowerCase();
    renderUI();
}

// =========================
// CART UI
// =========================

function updateCartCount() {
    const el = document.getElementById("cart-count");
    if (!el) return;

    const count = state.cart.reduce((sum, i) => sum + i.qty, 0);
    el.textContent = count;
}

// =========================
// FILTERED PRODUCTS (IMPORTANT UPGRADE)
// =========================

function getFilteredProducts() {
    if (!state.search) return products;

    return products.filter(p =>
        p.name.toLowerCase().includes(state.search)
    );
}

// =========================
// RENDER PRODUCTS
// =========================

function renderProducts(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    list.forEach(product => {
        container.innerHTML += `
            <article class="card" data-id="${product.id}">
                <div class="image-wrapper">
                    <img src="https://picsum.photos/400/300?random=${product.id}">
                </div>

                <div class="card-content">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price}</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </article>
        `;
    });
}

// =========================
// CART RENDER
// =========================

function renderCart() {
    const box = document.getElementById("cart-items");
    const totalEl = document.getElementById("total-price");

    box.innerHTML = "";

    if (state.cart.length === 0) {
        box.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
        totalEl.textContent = "Total: $0";
        return;
    }

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
                <button onclick="changeQty(${index}, -1)">-</button>
                <button onclick="changeQty(${index}, 1)">+</button>
                <button class="danger" onclick="removeItem(${index})">Remove</button>
            </div>
        `;

        box.appendChild(div);
    });

    totalEl.textContent = "Total: $" + total;
}

// =========================
// VIEW RENDER ENGINE (CORE UPGRADE)
// =========================

function renderUI() {

    // pages
    document.getElementById("home-page").style.display =
        state.page === "home" ? "block" : "none";

    document.getElementById("products-page").style.display =
        state.page === "products" ? "block" : "none";

    document.getElementById("cart-page").style.display =
        state.page === "cart" ? "block" : "none";

    // products
    const filtered = getFilteredProducts();

    renderProducts("home-products", filtered.slice(0, 2));
    renderProducts("all-products", filtered);

    // cart
    if (state.page === "cart") {
        renderCart();
    }

    updateCartCount();
}

// =========================
// EVENTS (CLEANED)
// =========================

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
        const id = parseInt(e.target.closest(".card").dataset.id);
        addToCart(id);
    }
});

document.getElementById("search-input").addEventListener("input", (e) => {
    setSearch(e.target.value);
});

// =========================
// INIT
// =========================

renderUI();
