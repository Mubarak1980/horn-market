/* ========================================
   APP INITIALIZATION
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    console.log("Horn Market Initialized");

    updateCopyrightYear();
    setupSmoothScroll();
    setupBackToTop();
    
    // Modern UI Sync: Triggers navbar updates on page load if a user is logged in
    if (typeof updateAuthUI === "function") {
        updateAuthUI();
    }
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
   SMOOTH SCROLL
======================================== */

function setupSmoothScroll() {

    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            e.preventDefault();

            const target = document.querySelector(targetId);

            if (target) {
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

    });

}

/* ========================================
   SCROLL TO PRODUCTS
======================================== */

function scrollToProducts() {
    // Fixed: Looks directly for your main product grid container item
    const productsSection =
        document.getElementById("productGrid") || document.getElementById("productsSection");

    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* ========================================
   BACK TO TOP BUTTON
======================================== */

function setupBackToTop() {

    const button =
        document.getElementById("backToTop");

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

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

/* ========================================
   MOBILE MENU
======================================== */

function toggleMobileMenu() {

    const nav =
        document.querySelector(".nav");

    if (!nav) return;

    nav.classList.toggle("active");

}

/* ========================================
   LOADING STATE
======================================== */

function showLoading(elementId) {

    const element =
        document.getElementById(elementId);

    if (!element) return;

    element.innerHTML = `
        <div class="loading" style="text-align: center; padding: 40px; font-weight: bold; color: #555;">
            Loading Products...
        </div>
    `;

}

function hideLoading() {
    console.log("Loading complete");
}

/* ========================================
   ALERT SYSTEM
======================================== */

function showAlert(message, type = "success") {

    const alert = document.createElement("div");

    alert.className = `alert alert-${type}`;

    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);

}

/* ========================================
   FORMAT PRICE
======================================== */

function formatPrice(price) {

    return `$${Number(price).toLocaleString()}`;

}

/* ========================================
   FORMAT DATE
======================================== */

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}

/* ========================================
   LOCAL STORAGE HELPERS
======================================== */

function saveToStorage(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}

function getFromStorage(key) {

    const item =
        localStorage.getItem(key);

    return item
        ? JSON.parse(item)
        : null;

}

// Fixed missing helper function that auth.js depends on to log out
function removeFromStorage(key) {
    localStorage.removeItem(key);
}

/* ========================================
   FAVORITES COUNTER
======================================== */

function updateFavoritesCount() {

    const favorites =
        getFromStorage("favorites") || [];

    const badge =
        document.getElementById(
            "favoritesCount"
        );

    if (badge) {
        badge.textContent =
            favorites.length;
    }

}

/* ========================================
   CART COUNTER
======================================== */

function updateCartCount() {

    const cart =
        getFromStorage("cart") || [];

    const badge =
        document.getElementById(
            "cartCount"
        );

    if (badge) {
        badge.textContent =
            cart.length;
    }

}

/* ========================================
   PAGE READY ACTIONS
======================================== */

window.addEventListener("load", () => {

    updateCartCount();
    updateFavoritesCount();

});
