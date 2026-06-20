/* ========================================
   PRODUCTS STATE
======================================== */

let products = [];

/* ========================================
   LOAD PRODUCTS (FROM DATA OR API)
======================================== */

async function loadProducts() {
    try {
        if (typeof showLoading === "function") {
            showLoading("productGrid");
        }

        let jsonProducts = [];
        
        // 1. Fetch from JSON file with a fallback guard if the file doesn't exist yet
        try {
            const response = await fetch("products.json");
            if (response.ok) {
                jsonProducts = await response.json();
            } else {
                console.warn("products.json not found or empty, using local database memory.");
            }
        } catch (e) {
            console.warn("Network fetch skipped or failed. Falling back to memory storage.");
        }

        // 2. Load custom listings created by users from localStorage
        let localProducts = getFromStorage("products") || [];

        // 3. Fallback Starter Kit: If BOTH are empty, inject sample electronics items so your page looks great!
        if (jsonProducts.length === 0 && localProducts.length === 0) {
            const starterProducts = [
                { id: 101, name: "iPhone 15 Pro Max", price: 1199, category: "electronics", image: "logo.png", featured: true, createdAt: new Date().toISOString() },
                { id: 102, name: "Wireless Bluetooth Headphones", price: 89, category: "electronics", image: "logo.png", featured: true, createdAt: new Date().toISOString() },
                { id: 103, name: "Premium Laptop Core i7", price: 850, category: "electronics", image: "logo.png", featured: true, createdAt: new Date().toISOString() }
            ];
            saveToStorage("products", starterProducts);
            localProducts = starterProducts;
        }

        // Combine all items cleanly
        products = [...jsonProducts, ...localProducts];
        displayProducts(products);

    } catch (error) {
        console.error("Product load error:", error);
        
        // Final fallback: attempt emergency retrieval
        let localProducts = getFromStorage("products") || [];
        if (localProducts.length > 0) {
            products = localProducts;
            displayProducts(products);
        } else {
            showError("productGrid", "Failed to load products. Please check database file.");
        }
    }
}

/* ========================================
   DISPLAY PRODUCTS
======================================== */

function displayProducts(list) {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    grid.innerHTML = "";

    if (!list || list.length === 0) {
        grid.innerHTML = `
            <p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                No products found matching that filter.
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
    // Safety check for price formatting helper function
    const safePriceText = typeof formatPrice === "function" ? formatPrice(product.price) : `$${product.price}`;
    
    return `
        <div class="product-card">
            <img src="${product.image || 'logo.png'}" alt="${product.name || 'Market Item'}"/>
            <h3>${product.name}</h3>
            <p class="price">
                ${safePriceText}
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
    window.location.href = `product.html?id=${id}`;
}

/* ========================================
   GET PRODUCT BY ID
======================================== */

function getProductById(id) {
    return products.find(p => p.id === Number(id));
}

/* ========================================
   FEATURED PRODUCTS
======================================== */

function getFeaturedProducts() {
    const featured = products.filter(p => p.featured);
    displayProducts(featured);
}

/* ========================================
   CATEGORY FILTER (BRIDGE FOR SEARCH.JS)
======================================== */

function filterCategory(category) {
    if (!category || category.toLowerCase() === 'all' || category.toLowerCase() === 'default') {
        displayProducts(products);
        return;
    }
    const filtered = products.filter(product =>
        product.category && product.category.toLowerCase() === category.toLowerCase()
    );
    displayProducts(filtered);
}

/* ========================================
   SORTING SYSTEM
======================================== */

function sortProducts(type) {
    if (!type || type === 'default') {
        displayProducts(products);
        return;
    }

    let sorted = [...products];

    switch (type) {
        case "low":
            sorted.sort((a, b) => a.price - b.price);
            break;
        case "high":
            sorted.sort((a, b) => b.price - a.price);
            break;
        case "name":
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            break;
        case "newest":
            sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
    }
    displayProducts(sorted);
}

/* ========================================
   CART SYSTEM (UPDATED TO PREVENT DUPLICATION CONFLICTS)
======================================== */

function addToCart(productId) {
    let cart = getFromStorage("cart") || [];
    
    // Find the full item details from our available catalog array
    const selectedItem = products.find(p => p.id === Number(productId));
    
    if (!selectedItem) return;

    // Check if the item object is already inside the cart array list
    const alreadyInCart = cart.some(item => item.id === Number(productId));

    if (!alreadyInCart) {
        // Push the whole product object so cart.html can display its image and name immediately!
        cart.push(selectedItem);
        saveToStorage("cart", cart);
        if (typeof showAlert === "function") showAlert("Added to cart successfully!");
        else alert("Added to cart successfully!");
    } else {
        if (typeof showAlert === "function") showAlert("Item is already in your cart.");
        else alert("Item is already in your cart.");
    }

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

/* ========================================
   FAVORITES SYSTEM
======================================== */

function addToFavorites(productId) {
    let favorites = getFromStorage("favorites") || [];

    if (!favorites.includes(productId)) {
        favorites.push(productId);
    }

    saveToStorage("favorites", favorites);
    if (typeof updateFavoritesCount === "function") {
        updateFavoritesCount();
    }
    showAlert("Added to favorites");
}

/* ========================================
   REMOVE FAVORITE
======================================== */

function removeFavorite(productId) {
    let favorites = getFromStorage("favorites") || [];
    favorites = favorites.filter(id => id !== productId);
    saveToStorage("favorites", favorites);
    if (typeof updateFavoritesCount === "function") {
        updateFavoritesCount();
    }
}

/* ========================================
   ERROR HANDLING
======================================== */

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <p style="color:var(--danger-color); text-align:center; padding:40px; grid-column: 1/-1; font-weight: 600;">
            ${message}
        </p>
    `;
}

/* ========================================
   BRIDGE UTILITIES FOR INDEX.HTML CALLS
======================================== */

function setCategory(categoryName) {
    filterCategory(categoryName);
}

function setSortType(sortValue) {
    sortProducts(sortValue);
}

/* ========================================
   INIT
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
