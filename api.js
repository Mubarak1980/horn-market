
/* ========================================
   API LAYER (FRONTEND MOCK BACKEND)
   Future: Replace with real server (Node.js / Firebase / Supabase)
======================================== */

const API = {
    /* ========================================
       PRODUCTS
    ======================================== */

    async getProducts() {
        try {
            const res = await fetch("../data/products.json");
            if (!res.ok) throw new Error("Failed to fetch products");
            return await res.json();
        } catch (err) {
            console.error("API getProducts error:", err);
            return [];
        }
    },

    async getProductById(id) {
        const products = await this.getProducts();

        return products.find(
            p => p.id === Number(id)
        );
    },

    /* ========================================
       USERS
    ======================================== */

    getUsers() {
        return getFromStorage("users") || [];
    },

    saveUsers(users) {
        saveToStorage("users", users);
    },

    /* ========================================
       AUTH
    ======================================== */

    login(email, password) {

        const users = this.getUsers();

        return users.find(
            user =>
                user.email === email &&
                user.password === password
        );
    },

    register(userData) {

        const users = this.getUsers();

        const exists = users.find(
            u => u.email === userData.email
        );

        if (exists) {
            return {
                success: false,
                message: "User already exists"
            };
        }

        users.push(userData);

        this.saveUsers(users);

        return {
            success: true,
            message: "User created"
        };
    },

    /* ========================================
       CART
    ======================================== */

    getCart() {
        return getFromStorage("cart") || [];
    },

    addToCart(productId) {

        let cart = this.getCart();

        if (!cart.includes(productId)) {
            cart.push(productId);
        }

        saveToStorage("cart", cart);

        updateCartCount();

        return cart;
    },

    removeFromCart(productId) {

        let cart = this.getCart();

        cart = cart.filter(id => id !== productId);

        saveToStorage("cart", cart);

        updateCartCount();

        return cart;
    },

    clearCart() {
        saveToStorage("cart", []);
        updateCartCount();
    },

    /* ========================================
       FAVORITES
    ======================================== */

    getFavorites() {
        return getFromStorage("favorites") || [];
    },

    addFavorite(productId) {

        let favs = this.getFavorites();

        if (!favs.includes(productId)) {
            favs.push(productId);
        }

        saveToStorage("favorites", favs);

        updateFavoritesCount();

        return favs;
    },

    removeFavorite(productId) {

        let favs = this.getFavorites();

        favs = favs.filter(id => id !== productId);

        saveToStorage("favorites", favs);

        updateFavoritesCount();

        return favs;
    },

    /* ========================================
       ORDERS (FUTURE USE)
    ======================================== */

    getOrders() {
        return getFromStorage("orders") || [];
    },

    createOrder(order) {

        let orders = this.getOrders();

        const newOrder = {
            id: Date.now(),
            ...order,
            createdAt: new Date()
        };

        orders.push(newOrder);

        saveToStorage("orders", orders);

        return newOrder;
    }
};

/* ========================================
   GLOBAL SHORTCUTS (OPTIONAL)
======================================== */

window.api = API;
