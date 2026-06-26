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
// STATE
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentPage = "home";

// =========================
// CART CORE
// =========================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();

    if (currentPage === "cart") {
        renderCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCart();
}

// =========================
// UI UPDATE
// =========================

function updateCartUI() {
    const cartCount = document.querySelector("#cart-count");
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// =========================
// PAGE SYSTEM (IMPROVED)
// =========================

function showPage(page) {
    const home = document.getElementById("home-page");
    const cartPage = document.getElementById("cart-page");

    if (!home || !cartPage) return;

    currentPage = page;

    if (page === "home") {
        home.style.display = "block";
        cartPage.style.display = "none";

        renderHome();
    }

    if (page === "cart") {
        home.style.display = "none";
        cartPage.style.display = "block";

        renderCart();
    }
}

// =========================
// HOME RENDER (FEATURED LOGIC)
// =========================

function renderHome() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {
        // HOME = show only first 3 products
        if (index < 3) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// =========================
// CART RENDER
// =========================

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");

    if (!cartItems || !totalPrice) return;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
        totalPrice.textContent = "Total: $0";
        return;
    }

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <p>${item.name} - $${item.price}</p>
            <button class="danger" onclick="removeFromCart(${index})">Remove</button>
        `;

        cartItems.appendChild(div);
    });

    totalPrice.textContent = "Total: $" + total;
}

// =========================
// SEARCH (PAGE-AWARE FIX)
// =========================

function setupSearch() {
    const searchInput = document.getElementById("search-input");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();

            const match = title.includes(query);

            // only search in HOME view
            if (currentPage === "home") {
                card.style.display = match ? "block" : "none";
            }
        });
    });
}

// =========================
// CLICK HANDLER
// =========================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart")) {
        const card = e.target.closest(".card");
        const id = parseInt(card.getAttribute("data-id"));

        addToCart(id);
    }
});

// =========================
// INIT
// =========================

updateCartUI();
setupSearch();
renderHome();
