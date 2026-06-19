
/* ========================================
   SEARCH STATE
======================================== */

let currentSearchTerm = "";
let currentCategory = "all";

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
}

/* ========================================
   FILTER CATEGORY
======================================== */

function setCategory(category) {

    currentCategory = category;

    applyFilters();
}

/* ========================================
   APPLY FILTERS
======================================== */

function applyFilters() {

    let filteredProducts = [...products];

    /* Search Filter */

    if (currentSearchTerm !== "") {

        filteredProducts =
            filteredProducts.filter(product =>

                product.name
                    .toLowerCase()
                    .includes(currentSearchTerm)

                ||

                (product.category || "")
                    .toLowerCase()
                    .includes(currentSearchTerm)

            );

    }

    /* Category Filter */

    if (
        currentCategory !== "all"
    ) {

        filteredProducts =
            filteredProducts.filter(product =>

                product.category
                    .toLowerCase() ===
                currentCategory
                    .toLowerCase()

            );

    }

    displayProducts(filteredProducts);
}

/* ========================================
   RESET FILTERS
======================================== */

function resetFilters() {

    currentSearchTerm = "";
    currentCategory = "all";

    const searchInput =
        document.getElementById("searchInput");

    if (searchInput) {
        searchInput.value = "";
    }

    displayProducts(products);
}

/* ========================================
   SORT PRICE LOW TO HIGH
======================================== */

function sortPriceLowToHigh() {

    const sortedProducts =
        [...products].sort(
            (a, b) =>
                a.price - b.price
        );

    displayProducts(sortedProducts);
}

/* ========================================
   SORT PRICE HIGH TO LOW
======================================== */

function sortPriceHighToLow() {

    const sortedProducts =
        [...products].sort(
            (a, b) =>
                b.price - a.price
        );

    displayProducts(sortedProducts);
}

/* ========================================
   SORT BY NAME
======================================== */

function sortByName() {

    const sortedProducts =
        [...products].sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    displayProducts(sortedProducts);
}

/* ========================================
   SORT NEWEST
======================================== */

function sortNewest() {

    const sortedProducts =
        [...products].sort(
            (a, b) =>
                new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                )
        );

    displayProducts(sortedProducts);
}

/* ========================================
   SEARCH SUGGESTIONS
======================================== */

function getSearchSuggestions() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return [];

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (query.length < 2)
        return [];

    return products
        .filter(product =>
            product.name
                .toLowerCase()
                .includes(query)
        )
        .slice(0, 5);
}

/* ========================================
   HIGHLIGHT MATCH
======================================== */

function highlightMatch(
    text,
    query
) {

    if (!query) return text;

    const regex =
        new RegExp(
            `(${query})`,
            "gi"
        );

    return text.replace(
        regex,
        "<mark>$1</mark>"
    );
}

/* ========================================
   INITIALIZATION
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeLiveSearch();

    }
);
