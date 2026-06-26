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
// CART STATE (NOW WITH QUANTITY)
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =========================
// SAVE CART
// =========================

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// =========================
// ADD TO CART (MERGE LOGIC)
// =========================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();

    if (currentPage === "cart") {
        renderCart();
    }
}

// =========================
// REMOVE ITEM COMPLETELY
// =========================

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    renderCart();
}

// =========================
// CHANGE QUANTITY
// =========================

function changeQty(index, amount) {
    const item = cart[index];
    if (!item) return;

    item.qty += amount;

    if (item.qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCartUI();
    renderCart();
}

// =========================
// CART UI
// =========================

function updateCartUI() {
    const cartCount = document.querySelector("#cart-count");
    if (!cartCount) return;

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;
}

// =========================
// PAGE STATE
// =========================

let currentPage = "home";

function showPage(page) {
    const home = document.getElementById("home-page");
    const cartPage = document.getElementById("cart-page");

    currentPage = page;

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
// SEARCH
// =========================

function setupSearch() {
    const searchInput = document.getElementById("search-input");

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
// CART RENDER (UPDATED)
// =========================

function renderCart() {
    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p class='empty-cart'>Your cart is empty</p>";
        totalPrice.textContent = "Total: $0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                $${item.price} × ${item.qty} = <b>$${itemTotal}</b>
            </div>

            <div style="display:flex; gap:8px;">
                <button onclick="changeQty(${index}, -1)">-</button>
                <button onclick="changeQty(${index}, 1)">+</button>
                <button class="danger" onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;

        cartItems.appendChild(div);
    });

    totalPrice.textContent = "Total: $" + total;
}

// =========================
// INIT
// =========================

updateCartUI();
setupSearch();
