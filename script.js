/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 1/6 - CORE ENGINE
========================================================== */


/* ==========================================================
   APP STATE
========================================================== */

const state = {

    products:
        JSON.parse(localStorage.getItem("products")) || [],

    cart:
        JSON.parse(localStorage.getItem("cart")) || [],

    page: "home",

    search: "",

    category: "all"

};




/* ==========================================================
   DOM SHORTCUTS
========================================================== */

const $ = id => document.getElementById(id);

const $$ = selector => document.querySelectorAll(selector);




/* ==========================================================
   SAVE DATA
========================================================== */

function saveData(){

    localStorage.setItem(
        "products",
        JSON.stringify(state.products)
    );


    localStorage.setItem(
        "cart",
        JSON.stringify(state.cart)
    );

}




/* ==========================================================
   PAGE NAVIGATION
========================================================== */

function showPage(page){

    state.page = page;


    $$(".page").forEach(section=>{

        section.classList.add("hidden");

    });



    const target = $(page + "-page");


    if(target){

        target.classList.remove("hidden");

    }


    updateNavigation();

}





/* ==========================================================
   ACTIVE NAV BUTTON
========================================================== */

function updateNavigation(){


    $$("[data-page]").forEach(button=>{


        if(button.dataset.page === state.page){

            button.classList.add("active");

        }

        else{

            button.classList.remove("active");

        }


    });


}





/* ==========================================================
   CART COUNT
========================================================== */

function updateCartCount(){


    const count = state.cart.reduce(

        (total,item)=> total + item.qty,

        0

    );


    if($("cart-count")){

        $("cart-count").textContent = count;

    }


}





/* ==========================================================
   PRICE FORMAT
========================================================== */

function formatPrice(price){

    return Number(price).toLocaleString() + " Birr";

}





/* ==========================================================
   ID GENERATOR
========================================================== */

function generateID(){

    return Date.now();

}





/* ==========================================================
   MAIN RENDER
========================================================== */

function render(){

    showPage(state.page);

    updateCartCount();

    renderProducts();

    renderCart();

}





/* ==========================================================
   INITIAL START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

    render();

}

);


/* ==========================================================
   END PART 1/6
========================================================== */

/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 2/6 - PRODUCT ENGINE
========================================================== */


/* ==========================================================
   ADD PRODUCT
========================================================== */

function addProduct(data){


    const product = {

        id: generateID(),

        name: data.name.trim(),

        price: Number(data.price),

        category: data.category.trim(),

        image: data.image.trim(),

        description:
        data.description || "No description",

        location:
        "Ethiopia"

    };



    state.products.unshift(product);



    saveData();



    render();

}






/* ==========================================================
   SEARCH PRODUCTS
========================================================== */

function searchProducts(value){


    state.search =
    value.toLowerCase();


    renderProducts();


}






/* ==========================================================
   FILTER CATEGORY
========================================================== */

function setCategory(category){


    state.category =
    category.toLowerCase();



    renderProducts();


}






/* ==========================================================
   GET PRODUCTS
========================================================== */

function getProducts(){


    return state.products.filter(product=>{


        const nameMatch =

        product.name
        .toLowerCase()
        .includes(state.search);



        const categoryMatch =

        state.category === "all"

        ||

        product.category
        .toLowerCase()
        ===
        state.category;



        return nameMatch && categoryMatch;


    });


}







/* ==========================================================
   PRODUCT CARD
========================================================== */

function createProductCard(product){


return `


<article 
class="card"
data-id="${product.id}"
>


<img

src="${product.image || 'https://via.placeholder.com/400x300'}"

alt="${product.name}"

onerror="this.src='https://via.placeholder.com/400x300'"

>



<div class="card-content">


<div class="card-top">


<span class="category">

${product.category}

</span>


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

Add To Cart

</button>



<button

class="primary-btn"

onclick="openProductModal(${product.id})">

View Details

</button>



</div>


</article>


`;

}








/* ==========================================================
   EMPTY PRODUCT MESSAGE
========================================================== */

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

Be the first seller on HornMarket.

</p>


</div>


`;

}







/* ==========================================================
   DISPLAY PRODUCTS
========================================================== */

function renderProducts(){


    const products = getProducts();



    const productsBox =
    $("products-container");



    const featuredBox =
    $("featured-products");





    if(productsBox){


        productsBox.innerHTML =

        products.length

        ?

        products
        .map(createProductCard)
        .join("")


        :

        emptyProducts();


    }





    if(featuredBox){


        featuredBox.innerHTML =

        products
        .slice(0,4)
        .map(createProductCard)
        .join("");


    }





    if($("product-count")){


        $("product-count").textContent =

        state.products.length;


    }


}







/* ==========================================================
   SELL FORM
========================================================== */

function setupSellForm(){


const form = $("sell-form");


if(!form) return;



form.addEventListener(

"submit",

event=>{


event.preventDefault();



addProduct({

name:
$("product-name").value,


price:
$("product-price").value,


category:
$("product-category").value,


image:
$("product-image").value,


description:
$("product-description").value


});



form.reset();



showPage("home");



});


}







/* ==========================================================
   SEARCH EVENT
========================================================== */

function setupSearch(){


const input = $("search");


if(!input) return;



input.addEventListener(

"input",

event=>{


searchProducts(
event.target.value
);


});


}







/* ==========================================================
   CATEGORY BUTTONS
========================================================== */

function setupCategories(){


const buttons =
document.querySelectorAll(".category-btn");



buttons.forEach(button=>{


button.addEventListener(

"click",

()=>{


buttons.forEach(btn=>

btn.classList.remove("active")

);



button.classList.add("active");



const category =

button.textContent
.replace(/[^\w\s]/gi,"")
.trim();



if(category==="All"){

setCategory("all");

}

else{

setCategory(category);

}



});


});


}



/* ==========================================================
   END PART 2/6
========================================================== */


/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 3/6 - CART ENGINE
========================================================== */



/* ==========================================================
   ADD TO CART
========================================================== */

function addToCart(id){


    const product = state.products.find(

        item => item.id === id

    );



    if(!product) return;



    const existing = state.cart.find(

        item => item.id === id

    );



    if(existing){


        existing.qty++;


    }

    else{


        state.cart.push({

            ...product,

            qty:1

        });


    }



    saveData();


    render();


}







/* ==========================================================
   CHANGE QUANTITY
========================================================== */

function changeQuantity(id, amount){


    const item = state.cart.find(

        product => product.id === id

    );



    if(!item) return;



    item.qty += amount;



    if(item.qty <= 0){


        removeFromCart(id);


        return;


    }



    saveData();


    render();


}








/* ==========================================================
   REMOVE FROM CART
========================================================== */

function removeFromCart(id){


    state.cart = state.cart.filter(

        item => item.id !== id

    );



    saveData();


    render();


}







/* ==========================================================
   CART TOTAL
========================================================== */

function getCartTotal(){


    return state.cart.reduce(

        (total,item)=>

        total + (item.price * item.qty),

        0

    );


}







/* ==========================================================
   RENDER CART
========================================================== */

function renderCart(){


    const box = $("cart-items");



    if(!box) return;




    if(state.cart.length === 0){


        box.innerHTML = `


        <div class="empty-state">


        <h3>

        🛒 Cart Empty

        </h3>


        <p>

        Add products to your cart.

        </p>


        </div>


        `;


    }

    else{


        box.innerHTML =

        state.cart.map(item=>`



<div class="cart-item">


<div>


<h4>

${item.name}

</h4>


<p>

${formatPrice(item.price)}

</p>


</div>




<div class="cart-controls">



<button

onclick="changeQuantity(${item.id},-1)">

−

</button>



<span>

${item.qty}

</span>



<button

onclick="changeQuantity(${item.id},1)">

+

</button>




<button

onclick="removeFromCart(${item.id})">

Remove

</button>



</div>



</div>



`).join("");



    }





    if($("cart-total")){


        $("cart-total").textContent =

        "Total: " +

        formatPrice(

            getCartTotal()

        );


    }



}







/* ==========================================================
   OPEN CART
========================================================== */

function openCart(){


    const cart = $("cart-panel");


    if(cart){

        cart.classList.remove("hidden");

    }


}







/* ==========================================================
   CLOSE CART
========================================================== */

function closeCart(){


    const cart = $("cart-panel");


    if(cart){

        cart.classList.add("hidden");

    }


}







/* ==========================================================
   CHECKOUT
========================================================== */

function checkout(){


    if(state.cart.length === 0){


        alert("Your cart is empty.");

        return;


    }



    alert(

        "Order placed successfully!"

    );



    state.cart = [];


    saveData();


    render();



}







/* ==========================================================
   CART BUTTON EVENTS
========================================================== */

function setupCart(){


    $("open-cart")

    ?.addEventListener(

    "click",

    ()=>{

        openCart();

    });


    $("close-cart")

    ?.addEventListener(

    "click",

    ()=>{

        closeCart();

    });



    document.querySelector(".checkout-btn")

    ?.addEventListener(

    "click",

    ()=>{

        checkout();

    });


}






/* ==========================================================
   GLOBAL ACCESS FOR HTML BUTTONS
========================================================== */

window.addToCart = addToCart;

window.changeQuantity = changeQuantity;

window.removeFromCart = removeFromCart;



/* ==========================================================
   END PART 3/6
========================================================== */


/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 4/6 - PRODUCT MODAL SYSTEM
========================================================== */



/* ==========================================================
   SELECTED PRODUCT
========================================================== */

let selectedProduct = null;






/* ==========================================================
   OPEN PRODUCT MODAL
========================================================== */

function openProductModal(id){


    const product = state.products.find(

        item => item.id === id

    );



    if(!product) return;



    selectedProduct = product;




    if($("modal-image")){


        $("modal-image").src =

        product.image ||

        "https://via.placeholder.com/400x300";


    }





    if($("modal-name")){


        $("modal-name").textContent =

        product.name;


    }





    if($("modal-description")){


        $("modal-description").textContent =

        product.description;


    }





    if($("modal-price")){


        $("modal-price").textContent =

        formatPrice(product.price);


    }





    $("product-modal")

    ?.classList.remove(

        "hidden"

    );


}







/* ==========================================================
   CLOSE PRODUCT MODAL
========================================================== */

function closeProductModal(){


    $("product-modal")

    ?.classList.add(

        "hidden"

    );


    selectedProduct = null;


}







/* ==========================================================
   ADD FROM MODAL TO CART
========================================================== */

function addModalToCart(){


    if(!selectedProduct) return;



    addToCart(

        selectedProduct.id

    );


    closeProductModal();


}







/* ==========================================================
   MODAL EVENTS
========================================================== */

function setupModal(){



    $("close-modal")

    ?.addEventListener(

    "click",

    ()=>{


        closeProductModal();


    });






    $("modal-cart")

    ?.addEventListener(

    "click",

    ()=>{


        addModalToCart();


    });







    $("product-modal")

    ?.addEventListener(

    "click",

    event=>{


        if(

            event.target === $("product-modal")

        ){


            closeProductModal();


        }


    });



}








/* ==========================================================
   KEYBOARD CONTROL
========================================================== */

document.addEventListener(

"keydown",

event=>{


    if(event.key === "Escape"){


        closeProductModal();


        closeCart();


    }


});







/* ==========================================================
   GLOBAL ACCESS
========================================================== */

window.openProductModal = openProductModal;

window.closeProductModal = closeProductModal;





/* ==========================================================
   END PART 4/6
========================================================== */




/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 5/6 - EVENTS + APP START
========================================================== */





/* ==========================================================
   PAGE NAVIGATION EVENTS
========================================================== */

function setupNavigation(){


    document.addEventListener(

    "click",

    event=>{


        const button =

        event.target.closest("[data-page]");



        if(!button) return;



        showPage(

            button.dataset.page

        );


    });


}







/* ==========================================================
   CATEGORY ACTIVE STATE
========================================================== */

function setupCategoryActive(){


    document

    .querySelectorAll(".category-btn")

    .forEach(button=>{


        button.addEventListener(

        "click",

        ()=>{


            document

            .querySelectorAll(".category-btn")

            .forEach(btn=>{

                btn.classList.remove("active");

            });



            button.classList.add("active");


        });


    });


}







/* ==========================================================
   SEARCH BUTTON
========================================================== */

function setupSearchButton(){


    $("search-btn")

    ?.addEventListener(

    "click",

    ()=>{


        searchProducts(

            $("search").value

        );


        showPage("products");


    });


}







/* ==========================================================
   FORM + EVENTS STARTER
========================================================== */

function startApp(){


    setupSellForm();


    setupSearch();


    setupSearchButton();


    setupCategories();


    setupCategoryActive();


    setupCart();


    setupModal();


    setupNavigation();



    render();



}








/* ==========================================================
   LOAD APPLICATION
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{


    startApp();


});







/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */

window.showPage = showPage;

window.openCart = openCart;

window.closeCart = closeCart;

window.checkout = checkout;



/* ==========================================================
   END PART 5/6
========================================================== */



/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V4
   PART 6/6 - DASHBOARD + FINAL FIXES
========================================================== */



/* ==========================================================
   UPDATE DASHBOARD
========================================================== */

function updateDashboard(){


    // My products count

    if($("my-products")){


        $("my-products").textContent =

        state.products.length;


    }





    // Sellers count

    if($("seller-count")){


        $("seller-count").textContent =

        state.products.length > 0

        ? 1

        : 0;


    }





    // Orders count

    if($("order-count")){


        $("order-count").textContent =

        state.cart.length;


    }


}







/* ==========================================================
   EXTEND RENDER FUNCTION
========================================================== */


const oldRender = render;



render = function(){


    oldRender();



    updateDashboard();



};








/* ==========================================================
   PRODUCT CLICK SUPPORT
========================================================== */


document.addEventListener(

"click",

event=>{


    const card =

    event.target.closest(".card");



    if(!card) return;



    if(

        event.target.closest("button")

    ){

        return;

    }



    const id =

    Number(card.dataset.id);



    if(id){


        openProductModal(id);


    }


});








/* ==========================================================
   ERROR PROTECTION
========================================================== */

window.addEventListener(

"error",

event=>{


    console.warn(

        "HornMarket error:",

        event.message

    );


});








/* ==========================================================
   FINAL START CHECK
========================================================== */


console.log(

    "🛒 HornMarket V4 Loaded Successfully"

);




/* ==========================================================
   END JAVASCRIPT V4 COMPLETE
========================================================== */





