/* ========================================
   SEARCH & FILTER STATE
======================================== */

let currentSearchTerm = "";
let currentCategory = "all";
let currentSortType = "default"; // Tracks active sort to sync with filtering

/* ========================================
   SEARCH PRODUCTS
======================================== */

function searchProducts() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    currentSearchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    applyFilters();
    renderSuggestions(); // Triggers the suggestion dropdown UI
}

/* ========================================
   LIVE SEARCH
======================================== */

function initializeLiveSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        () => {
            searchProducts();
        }
    );

    // Hide suggestions dropdown if user clicks away
    document.addEventListener("click", (e) => {
        const suggestionBox = document.getElementById("searchSuggestionsBox");
        if (suggestionBox && !searchInput.contains(e.target) && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = "none";
        }
    });
}

/* ========================================
   FILTER CATEGORY
======================================== */

function setCategory(category) {

    currentCategory = category;

    applyFilters();
}

/* ========================================
   APPLY FILTERS & ACTIVE SORT COMBINED
======================================== */

function applyFilters() {

    let filteredProducts = [...products];

    /* Search Filter */
    if (currentSearchTerm !== "") {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(currentSearchTerm) ||
            (product.category || "").toLowerCase().includes(currentSearchTerm)
        );
    }

    /* Category Filter */
    if (currentCategory !== "all") {
        filteredProducts = filteredProducts.filter(product =>
            (product.category || "").toLowerCase() === currentCategory.toLowerCase()
        );
    }

    /* Execute Current Active Sort Rule on Filtered Data */
    if (currentSortType === "low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSortType === "high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSortType === "name") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortType === "newest") {
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    displayProducts(filteredProducts);
}

/* ========================================
   MODERN SORT HOOKS (FIXED BUG)
======================================== */

function setSortType(type) {
    currentSortType = type;
    applyFilters();
}

// Keeping your old legacy functions mapped to the fixed logic engine so links don't break
function sortPriceLowToHigh() { setSortType("low"); }
function sortPriceHighToLow() { setSortType("high"); }
function sortByName() { setSortType("name"); }
function sortNewest() { setSortType("newest"); }

/* ========================================
   RESET FILTERS
======================================== */

function resetFilters() {

    currentSearchTerm = "";
    currentCategory = "all";
    currentSortType = "default";

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {
        searchInput.value = "";
    }

    const suggestionBox = document.getElementById("searchSuggestionsBox");
    if (suggestionBox) suggestionBox.style.display = "none";

    displayProducts(products);
}

/* ========================================
   SEARCH SUGGESTIONS DATA GENERATOR
======================================== */

function getSearchSuggestions() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return [];

    const query = searchInput.value.trim().toLowerCase();

    if (query.length < 2) return [];

    return products
        .filter(product => product.name.toLowerCase().includes(query))
        .slice(0, 5);
}

/* ========================================
   RENDER SUGGESTIONS DROPDOWN (NEW MODERN UI HUBS)
======================================== */

function renderSuggestions() {
    const searchInput = document.getElementById("searchInput");
    let suggestionBox = document.getElementById("searchSuggestionsBox");
    
    if (!searchInput) return;
    
    // Dynamically build the container under input if your HTML template doesn't have it yet
    if (!suggestionBox) {
        suggestionBox = document.createElement("div");
        suggestionBox.id = "searchSuggestionsBox";
        suggestionBox.className = "search-suggestions-container";
        searchInput.parentNode.style.position = "relative"; // Form element positioning hook
        searchInput.parentNode.appendChild(suggestionBox);
    }

    const matches = getSearchSuggestions();

    if (matches.length === 0) {
        suggestionBox.style.display = "none";
        return;
    }

    const query = searchInput.value.trim().toLowerCase();
    suggestionBox.innerHTML = "";
    suggestionBox.style.display = "block";

    matches.forEach(product => {
        const itemRow = document.createElement("div");
        itemRow.className = "suggestion-row";
        itemRow.style.padding = "10px 15px";
        itemRow.style.cursor = "pointer";
        itemRow.style.borderBottom = "1px solid #f1f5f9";
        
        // Highlights characters matching what the user typed live
        const highlightedName = highlightMatch(product.name, query);
        itemRow.innerHTML = `<strong>${highlightedName}</strong> <span style="float:right; color:#2563eb;">$${product.price}</span>`;
        
        itemRow.addEventListener("click", () => {
            searchInput.value = product.name;
            currentSearchTerm = product.name.toLowerCase();
            suggestionBox.style.display = "none";
            applyFilters();
        });

        suggestionBox.appendChild(itemRow);
    });
}

/* ========================================
   HIGHLIGHT MATCH
======================================== */

function highlightMatch(text, query) {

    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark style='background:#fef08a; padding:0 2px; border-radius:3px;'>$1</mark>");
}

/* ========================================
   INITIALIZATION
======================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeLiveSearch();
});
