/* ========================================
   GLOBAL MARKETPLACE ENGINE (main.js)
======================================== */

/* ========================================
   APP INITIALIZATION
======================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup global storage data defaults if empty
    initializeDatabaseDefaults();

    // 2. Refresh dynamic navigation bar states based on login session
    updateNavbarState();

    // 3. Keep the header cart numeric count updated
    updateCartCount();
    updateFavoritesCount();
    
    // 4. Run interactive UI features
    updateCopyrightYear();
    setupSmoothScroll();
    setupBackToTop();
    initializeCartClickTrigger();
});

/* ========================================
   DATABASE INITIALIZER DEFAULTS
======================================== */
function initializeDatabaseDefaults() {
    if (!getFromStorage("products")) {
        saveToStorage("products", []);
    }
    if (!getFromStorage("orders")) {
        saveToStorage("orders", []);
    }
}

/* ========================================
   LOCAL STORAGE HELPERS
======================================== */
function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error("Error reading from localStorage:", e);
        return null;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Error writing to localStorage:", e);
    }
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}

/* ========================================
   NAVBAR PROFILE & AUTH MANAGEMENT
======================================== */
function updateNavbarState() {
    const navContainer = document.querySelector(".nav");
    if (!navContainer) return;

    const loggedInUser = getFromStorage("currentUser");

    if (loggedInUser) {
        // If logged in, customize links to show Dashboard and Logout dynamically
        navContainer.innerHTML = `
            <a href="dashboard.html">📊 Dashboard</a>
            <a href="#" class="logout-link" onclick="handleLogout(event)">🚪 Logout</a>
            <a href="#" id="cartButton" style="position: relative; font-weight: 600;">
                🛒 Cart (<span id="cartCount">0</span>)
            </a>
        `;
    }
}

function handleLogout(event) {
    if (event) event.preventDefault();
    removeFromStorage("currentUser");
    
    showAlert("Logged out successfully", "success");
    
    setTimeout(() => {
        window.location.href = "index.html";
    }, 800);
}

/* ========================================
   CART COUNTER & DRAWER DYNAMICS ENGINE
======================================== */
function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (badge) {
        const cart = getFromStorage("cart") || [];
        badge.textContent = cart.length;
    }
}

function updateFavoritesCount() {
    const badge = document.getElementById("favoritesCount");
    if (badge) {
        const favorites = getFromStorage("favorites") || [];
        badge.textContent = favorites.length;
    }
}

function addToCart(product) {
    let cart = getFromStorage("cart") || [];
    cart.push(product);
    saveToStorage("cart", cart);

    updateCartCount();
    showAlert(`${product.name} added to cart!`, "success");
}

function initializeCartClickTrigger() {
    const cartButtonAnchor = document.getElementById("cartCount") ? document.getElementById("cartCount").parentNode : null;
    if (cartButtonAnchor) {
        cartButtonAnchor.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof toggleCartDrawer === "function") {
                toggleCartDrawer();
            }
        });
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    
    if (!drawer) return;
    
    drawer.classList.toggle("open");
    if (overlay) overlay.classList.toggle("open");
    
    if (drawer.classList.contains("open")) {
        renderCartDrawerItems();
    }
}

function renderCartDrawerItems() {
    const container = document.getElementById("cartItemsContainer");
    const subtotalText = document.getElementById("cartSubtotalAmount");
    
    if (!container) return;
    
    const cart = getFromStorage("cart") || [];
    
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-muted" style="text-align:center; padding: 40px 0;">Your cart is completely empty.</p>`;
        if (subtotalText) subtotalText.textContent = "$0.00";
        return;
    }
    
    let subtotalSum = 0;
    
    container.innerHTML = cart.map((product, index) => {
        subtotalSum += Number(product.price || 0);
        return `
            <div class="cart-item-row">
                <img src="${product.image || 'logo.png'}" alt="${product.name}">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <span class="price">${formatPrice(product.price)}</span>
                </div>
                <button class="remove-item-btn" onclick="removeFromCartIndex(${index})">✕ Remove</button>
            </div>
        `;
    }).join("");
    
    if (subtotalText) {
        subtotalText.textContent = formatPrice(subtotalSum);
    }
}

function removeFromCartIndex(index) {
    let cart = getFromStorage("cart") || [];
    cart.splice(index, 1);
    saveToStorage("cart", cart);
    
    updateCartCount();
    renderCartDrawerItems();
    showAlert("Item removed from cart.", "success");
}

function proceedToCheckout() {
    const cart = getFromStorage("cart") || [];
    if (cart.length === 0) return;
    
    showAlert("Thank you! Processing your transaction order...", "success");
    
    removeFromStorage("cart");
    updateCartCount();
    toggleCartDrawer();
}

/* ========================================
   FORMAT PRICE & DATES
======================================== */
function formatPrice(price) {
    return `$${Number(price).toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/* ========================================
   COPYRIGHT YEAR
======================================== */
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll(".current-year");
    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });
}

/* ========================================
   SMOOTH SCROLL & SCROLL TO PRODUCTS
======================================== */
function setupSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#" || targetId === "#cartButton") return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
}

function scrollToProducts() {
    const productsSection = document.getElementById("productGrid") || document.getElementById("productsSection");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ========================================
   BACK TO TOP BUTTON
======================================== */
function setupBackToTop() {
    const button = document.getElementById("backToTop");
    if (!button) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            button.style.display = "block";
        } else {
            button.style.display = "none";
        }
    });
}

function backToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ========================================
   MOBILE MENU
======================================== */
function toggleMobileMenu() {
    const nav = document.querySelector(".nav");
    if (nav) nav.classList.toggle("active");
}

/* ========================================
   GLOBAL NOTIFICATION ALERT SYSTEM
======================================= */
function showAlert(message, type = "success") {
    let alertBox = document.getElementById("alertBox");
    
    if (!alertBox) {
        alertBox = document.createElement("div");
        alertBox.id = "alertBox";
        alertBox.style.position = "fixed";
        alertBox.style.top = "20px";
        alertBox.style.right = "20px";
        alertBox.style.zIndex = "9999";
        document.body.appendChild(alertBox);
    }

    const notification = document.createElement("div");
    notification.className = `alert alert-${type}`;
    notification.style.marginBottom = "10px";
    notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    notification.style.padding = "12px 24px";
    notification.style.borderRadius = "8px";
    notification.style.fontWeight = "600";
    notification.style.transition = "opacity 0.4s ease";
    
    if (type === "success") {
        notification.style.background = "#dcfce7";
        notification.style.color = "#166534";
        notification.style.borderLeft = "4px solid #16a34a";
    } else {
        notification.style.background = "#fee2e2";
        notification.style.color = "#991b1b";
        notification.style.borderLeft = "4px solid #dc2626";
    }

    notification.textContent = message;
    alertBox.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => { notification.remove(); }, 400);
    }, 2500);
}

/* ========================================
   PAGE READY BACKUP ACTIONS
======================================== */
window.addEventListener("load", () => {
    updateCartCount();
    updateFavoritesCount();
});
