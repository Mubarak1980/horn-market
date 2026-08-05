/* ==========================================================
   HORNMARKET APP ENGINE V2
   PART 1 - CORE ENGINE
========================================================== */

/* =========================
   APP STATE
========================= */

const state = {

    products: JSON.parse(localStorage.getItem("products")) || [],

    cart: JSON.parse(localStorage.getItem("cart")) || [],

    favorites: JSON.parse(localStorage.getItem("favorites")) || [],

    page: "home",

    category: "all",

    search: "",

    darkMode:
        JSON.parse(localStorage.getItem("darkMode")) || false

};



/* =========================
   SHORTCUTS
========================= */

const $ = id => document.getElementById(id);

const $$ = selector => document.querySelectorAll(selector);



/* =========================
   STORAGE
========================= */

function save(){

    localStorage.setItem(
        "products",
        JSON.stringify(state.products)
    );

    localStorage.setItem(
        "cart",
        JSON.stringify(state.cart)
    );

    localStorage.setItem(
        "favorites",
        JSON.stringify(state.favorites)
    );

    localStorage.setItem(
        "darkMode",
        JSON.stringify(state.darkMode)
    );

}



/* =========================
   PAGE ROUTER
========================= */

function showPage(page){

    state.page = page;

    $$(".page").forEach(section=>{

        section.classList.add("hidden");

    });

    const current = $(page + "-page");

    if(current){

        current.classList.remove("hidden");

    }

    highlightNavigation();

}



/* =========================
   NAVIGATION ACTIVE BUTTON
========================= */

function highlightNavigation(){

    $$("[data-page]").forEach(button=>{

        if(button.dataset.page===state.page){

            button.classList.add("active");

        }

        else{

            button.classList.remove("active");

        }

    });

}



/* =========================
   DARK MODE
========================= */

function applyTheme(){

    if(state.darkMode){

        document.body.classList.add("dark");

    }

    else{

        document.body.classList.remove("dark");

    }

}



/* =========================
   CART COUNTER
========================= */

function updateCartCounter(){

    const count = state.cart.reduce(

        (sum,item)=>sum+item.qty,

        0

    );

    if($("cart-count")){

        $("cart-count").textContent = count;

    }

}



/* =========================
   MAIN RENDER
========================= */

function render(){

    applyTheme();

    showPage(state.page);

    renderProducts();

    renderCart();

    updateCartCounter();

}



/* =========================
   UTILITIES
========================= */

function generateID(){

    return Date.now() + Math.floor(Math.random()*1000);

}



function formatPrice(price){

    return Number(price).toLocaleString()+" Birr";

}


/* ==========================================================
   PART 2 - PRODUCT ENGINE
========================================================== */

/* =========================
   ADD PRODUCT
========================= */

function addProduct(product){

    const newProduct = {

        id: generateID(),

        name: product.name.trim(),

        price: Number(product.price),

        category: product.category.trim(),

        image: product.image.trim(),

        description: product.description || "",

        location: product.location || "Ethiopia",

        date: new Date().toISOString()

    };

    state.products.unshift(newProduct);

    save();

    render();

}



/* =========================
   SEARCH
========================= */

function searchProducts(text){

    state.search = text.toLowerCase();

    render();

}



/* =========================
   CATEGORY
========================= */

function setCategory(category){

    state.category = category;

    render();

}



/* =========================
   FILTER PRODUCTS
========================= */

function getProducts(){

    return state.products.filter(product=>{

        const matchSearch =

            product.name
            .toLowerCase()
            .includes(state.search);

        const matchCategory =

            state.category==="all"

            ||

            product.category===state.category;

        return matchSearch && matchCategory;

    });

}



/* =========================
   FAVORITES
========================= */

function toggleFavorite(id){

    const index =
        state.favorites.indexOf(id);

    if(index===-1){

        state.favorites.push(id);

    }

    else{

        state.favorites.splice(index,1);

    }

    save();

    render();

}



/* =========================
   PRODUCT CARD
========================= */

function productCard(product){

    const favorite =

        state.favorites.includes(product.id)

        ? "❤️"

        : "🤍";

    return `

<article class="card">

<img
src="${product.image || "https://via.placeholder.com/400x300"}"
alt="${product.name}"
loading="lazy"
onerror="this.src='https://via.placeholder.com/400x300'"
>

<div class="card-content">

<div class="card-top">

<span class="category">

${product.category}

</span>

<button
class="favorite-btn"
onclick="toggleFavorite(${product.id})">

${favorite}

</button>

</div>

<h3>

${product.name}

</h3>

<p class="price">

${formatPrice(product.price)}

</p>

<p class="location">

📍 ${product.location}

</p>

<button
class="add-to-cart"
onclick="addToCart(${product.id})">

Add to Cart

</button>

</div>

</article>

`;

}



/* =========================
   EMPTY STATE
========================= */

function emptyProducts(){

    return `

<div class="empty-state">

<h2>

📦

</h2>

<h3>

No Products Yet

</h3>

<p>

Publish the first product on HornMarket.

</p>

</div>

`;

}



/* =========================
   RENDER PRODUCTS
========================= */

function renderProducts(){

    const products =
        getProducts();

    const productsBox =
        $("products-container");

    const featuredBox =
        $("featured-products");

    if(productsBox){

        if(products.length){

            productsBox.innerHTML =

                products
                .map(productCard)
                .join("");

        }

        else{

            productsBox.innerHTML =
                emptyProducts();

        }

    }

    if(featuredBox){

        featuredBox.innerHTML =

            products
            .slice(0,4)
            .map(productCard)
            .join("");

    }

    if($("product-count")){

        $("product-count").textContent =
            state.products.length;

    }

}


/* ==========================================================
   PART 3 - CART + EVENTS + INITIALIZATION
========================================================== */

/* =========================
   CART SYSTEM
========================= */

function addToCart(id){

    const product = state.products.find(p=>p.id===id);

    if(!product) return;

    const item = state.cart.find(p=>p.id===id);

    if(item){

        item.qty++;

    }

    else{

        state.cart.push({

            ...product,

            qty:1

        });

    }

    save();

    render();

}



function changeQty(id,value){

    const item = state.cart.find(p=>p.id===id);

    if(!item) return;

    item.qty += value;

    if(item.qty<=0){

        removeCart(id);

        return;

    }

    save();

    render();

}



function removeCart(id){

    state.cart = state.cart.filter(p=>p.id!==id);

    save();

    render();

}



/* =========================
   CART RENDER
========================= */

function renderCart(){

    const box = $("cart-items");

    if(!box) return;

    if(state.cart.length===0){

        box.innerHTML = `

        <div class="empty-state">

            <h3>Your cart is empty</h3>

            <p>Add products to begin shopping.</p>

        </div>

        `;

    }

    else{

        box.innerHTML = state.cart.map(item=>`

        <div class="cart-item">

            <div>

                <h4>${item.name}</h4>

                <p>${formatPrice(item.price)}</p>

            </div>

            <div class="cart-controls">

                <button onclick="changeQty(${item.id},-1)">−</button>

                <span>${item.qty}</span>

                <button onclick="changeQty(${item.id},1)">+</button>

                <button onclick="removeCart(${item.id})">

                    Remove

                </button>

            </div>

        </div>

        `).join("");

    }

    const total = state.cart.reduce(

        (sum,item)=>sum+(item.price*item.qty),

        0

    );

    if($("cart-total")){

        $("cart-total").textContent =

            "Total: " + formatPrice(total);

    }

}



/* =========================
   SELL FORM
========================= */

$("sell-form")?.addEventListener(

    "submit",

    e=>{

        e.preventDefault();

        addProduct({

            name:$("product-name").value,

            price:$("product-price").value,

            category:$("product-category").value,

            image:$("product-image").value,

            description:$("product-description")?.value || "",

            location:"Ethiopia"

        });

        e.target.reset();

        showPage("home");

    }

);



/* =========================
   SEARCH
========================= */

$("search")?.addEventListener(

    "input",

    e=>{

        searchProducts(e.target.value);

    }

);



/* =========================
   CATEGORY BUTTONS
========================= */

document.querySelectorAll(".category-btn")

.forEach(button=>{

    button.addEventListener("click",()=>{

        document

        .querySelectorAll(".category-btn")

        .forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

        const category =

            button.dataset.category || "all";

        setCategory(category);

    });

});



/* =========================
   PAGE NAVIGATION
========================= */

document.addEventListener(

    "click",

    e=>{

        const nav = e.target.closest("[data-page]");

        if(!nav) return;

        showPage(nav.dataset.page);

    }

);



/* =========================
   CART PANEL
========================= */

$("open-cart")?.addEventListener(

    "click",

    ()=>{

        $("cart-panel")?.classList.remove("hidden");

    }

);



$("close-cart")?.addEventListener(

    "click",

    ()=>{

        $("cart-panel")?.classList.add("hidden");

    }

);



/* =========================
   START APPLICATION
========================= */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        render();

    }

);

