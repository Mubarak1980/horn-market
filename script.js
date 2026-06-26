// =========================
// DATA (future backend replacement)
// =========================

const products = [
    {
        id: 1,
        name: "Running Shoes",
        price: 49,
        category: "shoes"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 99,
        category: "electronics"
    },
    {
        id: 3,
        name: "Headphones",
        price: 39,
        category: "electronics"
    },
    {
        id: 4,
        name: "Laptop",
        price: 599,
        category: "laptops"
    }
];

// =========================
// CART SYSTEM
// =========================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Save cart
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (!product) return;

    cart.push(product);
    saveCart();

    updateCartUI();
}

// =========================
// CART UI (basic counter)
// =========================

function updateCartUI() {
    const cartCount = document.querySelector("#cart-count");

    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// =========================
// SEARCH FUNCTIONALITY
// =========================

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const title = card.querySelector("h3").textContent.toLowerCase();

        if (title.includes(query)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
});

// =========================
// ADD TO CART BUTTONS
// =========================

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn")) {

        const card = e.target.closest(".card");
        const id = parseInt(card.getAttribute("data-id"));

        addToCart(id);
    }
});

// =========================
// INIT
// =========================

updateCartUI();
