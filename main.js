/* ========================================
   GLOBAL MARKETPLACE ENGINE (main.js)
======================================== */

/* ========================================
   APP INITIALIZATION
======================================== */
document.addEventListener("DOMContentLoaded", () => {
    initializeDatabaseDefaults();
    updateNavbarState();
    updateCartCount();
    updateFavoritesCount();
    updateCopyrightYear();
    setupSmoothScroll();
    setupBackToTop();
    initializeCartClickTrigger();
});

/* ========================================
   DATABASE INITIALIZER DEFAULTS
======================================== */
function initializeDatabaseDefaults() {
    const defaults = { products: [], orders: [], cart: [], favorites: [] };
    Object.keys(defaults).forEach(key => {
        if (localStorage.getItem(key) === null) {
            saveToStorage(key, defaults[key]);
        }
    });
}

/* ========================================
   LOCAL STORAGE HELPERS
======================================== */
function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error(`Error reading ${key}:`, e);
        return null;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error writing ${key}:`, e);
    }
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}

/* ========================================
   NAVBAR & AUTH MANAGEMENT
======================================== */
function updateNavbarState() {
    const navContainer = document.querySelector(".nav");
    if (!navContainer) return;

    const user = getFromStorage("currentUser");
    navContainer.innerHTML = user ? `
        <a href="index.html">🏠 Home</a>
        <a href="dashboard.html">📊 Dashboard</a>
        <a href="#" class="logout-link" onclick="handleLogout(event)">🚪 Logout</a>
        <a href="#" id="cartButton">🛒 Cart (<span id="cartCount">0</span>)</a>
    ` : `
        <a href="index.html">🏠 Home</a>
        <a href="login.html">🔑 Login</a>
        <a href="#" id="cartButton">🛒 Cart (<span id="cartCount">0</span>)</a>
    `;
}

function handleLogout(event) {
    if (event) event.preventDefault();
    removeFromStorage("currentUser");
    showAlert("Logged out successfully", "success");
    setTimeout(() => window.location.href = "index.html", 800);
}

/* ========================================
   CART ENGINE
======================================== */
function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (badge) badge.textContent = (getFromStorage("cart") || []).length;
}

function updateFavoritesCount() {
    const badge = document.getElementById("favoritesCount");
    if (badge) badge.textContent = (getFromStorage("favorites") || []).length;
}

function initializeCartClickTrigger() {
    const cartBtn = document.getElementById("cartButton");
    if (cartBtn) {
        cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            toggleCartDrawer();
        });
    }
}

function toggleCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    
    if (!drawer) {
        window.location.href = "cart.html";
        return;
    }
    
    drawer.classList.toggle("open");
    if (overlay) overlay.classList.toggle("open");
    if (drawer.classList.contains("open")) renderCartDrawerItems();
}

function renderCartDrawerItems() {
    const container = document.getElementById("cartItemsContainer");
    const subtotalText = document.getElementById("cartSubtotalAmount");
    if (!container) return;
    
    const cart = getFromStorage("cart") || [];
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-muted" style="text-align:center; padding: 20px;">Cart is empty.</p>`;
        if (subtotalText) subtotalText.textContent = "$0.00";
        return;
    }
    
    let sum = 0;
    container.innerHTML = cart.map((p, i) => {
        sum += Number(p.price || 0);
        return `
            <div class="cart-item-row" style="display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #eee;">
                <img src="${p.image || 'logo.png'}" style="width: 40px; height: 40px; object-fit: contain;">
                <div style="flex: 1;"><strong>${p.name}</strong><br>${formatPrice(p.price)}</div>
                <button onclick="removeFromCartIndex(${i})" style="color:red; border:none; background:none; cursor:pointer;">✕</button>
            </div>`;
    }).join("");
    
    if (subtotalText) subtotalText.textContent = formatPrice(sum);
}

function removeFromCartIndex(index) {
    let cart = getFromStorage("cart") || [];
    cart.splice(index, 1);
    saveToStorage("cart", cart);
    updateCartCount();
    renderCartDrawerItems();
}

// CRITICAL IMPROVEMENT: Save order to allow dashboard revenue calculation
function proceedToCheckout() {
    const cart = getFromStorage("cart") || [];
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
    const orders = getFromStorage("orders") || [];
    
    orders.push({ 
        id: Date.now(), 
        total: total, 
        items: cart, 
        date: new Date().toISOString() 
    });
    
    saveToStorage("orders", orders);
    removeFromStorage("cart");
    updateCartCount();
    
    showAlert("Transaction successful!", "success");
    toggleCartDrawer();
    
    setTimeout(() => window.location.href = "index.html", 1500);
}

/* ========================================
   UTILS
======================================== */
function formatPrice(p) { return `$${Number(p || 0).toFixed(2)}`; }

function showAlert(msg, type = "success") {
    let box = document.getElementById("alertBox");
    if (!box) {
        box = document.createElement("div");
        box.id = "alertBox";
        box.style.cssText = "position:fixed; top:20px; right:20px; z-index:9999;";
        document.body.appendChild(box);
    }
    const n = document.createElement("div");
    n.className = `alert alert-${type}`;
    n.style.cssText = "padding:12px 24px; margin-bottom:10px; border-radius:8px; font-weight:600; background:" + (type === 'success' ? '#dcfce7' : '#fee2e2');
    n.textContent = msg;
    box.appendChild(n);
    setTimeout(() => n.remove(), 2500);
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener("click", e => {
            const target = document.querySelector(a.getAttribute("href"));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
        });
    });
}

function setupBackToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener("scroll", () => btn.style.display = window.scrollY > 400 ? "block" : "none");
}

function updateCopyrightYear() {
    document.querySelectorAll(".current-year").forEach(e => e.textContent = new Date().getFullYear());
}
