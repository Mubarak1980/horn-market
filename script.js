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
// CART SYSTEM
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();
    renderCart();
}

// =========================
// CART UI
// =========================

function updateCartUI() {
    const cartCount = document.querySelector("#cart-count");
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// =========================
// SEARCH
// =========================

function setupSearch() {
    const searchInput = document.getElementById("search-input");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        const cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            const title = card.querySelector("h3").textContent.toLowerCase();
            card.style.display = title.includes(query) ? "block" : "none";
        });
    });
}

// =========================
// ADD TO CART (FIXED EVENT)
// =========================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart")) {

        const card = e.target.closest(".card");
        const id = parseInt(card.getAttribute("data-id"));

        addToCart(id);
    }
});

// =========================
// SPA PAGE SYSTEM
// =========================

function showPage(page) {
    const home = document.getElementById("home-page");
    const cartPage = document.getElementById("cart-page");

    if (!home || !cartPage) return;

    if (page === "home") {
        home.style.display = "block";
        cartPage.style.display = "none";
    }

    if (page === "cart") {
        home.style.display = "none";
        cartPage.style.display = "block";
        renderCart();
    }
}

// =========================
// RENDER CART
// =========================

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");

    if (!cartItems || !totalPrice) return;

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement("div");
        div.innerHTML = `
            <p>${item.name} - $${item.price}</p>
            <button onclick="removeFromCart(${index})">Remove</button>
        `;

        cartItems.appendChild(div);
    });

    totalPrice.textContent = "Total: $" + total;
}

// =========================
// REMOVE FROM CART
// =========================

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCart();
}

// =========================
// INIT
// =========================

updateCartUI();
setupSearch();
