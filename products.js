
/* ========================================
   PRODUCTS STATE
======================================== */

let products = [];

/* ========================================
   LOAD PRODUCTS (FROM DATA OR API)
======================================== */

async function loadProducts() {

    try {

        showLoading("productGrid");

        // In future: replace with api.getProducts()
        const response =
            await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        products = await response.json();

        displayProducts(products);

    } catch (error) {

        console.error("Product load error:", error);

        showError("productGrid", "Failed to load products");

    }
}

/* ========================================
   DISPLAY PRODUCTS
======================================== */

function displayProducts(list) {

    const grid =
        document.getElementById("productGrid");

    if (!grid) return;

    grid.innerHTML = "";

    if (!list || list.length === 0) {
        grid.innerHTML = `
            <p class="text-muted">
                No products found
            </p>
        `;
        return;
    }

    list.forEach(product => {
        grid.innerHTML += createProductCard(product);
    });
}

/* ========================================
   PRODUCT CARD TEMPLATE
======================================== */

function createProductCard(product) {

    return `
        <div class="product-card">

            <img
                src="${product.image}"
                alt="${product.name}"
            />

            <h3>${product.name}</h3>

            <p class="price">
                ${formatPrice(product.price)}
            </p>

            <div class="product-actions">

                <button onclick="viewProduct(${product.id})">
                    View
                </button>

                <button onclick="addToCart(${product.id})">
                    Cart
                </button>

            </div>

        </div>
    `;
}

/* ========================================
   VIEW PRODUCT
======================================== */

function viewProduct(id) {

    window.location.href =
        `pages/product.html?id=${id}`;
}

/* ========================================
   GET PRODUCT BY ID
======================================== */

function getProductById(id) {

    return products.find(
        p => p.id === Number(id)
    );
}

/* ========================================
   FEATURED PRODUCTS
======================================== */

function getFeaturedProducts() {

    const featured =
        products.filter(p => p.featured);

    displayProducts(featured);
}

/* ========================================
   CATEGORY FILTER (BRIDGE FOR SEARCH.JS)
======================================== */

function filterCategory(category) {

    const filtered =
        products.filter(product =>
            product.category.toLowerCase() ===
            category.toLowerCase()
        );

    displayProducts(filtered);
}

/* ========================================
   SORTING SYSTEM
======================================== */

function sortProducts(type) {

    let sorted = [...products];

    switch (type) {

        case "low":
            sorted.sort((a, b) => a.price - b.price);
            break;

        case "high":
            sorted.sort((a, b) => b.price - a.price);
            break;

        case "name":
            sorted.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            break;

        case "newest":
            sorted.sort((a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );
            break;
    }

    displayProducts(sorted);
}

/* ========================================
   CART SYSTEM
======================================== */

function addToCart(productId) {

    let cart =
        getFromStorage("cart") || [];

    if (!cart.includes(productId)) {
        cart.push(productId);
    }

    saveToStorage("cart", cart);

    updateCartCount();

    showAlert("Added to cart");
}

/* ========================================
   FAVORITES SYSTEM
======================================== */

function addToFavorites(productId) {

    let favorites =
        getFromStorage("favorites") || [];

    if (!favorites.includes(productId)) {
        favorites.push(productId);
    }

    saveToStorage("favorites", favorites);

    updateFavoritesCount();

    showAlert("Added to favorites");
}

/* ========================================
   REMOVE FAVORITE
======================================== */

function removeFavorite(productId) {

    let favorites =
        getFromStorage("favorites") || [];

    favorites =
        favorites.filter(id => id !== productId);

    saveToStorage("favorites", favorites);

    updateFavoritesCount();
}

/* ========================================
   ERROR HANDLING
======================================== */

function showError(containerId, message) {

    const container =
        document.getElementById(containerId);

    if (!container) return;

    container.innerHTML = `
        <p style="color:red;">
            ${message}
        </p>
    `;
}

/* ========================================
   INIT
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
