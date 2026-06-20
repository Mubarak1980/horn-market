/* ========================================
   PRODUCTS STATE & RECOVERS
======================================== */

let products = [];

// Helper functions fallback safeguards (in case main.js has timing issues loading)
function safeGetFromStorage(key) {
    try {
        if (typeof getFromStorage === "function") return getFromStorage(key);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error("Storage read error:", e);
        return null;
    }
}

function safeSaveToStorage(key, data) {
    try {
        if (typeof saveToStorage === "function") {
            saveToStorage(key, data);
            return;
        }
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Storage write error:", e);
    }
}

/* ========================================
   LOAD PRODUCTS (FROM DATA OR API)
======================================== */

async function loadProducts() {
    try {
        if (typeof showLoading === "function") {
            showLoading("productGrid");
        }

        let jsonProducts = [];
        
        // 1. Fetch from JSON database file with complete error shielding
        try {
            const response = await fetch("products.json");
            if (response.ok) {
                jsonProducts = await response.json();
            } else {
                console.warn("products.json not found or empty, checking local storage memory next.");
            }
        } catch (e) {
            console.warn("Network fetch skipped or offline. Falling back to storage layers.");
        }

        // 2. Load custom listings created by users from localStorage
        let localProducts = safeGetFromStorage("products") || [];

        // 3. Fallback Core Starter Kit: If BOTH files and database caches are empty, load default electronics
        if (jsonProducts.length === 0 && localProducts.length === 0) {
            const starterProducts = [
                { 
                    id: 101, 
                    name: "iPhone 15 Pro Max", 
                    price: 1199, 
                    category: "electronics", 
                    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60", 
                    featured: true, 
                    description: "256GB, Titanium Black, Brand New condition. Factory unlocked and certified authentic distribution.",
                    createdAt: new Date().toISOString() 
                },
                { 
                    id: 102, 
                    name: "Wireless Bluetooth Headphones", 
                    price: 89, 
                    category: "electronics", 
                    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60", 
                    featured: true, 
                    description: "High fidelity noise cancellation audio driver system with premium comfort memory-foam earcups.",
                    createdAt: new Date().toISOString() 
                },
                { 
                    id: 103, 
                    name: "Premium Laptop Core i7", 
                    price: 850, 
                    category: "electronics", 
                    image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&auto=format&fit=crop&q=60", 
                    featured: true, 
                    description: "16GB RAM, 512GB SSD Fast NVMe Storage. Perfect portable computing powerhouse for local developers, students, and businesses.",
                    createdAt: new Date().toISOString() 
                }
            ];
            // CRITICAL FIX: Save them immediately so product.html can view them directly on page loads!
            safeSaveToStorage("products", starterProducts);
            products = starterProducts;
        } else {
            // Merge files array data and local updates together cleanly
            products = [...jsonProducts, ...localProducts];
            // Force save to local sync stream cache
            safeSaveToStorage("products", products);
        }

        displayProducts(products);

    } catch (error) {
        console.error("Product load runtime error:", error);
        
        // Final fallback: attempt emergency retrieval from local memory cache
        let emergencyProducts = safeGetFromStorage("products") || [];
        if (emergencyProducts.length > 0) {
            products = emergencyProducts;
            displayProducts(products);
        } else {
            showError("productGrid", "Failed to load products marketplace catalog registry.");
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
            <p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1rem;">
                No active marketplace items found matching that selection.
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
    // Safety check formatting metrics to keep pricing text looking crisp
    const safePriceText = typeof formatPrice === "function" ? formatPrice(product.price) : `$${product.price}`;
    
    return `
        <div class="product-card">
            <img src="${product.image || 'logo.png'}" alt="${product.name || 'Marketplace Item'}" style="object-fit: contain; background: #f8fafc; padding: 10px; height: 200px; width: 100%;"/>
            <h3>${product.name || 'Unnamed Product'}</h3>
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
   VIEW PRODUCT ROUTER PARAMETERS
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
   CATEGORY FILTER (BRIDGED EVENTS SYSTEM)
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
   SORTING ENGINE SYSTEM
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
   CART DATA SYSTEM OBJECT INJECTION
======================================== */

function addToCart(productId) {
    let cart = safeGetFromStorage("cart") || [];
    
    // Find item data matching index tracking markers
    const selectedItem = products.find(p => p.id === Number(productId));
    
    if (!selectedItem) return;

    // Duplication check validation
    const alreadyInCart = cart.some(item => item.id === Number(productId));

    if (!alreadyInCart) {
        // Push the complete product object maps payload directly so checkout systems can read it instantly!
        cart.push(selectedItem);
        safeSaveToStorage("cart", cart);
        
        if (typeof showAlert === "function") showAlert("Added to cart successfully!");
        else alert("Added to cart successfully!");
    } else {
        if (typeof showAlert === "function") showAlert("Item is already in your cart summary checklist.");
        else alert("Item is already in your cart summary checklist.");
    }

    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

/* ========================================
   FAVORITES ENGINE SYSTEM
======================================== */

function addToFavorites(productId) {
    let favorites = safeGetFromStorage("favorites") || [];

    if (!favorites.includes(productId)) {
        favorites.push(productId);
    }

    safeSaveToStorage("favorites", favorites);
    if (typeof updateFavoritesCount === "function") {
        updateFavoritesCount();
    }
    if (typeof showAlert === "function") showAlert("Added to favorites");
}

function removeFavorite(productId) {
    let favorites = safeGetFromStorage("favorites") || [];
    favorites = favorites.filter(id => id !== productId);
    safeSaveToStorage("favorites", favorites);
    if (typeof updateFavoritesCount === "function") {
        updateFavoritesCount();
    }
}

/* ========================================
   ERROR MODAL RENDERING WINDOWS
======================================== */

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <p style="color:var(--danger-color, #dc2626); text-align:center; padding:40px; grid-column: 1/-1; font-weight: 600; font-size:1.1rem;">
            ⚠️ ${message}
        </p>
    `;
}

/* ========================================
   INDEX.HTML EVENTS BRIDGE UTILITIES
======================================== */

function setCategory(categoryName) {
    filterCategory(categoryName);
}

function setSortType(sortValue) {
    sortProducts(sortValue);
}

/* ========================================
   INITIALIZER ENGINE LIFE PIPELINE
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
