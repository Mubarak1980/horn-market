/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V5
   PART 1/6 - CORE ENGINE
========================================================== */


/* ==========================================================
   SAFE STORAGE SYSTEM
========================================================== */

function loadData(key, fallback){

    try{

        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : fallback;

    }

    catch(error){

        console.warn(
            "Storage error:",
            error
        );

        return fallback;

    }

}




function saveStorage(key,value){

    try{

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

    catch(error){

        console.warn(
            "Save error:",
            error
        );

    }

}





/* ==========================================================
   APPLICATION STATE
========================================================== */


const state = {


    products:
    loadData(
        "products",
        []
    ),



    cart:
    loadData(
        "cart",
        []
    ),



    page:
    localStorage.getItem("page")
    || "home",



    search:"",



    category:"all",



    sort:"newest",



    selectedProduct:null



};







/* ==========================================================
   DOM HELPERS
========================================================== */


const $ = id =>
document.getElementById(id);



const $$ = selector =>
document.querySelectorAll(selector);







/* ==========================================================
   SAVE APPLICATION DATA
========================================================== */


function saveData(){


    saveStorage(
        "products",
        state.products
    );


    saveStorage(
        "cart",
        state.cart
    );


    localStorage.setItem(
        "page",
        state.page
    );


}








/* ==========================================================
   UNIQUE ID GENERATOR
========================================================== */


function generateID(){


    return Date.now()
    +
    Math.floor(
        Math.random()*10000
    );


}







/* ==========================================================
   PRICE FORMAT
========================================================== */


function formatPrice(price){


    return Number(price)
    .toLocaleString(
        "en-US"
    )
    +
    " Birr";


}







/* ==========================================================
   PAGE NAVIGATION
========================================================== */


function showPage(page){


    state.page = page;


    saveData();



    $$(".page")
    .forEach(section=>{


        section.classList.add(
            "hidden"
        );


    });





    const target =
    $(page+"-page");



    if(target){


        target.classList.remove(
            "hidden"
        );


    }



    updateNavigation();



}







/* ==========================================================
   NAVIGATION ACTIVE STATE
========================================================== */


function updateNavigation(){


    $$("[data-page]")
    .forEach(button=>{


        const active =
        button.dataset.page
        ===
        state.page;



        button.classList.toggle(
            "active",
            active
        );


    });


}








/* ==========================================================
   CART COUNT
========================================================== */


function updateCartCount(){


    const count =
    state.cart.reduce(

        (total,item)=>
        total + item.qty,

        0

    );



    const counter =
    $("cart-count");



    if(counter){


        counter.textContent =
        count;


    }


}







/* ==========================================================
   TOAST NOTIFICATION
========================================================== */


function showToast(message){


    let toast =
    $("toast");



    if(!toast){


        toast =
        document.createElement(
            "div"
        );


        toast.id =
        "toast";


        document.body.appendChild(
            toast
        );


    }



    toast.textContent =
    message;



    toast.classList.add(
        "show"
    );



    setTimeout(()=>{


        toast.classList.remove(
            "show"
        );


    },2500);



}







/* ==========================================================
   MAIN RENDER ENGINE
========================================================== */


function render(){


    showPage(
        state.page
    );


    updateCartCount();


    renderProducts();


    renderCart();


    updateDashboard();


}







/* ==========================================================
   APP START
========================================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    render();


    console.log(
        "🛒 HornMarket V5 Started"
    );


}

);


/* ==========================================================
   END PART 1/6
========================================================== */

 /* ==========================================================
    HORNM ARKET PREMIUM MARKETPLACE
    JAVASCRIPT V5
    PART 2/6 - PRODUCT ENGINE
 ========================================================== */


/* ==========================================================
   CREATE PRODUCT
========================================================== */


function addProduct(data){


    const name =
    data.name.trim();



    const price =
    Number(data.price);



    if(!name){

        showToast(
            "❌ Product name required"
        );

        return;

    }



    if(!price || price <= 0){

        showToast(
            "❌ Invalid price"
        );

        return;

    }




    const product = {


        id:
        generateID(),



        name,



        price,



        category:
        data.category
        .trim()
        ||
        "Other",



        condition:
        data.condition
        ||
        "New",



        image:
        data.image
        .trim()
        ||
        "images/default-product.png",



        description:
        data.description
        .trim()
        ||
        "No description available",



        location:
        data.location
        ||
        "Ethiopia",



        seller:
        data.seller
        ||
        "Anonymous",



        rating:
        5,



        createdAt:
        Date.now()


    };





    state.products.unshift(
        product
    );



    saveData();



    render();



    showToast(
        "✅ Product published"
    );


}








/* ==========================================================
   SEARCH SYSTEM
========================================================== */


function searchProducts(value){


    state.search =
    value
    .toLowerCase()
    .trim();



    renderProducts();


}








/* ==========================================================
   CATEGORY FILTER
========================================================== */


function setCategory(category){


    state.category =
    category
    .toLowerCase();



    renderProducts();


}







/* ==========================================================
   SORT PRODUCTS
========================================================== */


function sortProducts(type){


    state.sort =
    type;



    renderProducts();


}







/* ==========================================================
   GET FILTERED PRODUCTS
========================================================== */


function getProducts(){


    let products =
    [...state.products];





    /* SEARCH */


    if(state.search){


        products =
        products.filter(product=>{


            return (

                product.name
                .toLowerCase()
                .includes(state.search)


                ||

                product.category
                .toLowerCase()
                .includes(state.search)


                ||

                product.description
                .toLowerCase()
                .includes(state.search)


            );


        });


    }





    /* CATEGORY */


    if(
        state.category !== "all"
    ){


        products =
        products.filter(product=>{


            return (

                product.category
                .toLowerCase()
                ===
                state.category

            );


        });


    }







    /* SORT */


    if(
        state.sort === "price-low"
    ){


        products.sort(
            (a,b)=>
            a.price-b.price
        );


    }



    else if(
        state.sort === "price-high"
    ){


        products.sort(
            (a,b)=>
            b.price-a.price
        );


    }



    else{


        products.sort(
            (a,b)=>
            b.createdAt-a.createdAt
        );


    }





    return products;


}








/* ==========================================================
   PRODUCT CARD CREATOR
========================================================== */


function createProductCard(product){


return `

<article 
class="card"
data-id="${product.id}"
>


<img

src="${product.image}"

alt="${product.name}"

loading="lazy"

onerror="
this.src='images/default-product.png'
"

>


<div class="card-content">


<span class="category">

${product.category}

</span>




<h3>

${product.name}

</h3>



<p class="rating">

⭐ ${product.rating}

</p>



<p class="price">

${formatPrice(product.price)}

</p>



<p class="condition">

${product.condition}

</p>



<p class="location">

📍 ${product.location}

</p>




<button

class="add-to-cart"

data-cart="${product.id}"

>

🛒 Add To Cart

</button>




<button

class="primary-btn"

data-view="${product.id}"

>

View Details

</button>



</div>


</article>


`;

}









/* ==========================================================
   EMPTY PRODUCTS
========================================================== */


function emptyProducts(){


return `


<div class="empty-state">


<h2>

📦

</h2>


<h3>

No Products Found

</h3>


<p>

Try another search or category.

</p>


</div>


`;


}









/* ==========================================================
   RENDER PRODUCTS
========================================================== */


function renderProducts(){


    const products =
    getProducts();




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


        $("product-count")
        .textContent =
        state.products.length;


    }


}








/* ==========================================================
   SELL FORM SETUP
========================================================== */


function setupSellForm(){


    const form =
    $("sell-form");



    if(!form)
    return;




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



        showPage(
            "home"
        );



    });


}






/* ==========================================================
   END PART 2/6
========================================================== */


/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V5

   PART 3/6 - CART ENGINE
========================================================== */


/* ==========================================================
   ADD PRODUCT TO CART
========================================================== */


function addToCart(id){


    const product =
    state.products.find(

        item =>
        item.id === id

    );



    if(!product){

        showToast(
            "❌ Product not found"
        );

        return;

    }




    const existing =
    state.cart.find(

        item =>
        item.id === id

    );





    if(existing){


        existing.qty += 1;


    }


    else{


        state.cart.push({

            ...product,

            qty:1

        });


    }





    saveData();


    render();



    showToast(
        "🛒 Added to cart"
    );


}








/* ==========================================================
   CHANGE QUANTITY
========================================================== */


function changeQuantity(id,amount){



    const item =
    state.cart.find(

        product =>
        product.id === id

    );



    if(!item)
    return;





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



    state.cart =
    state.cart.filter(

        item =>
        item.id !== id

    );



    saveData();


    render();



    showToast(
        "🗑 Removed from cart"
    );


}









/* ==========================================================
   CLEAR CART
========================================================== */


function clearCart(){



    state.cart = [];



    saveData();



    render();



    showToast(
        "Cart cleared"
    );


}









/* ==========================================================
   CART CALCULATIONS
========================================================== */


function getCartSummary(){


    const subtotal =

    state.cart.reduce(

        (total,item)=>

        total +

        (
            item.price *
            item.qty
        ),

        0

    );





    const delivery =

    subtotal > 2000

    ?

    0

    :

    50;





    return {


        subtotal,

        delivery,


        total:

        subtotal + delivery


    };


}









/* ==========================================================
   RENDER CART
========================================================== */


function renderCart(){



    const box =
    $("cart-items");



    if(!box)
    return;





    if(
        state.cart.length === 0
    ){


        box.innerHTML = `


        <div class="empty-state">


        <h3>

        🛒 Cart Empty

        </h3>


        <p>

        Your shopping journey starts here.

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





    const summary =
    getCartSummary();





    const total =
    $("cart-total");



    if(total){


        total.innerHTML = `


        Subtotal:

        ${formatPrice(summary.subtotal)}

        <br>


        Delivery:

        ${formatPrice(summary.delivery)}

        <hr>


        Total:

        ${formatPrice(summary.total)}


        `;


    }



}









/* ==========================================================
   OPEN CART PANEL
========================================================== */


function openCart(){



    const panel =
    $("cart-panel");



    if(panel){


        panel.classList.remove(
            "hidden"
        );


    }


}








/* ==========================================================
   CLOSE CART PANEL
========================================================== */


function closeCart(){



    const panel =
    $("cart-panel");



    if(panel){


        panel.classList.add(
            "hidden"
        );


    }


}








/* ==========================================================
   CHECKOUT
========================================================== */


function checkout(){



    if(
        state.cart.length === 0
    ){


        showToast(
            "🛒 Cart is empty"
        );


        return;


    }






    const order = {


        id:
        generateID(),



        items:
        state.cart,



        total:
        getCartSummary().total,



        date:
        new Date()


    };






    const orders =

    loadData(
        "orders",
        []
    );





    orders.push(order);





    saveStorage(
        "orders",
        orders
    );





    state.cart = [];



    saveData();



    render();




    closeCart();



    showToast(
        "✅ Order completed"
    );



}









/* ==========================================================
   CART EVENTS
========================================================== */


function setupCart(){



    $("open-cart")
    ?.addEventListener(

        "click",

        openCart

    );





    $("close-cart")
    ?.addEventListener(

        "click",

        closeCart

    );





    document
    .querySelector(".checkout-btn")
    ?.addEventListener(

        "click",

        checkout

    );



}







/* ==========================================================
   GLOBAL ACCESS
========================================================== */


window.addToCart =
addToCart;


window.changeQuantity =
changeQuantity;


window.removeFromCart =
removeFromCart;


window.openCart =
openCart;


window.closeCart =
closeCart;


window.checkout =
checkout;



/* ==========================================================
   END PART 3/6
========================================================== */






/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V5

   PART 4/6 - PRODUCT DETAILS + FAVORITES
========================================================== */


/* ==========================================================
   FAVORITES STORAGE
========================================================== */


if(!state.favorites){

    state.favorites =
    loadData(
        "favorites",
        []
    );

}







/* ==========================================================
   SAVE FAVORITES
========================================================== */


function saveFavorites(){


    saveStorage(

        "favorites",

        state.favorites

    );


}








/* ==========================================================
   OPEN PRODUCT MODAL
========================================================== */


function openProductModal(id){



    const product =

    state.products.find(

        item =>

        item.id === id

    );





    if(!product){

        showToast(
            "Product unavailable"
        );

        return;

    }





    state.selectedProduct =
    product;





    // Increase views

    product.views =

    (product.views || 0) + 1;





    saveData();





    if($("modal-image")){


        $("modal-image").src =

        product.image;



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

        formatPrice(
            product.price
        );



    }





    if($("modal-category")){


        $("modal-category").textContent =

        product.category;



    }





    updateFavoriteButton();





    $("product-modal")
    ?.classList.remove(

        "hidden"

    );



}









/* ==========================================================
   CLOSE MODAL
========================================================== */


function closeProductModal(){



    $("product-modal")
    ?.classList.add(

        "hidden"

    );



    state.selectedProduct =
    null;



}








/* ==========================================================
   ADD PRODUCT FROM MODAL
========================================================== */


function addModalToCart(){



    if(!state.selectedProduct)

    return;





    addToCart(

        state.selectedProduct.id

    );



    closeProductModal();



}








/* ==========================================================
   FAVORITE SYSTEM
========================================================== */


function toggleFavorite(id){



    const exists =

    state.favorites.includes(id);





    if(exists){


        state.favorites =

        state.favorites.filter(

            item =>

            item !== id

        );



        showToast(
            "Removed from favorites"
        );


    }


    else{


        state.favorites.push(id);



        showToast(
            "❤️ Added to favorites"
        );


    }






    saveFavorites();



    updateFavoriteButton();



    renderProducts();



}









/* ==========================================================
   CHECK FAVORITE
========================================================== */


function isFavorite(id){



    return state.favorites.includes(id);



}








/* ==========================================================
   UPDATE FAVORITE BUTTON
========================================================== */


function updateFavoriteButton(){



    const button =

    $("favorite-btn");



    if(
        !button ||
        !state.selectedProduct
    )

    return;






    button.textContent =



    isFavorite(
        state.selectedProduct.id
    )



    ?



    "❤️ Saved"



    :



    "♡ Favorite";



}








/* ==========================================================
   PRODUCT MODAL EVENTS
========================================================== */


function setupModal(){



    $("close-modal")
    ?.addEventListener(

        "click",

        closeProductModal

    );






    $("modal-cart")
    ?.addEventListener(

        "click",

        addModalToCart

    );






    $("favorite-btn")
    ?.addEventListener(

        "click",

        ()=>{


            if(
                state.selectedProduct
            ){


                toggleFavorite(

                    state.selectedProduct.id

                );


            }


        }

    );







    $("product-modal")
    ?.addEventListener(

        "click",

        event=>{


            if(

            event.target ===

            $("product-modal")

            ){


                closeProductModal();


            }


        }

    );


}








/* ==========================================================
   KEYBOARD CONTROLS
========================================================== */


document.addEventListener(

"keydown",

event=>{



    if(
        event.key === "Escape"
    ){


        closeProductModal();


        closeCart();


    }



});








/* ==========================================================
   PRODUCT CARD BUTTON EVENTS
========================================================== */


document.addEventListener(

"click",

event=>{



    const cartButton =

    event.target.closest(

        "[data-cart]"

    );




    if(cartButton){



        addToCart(

            Number(

            cartButton.dataset.cart

            )

        );


        return;

    }







    const viewButton =

    event.target.closest(

        "[data-view]"

    );





    if(viewButton){



        openProductModal(

            Number(

            viewButton.dataset.view

            )

        );


        return;

    }







    const card =

    event.target.closest(

        ".card"

    );






    if(card){



        openProductModal(

            Number(

            card.dataset.id

            )

        );


    }



});









/* ==========================================================
   GLOBAL ACCESS
========================================================== */


window.openProductModal =
openProductModal;


window.closeProductModal =
closeProductModal;


window.toggleFavorite =
toggleFavorite;





/* ==========================================================
   END PART 4/6
========================================================== */



/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V5

   PART 5/6 - EVENTS + APP CONTROLLER
========================================================== */



/* ==========================================================
   NAVIGATION SYSTEM
========================================================== */


function setupNavigation(){



    document.addEventListener(

        "click",

        event=>{



            const button =

            event.target.closest(

                "[data-page]"

            );





            if(!button)

            return;





            showPage(

                button.dataset.page

            );



        }

    );



}








/* ==========================================================
   SEARCH EVENTS
========================================================== */


function setupSearch(){



    const input =

    $("search");



    if(!input)

    return;






    input.addEventListener(

        "input",

        event=>{



            searchProducts(

                event.target.value

            );



        }

    );





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





            showPage(

                "products"

            );



        }

    );



}









/* ==========================================================
   CATEGORY SYSTEM
========================================================== */


function setupCategories(){



    const buttons =

    document.querySelectorAll(

        ".category-btn"

    );






    buttons.forEach(

        button=>{



            button.addEventListener(

                "click",

                ()=>{



                    buttons.forEach(

                        btn=>{

                            btn.classList.remove(

                                "active"

                            );

                        }

                    );






                    button.classList.add(

                        "active"

                    );






                    let category =

                    button.textContent

                    .replace(

                        /[^\w\s]/gi,

                        ""

                    )

                    .trim();








                    if(

                    category.toLowerCase()

                    ===

                    "all"

                    ){


                        setCategory(

                            "all"

                        );


                    }

                    else{


                        setCategory(

                            category

                        );


                    }




                }

            );



        }

    );



}








/* ==========================================================
   SELL FORM UPGRADE
========================================================== */


function setupSellForm(){



    const form =

    $("sell-form");



    if(!form)

    return;






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





                condition:

                $("product-condition")

                ?

                $("product-condition").value

                :

                "New",






                image:

                $("product-image").value,







                description:

                $("product-description").value,







                location:

                $("product-location")

                ?

                $("product-location").value

                :

                "Ethiopia"




            });







            form.reset();





            showPage(

                "home"

            );




        }

    );



}








/* ==========================================================
   DASHBOARD SYSTEM
========================================================== */


function updateDashboard(){



    const products =

    $("my-products");



    if(products){



        products.textContent =

        state.products.length;



    }







    const favorites =

    $("favorite-count");



    if(favorites){



        favorites.textContent =

        state.favorites

        ?

        state.favorites.length

        :

        0;



    }








    const orders =

    $("order-count");



    if(orders){



        const data =

        loadData(

            "orders",

            []

        );




        orders.textContent =

        data.length;



    }



}








/* ==========================================================
   DARK MODE
========================================================== */


function toggleTheme(){



    document.body.classList.toggle(

        "dark"

    );





    const mode =

    document.body.classList.contains(

        "dark"

    );





    localStorage.setItem(

        "theme",

        mode

    );



}








function loadTheme(){



    const dark =

    localStorage.getItem(

        "theme"

    );





    if(dark === "true"){



        document.body.classList.add(

            "dark"

        );



    }



}









/* ==========================================================
   APP CONTROLLER
========================================================== */


function startApp(){



    loadTheme();



    setupNavigation();



    setupSearch();



    setupSearchButton();



    setupCategories();



    setupSellForm();



    setupCart();



    setupModal();



    render();



}









/* ==========================================================
   FINAL APPLICATION LOAD
========================================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


    startApp();



    console.log(

        "🛒 HornMarket V5 Ready"

    );



}

);









/* ==========================================================
   GLOBAL FUNCTIONS
========================================================== */


window.showPage =
showPage;


window.toggleTheme =
toggleTheme;


window.openCart =
openCart;


window.closeCart =
closeCart;


window.checkout =
checkout;



/* ==========================================================
   END PART 5/6
========================================================== */



/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V5

   PART 6/6 - FINAL POLISH + ADVANCED FEATURES
========================================================== */



/* ==========================================================
   FAVORITES PAGE
========================================================== */


function getFavoriteProducts(){


    return state.products.filter(

        product =>

        state.favorites.includes(

            product.id

        )

    );


}








function renderFavorites(){



    const box =

    $("favorites-container");



    if(!box)

    return;






    const products =

    getFavoriteProducts();






    box.innerHTML =

    products.length

    ?


    products

    .map(createProductCard)

    .join("")



    :



    `

    <div class="empty-state">

    <h3>

    ❤️ No Favorites

    </h3>


    <p>

    Save products you like.

    </p>


    </div>

    `;



}









/* ==========================================================
   DELETE PRODUCT
========================================================== */


function deleteProduct(id){



    const confirmDelete =

    confirm(

        "Delete this product?"

    );





    if(!confirmDelete)

    return;






    state.products =

    state.products.filter(

        product =>

        product.id !== id

    );







    state.cart =

    state.cart.filter(

        item =>

        item.id !== id

    );








    state.favorites =

    state.favorites.filter(

        item =>

        item !== id

    );






    saveData();


    saveFavorites();


    render();



    showToast(

        "🗑 Product deleted"

    );


}









/* ==========================================================
   SELLER STATISTICS
========================================================== */


function getSellerStats(){



    return {


        products:

        state.products.length,



        totalValue:

        state.products.reduce(

            (sum,item)=>

            sum + item.price,

            0

        ),



        favorites:

        state.favorites.length



    };


}








function renderSellerStats(){



    const stats =

    getSellerStats();





    if($("seller-products")){


        $("seller-products")

        .textContent =

        stats.products;


    }





    if($("seller-value")){


        $("seller-value")

        .textContent =

        formatPrice(

            stats.totalValue

        );


    }



}









/* ==========================================================
   EXPORT DATA BACKUP
========================================================== */


function exportData(){



    const backup = {


        products:

        state.products,



        cart:

        state.cart,



        favorites:

        state.favorites



    };





    const file =

    new Blob(

        [

        JSON.stringify(

            backup,

            null,

            2

        )

        ],


        {

        type:"application/json"

        }

    );







    const link =

    document.createElement(

        "a"

    );





    link.href =

    URL.createObjectURL(

        file

    );





    link.download =

    "hornmarket-backup.json";





    link.click();





    showToast(

        "Backup created"

    );



}









/* ==========================================================
   PRODUCT COUNT UPDATE
========================================================== */


function updateProductCount(){



    const count =

    $("product-count");



    if(count){


        count.textContent =

        state.products.length;


    }



}









/* ==========================================================
   EXTEND MAIN RENDER
========================================================== */


const originalRender = render;



render = function(){



    originalRender();



    renderFavorites();



    renderSellerStats();



    updateProductCount();



};









/* ==========================================================
   GLOBAL ERROR PROTECTION
========================================================== */


window.addEventListener(

"error",

event=>{



    console.warn(

        "HornMarket Error:",

        event.message

    );



});








/* ==========================================================
   IMAGE FALLBACK PROTECTION
========================================================== */


document.addEventListener(

"error",

event=>{



    if(

        event.target.tagName === "IMG"

    ){



        event.target.src =

        "images/default-product.png";



    }



},

true

);








/* ==========================================================
   AUTO SAVE BEFORE EXIT
========================================================== */


window.addEventListener(

"beforeunload",

()=>{


    saveData();


    saveFavorites();



});









/* ==========================================================
   FINAL INITIAL CHECK
========================================================== */


console.log(

"🚀 HornMarket V5 Complete"

);





/* ==========================================================
   END PART 6/6

   HORNM ARKET JAVASCRIPT V5 FINISHED
========================================================== */



