/* ========================================
   AUTH STATE
======================================== */

let currentUser = null;

/* ========================================
   SIGNUP
======================================== */

function registerUser() {

    const name =
        document.getElementById("name")?.value;

    const email =
        document.getElementById("email")?.value;

    const phone =
        document.getElementById("phone")?.value;

    const password =
        document.getElementById("password")?.value;

    const confirmPassword =
        document.getElementById("confirmPassword")?.value;

    if (!name || !email || !password) {
        showAlert("Please fill all required fields", "error");
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Passwords do not match", "error");
        return;
    }

    let users = getFromStorage("users") || [];

    const userExists = users.find(
        user => user.email === email
    );

    if (userExists) {
        showAlert("User already exists", "error");
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        createdAt: new Date()
    };

    users.push(newUser);

    saveToStorage("users", users);

    showAlert("Account created successfully", "success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

/* ========================================
   LOGIN
======================================== */

function loginUser() {

    const email =
        document.getElementById("email")?.value;

    const password =
        document.getElementById("password")?.value;

    if (!email || !password) {
        showAlert("Enter email and password", "error");
        return;
    }

    const users =
        getFromStorage("users") || [];

    const user =
        users.find(
            u =>
                u.email === email &&
                u.password === password
        );

    if (!user) {
        showAlert("Invalid credentials", "error");
        return;
    }

    currentUser = user;

    saveToStorage("currentUser", user);

    showAlert("Login successful", "success");

    setTimeout(() => {
        window.location.href = "../index.html";
    }, 1000);
}

/* ========================================
   LOGOUT
======================================== */

function logoutUser() {

    removeFromStorage("currentUser");

    currentUser = null;

    showAlert("Logged out successfully", "success");

    setTimeout(() => {
        window.location.href = "../index.html";
    }, 800);
}

/* ========================================
   GET CURRENT USER
======================================== */

function getCurrentUser() {

    if (currentUser) return currentUser;

    currentUser = getFromStorage("currentUser");

    return currentUser;
}

/* ========================================
   CHECK AUTH STATUS
======================================== */

function isLoggedIn() {

    return getCurrentUser() !== null;
}

/* ========================================
   PROTECT PAGE
======================================== */

function requireAuth() {

    if (!isLoggedIn()) {

        showAlert(
            "Please login first",
            "error"
        );

        setTimeout(() => {
            window.location.href =
                "../pages/login.html";
        }, 1000);
    }
}

/* ========================================
   UPDATE UI BASED ON AUTH
======================================== */

function updateAuthUI() {

    const user = getCurrentUser();

    const loginLink =
        document.querySelector("a[href='login.html']");

    const signupLink =
        document.querySelector("a[href='signup.html']");

    if (user) {

        if (loginLink) loginLink.style.display = "none";
        if (signupLink) signupLink.style.display = "none";

        const profileLink =
            document.querySelector("a[href='profile.html']");

        if (profileLink) {
            profileLink.textContent = user.name;
        }
    }
}

/* ========================================
   INIT AUTH
======================================== */

document.addEventListener("DOMContentLoaded", () => {

    getCurrentUser();
    updateAuthUI();

});
