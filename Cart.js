
/* ========================================
   DEDICATED CART PAGE LOGIC ENGINE (cart.js)
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadCartPageList();
});

function loadCartPageList() {
    const listContainer = document.getElementById("cartPageItemsList");
    const subtotalDisplay = document.getElementById("summarySubtotal");
    const totalDisplay = document.getElementById("summaryTotal");

    if (!listContainer) return;

    // Fetch live shopping data values from local storage
    const cartItems = getFromStorage("cart") || [];

    if (cartItems.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <p style="color: var(--text-light); font-size: 1.1rem; margin-bottom: 20px;">Your shopping cart is currently empty.</p>
                <a href="index.html" class="btn">Explore Marketplace Products</a>
            </div>
        `;
        if (subtotalDisplay) subtotalDisplay.textContent = "$0.00";
        if (totalDisplay) totalDisplay.textContent = "$0.00";
        return;
    }

    let calculationSum = 0;

    // Render active row item nodes safely onto the viewport template markup
    listContainer.innerHTML = cartItems.map((product, index) => {
        calculationSum += Number(product.price || 0);
        
        // Safety layout checking rule protection for price values strings formatting
        const itemPriceFormatted = typeof formatPrice === "function" ? formatPrice(product.price) : `$${product.price}`;

        return `
            <div class="cart-page-item">
                <img src="${product.image || 'logo.png'}" alt="${product.name}">
                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <span class="price">${itemPriceFormatted}</span>
                </div>
                <button class="cart-remove-action" onclick="deleteItemFromCartPage(${index})">✕ Remove</button>
            </div>
        `;
    }).join("");

    // Output calculated financial details cleanly
    if (subtotalDisplay) subtotalDisplay.textContent = typeof formatPrice === "function" ? formatPrice(calculationSum) : `$${calculationSum}`;
    if (totalDisplay) totalDisplay.textContent = typeof formatPrice === "function" ? formatPrice(calculationSum) : `$${calculationSum}`;
}

function deleteItemFromCartPage(index) {
    let cartItems = getFromStorage("cart") || [];
    
    // Remove selected asset by its array indexing locator link
    cartItems.splice(index, 1);
    saveToStorage("cart", cartItems);

    // Reload calculations and dynamic UI lists structures instantly
    loadCartPageList();
    
    // Sync the header counter notification badge if present
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

function processFinalCheckout() {
    const currentCart = getFromStorage("cart") || [];
    if (currentCart.length === 0) return;

    if (typeof showAlert === "function") {
        showAlert("Order successfully placed! Processing your transaction...", "success");
    } else {
        alert("Order successfully placed! Processing your transaction...");
    }

    // Flush cart clear values upon completion of simulation tracking routines
    removeFromStorage("cart");
    
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}
