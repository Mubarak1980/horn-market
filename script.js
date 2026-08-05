/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V3
   PART 1/6 - CORE ENGINE
========================================================== */


/* ==========================================================
   APP STATE
========================================================== */


const state = {


    products:

    JSON.parse(
        localStorage.getItem("products")
    ) || [],



    cart:

    JSON.parse(
        localStorage.getItem("cart")
    ) || [],



    favorites:

    JSON.parse(
        localStorage.getItem("favorites")
    ) || [],



    orders:

    JSON.parse(
        localStorage.getItem("orders")
    ) || [],



    page:"home",


    category:"all",


    search:"",


    darkMode:

    JSON.parse(
        localStorage.getItem("darkMode")
    ) || false


};





/* ==========================================================
   DOM SHORTCUTS
========================================================== */


const $ = id =>
document.getElementById(id);



const $$ = selector =>
document.querySelectorAll(selector);






/* ==========================================================
   STORAGE SYSTEM
========================================================== */


function saveData(){


    localStorage.setItem(

        "products",

        JSON.stringify(
            state.products
        )

    );



    localStorage.setItem(

        "cart",

        JSON.stringify(
            state.cart
        )

    );



    localStorage.setItem(

        "favorites",

        JSON.stringify(
            state.favorites
        )

    );



    localStorage.setItem(

        "orders",

        JSON.stringify(
            state.orders
        )

    );



    localStorage.setItem(

        "darkMode",

        JSON.stringify(
            state.darkMode
        )

    );


}







/* ==========================================================
   UTILITIES
========================================================== */


function generateID(){


    return Date.now()

    +

    Math.floor(
        Math.random()*999
    );


}




function formatPrice(price){


    return Number(price)

    .toLocaleString()

    +

    " Birr";


}





function cleanText(text){


    return String(text)

    .trim();


}





/* ==========================================================
   PAGE ROUTER
========================================================== */


function showPage(page){


    state.page = page;



    $$(".page")

    .forEach(section=>{


        section.classList.add(
            "hidden"
        );


    });



    const currentPage =

    $(page+"-page");



    if(currentPage){


        currentPage.classList.remove(
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


        if(
            button.dataset.page
            ===
            state.page
        ){


            button.classList.add(
                "active"
            );


        }

        else{


            button.classList.remove(
                "active"
            );


        }


    });


}







/* ==========================================================
   DARK MODE ENGINE
========================================================== */


function applyTheme(){



    if(state.darkMode){


        document.body.classList.add(
            "dark"
        );


    }

    else{


        document.body.classList.remove(
            "dark"
        );


    }


}






function toggleDarkMode(){



    state.darkMode =

    !state.darkMode;



    saveData();


    applyTheme();


}








/* ==========================================================
   CART COUNTER
========================================================== */


function updateCartCount(){



    const count =

    state.cart.reduce(

        (total,item)=>

        total + item.qty,

        0

    );



    if($("cart-count")){


        $("cart-count").textContent =
        count;


    }


}








/* ==========================================================
   GLOBAL RENDER ENGINE
========================================================== */


function render(){



    applyTheme();



    showPage(
        state.page
    );



    renderProducts();



    renderCart();



    updateCartCount();



    updateDashboard();



}







/* ==========================================================
   SAFE INITIALIZATION
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
   JAVASCRIPT V3
   PART 2/6 - PRODUCT ENGINE
========================================================== */


/* ==========================================================
   ADD PRODUCT
========================================================== */


function addProduct(data){


    const product = {


        id:
        generateID(),



        name:
        cleanText(data.name),



        price:
        Number(data.price),



        category:
        cleanText(data.category),



        image:
        cleanText(data.image),



        description:
        cleanText(data.description || "No description"),



        location:
        data.location || "Ethiopia",



        date:
        new Date().toISOString()


    };



    state.products.unshift(product);



    saveData();



    render();


}







/* ==========================================================
   SEARCH ENGINE
========================================================== */


function searchProducts(value){



    state.search =

    value

    .toLowerCase()

    .trim();



    render();


}







/* ==========================================================
   CATEGORY FILTER
========================================================== */


function setCategory(category){



    if(
        !category ||
        category==="All"
    ){

        state.category="all";

    }

    else{


        state.category =

        category

        .toLowerCase()

        .trim();


    }



    render();


}







/* ==========================================================
   GET FILTERED PRODUCTS
========================================================== */


function getProducts(){



    return state.products.filter(product=>{



        const name =

        product.name

        .toLowerCase();



        const category =

        product.category

        .toLowerCase();





        const searchMatch =


        name.includes(
            state.search
        );






        const categoryMatch =


        state.category==="all"

        ||

        category===state.category;





        return (

            searchMatch

            &&

            categoryMatch

        );


    });


}







/* ==========================================================
   FAVORITE SYSTEM
========================================================== */


function toggleFavorite(id){



    const index =

    state.favorites.indexOf(id);





    if(index===-1){



        state.favorites.push(id);



    }

    else{



        state.favorites.splice(
            index,
            1
        );


    }



    saveData();



    render();


}







function isFavorite(id){



    return state.favorites.includes(id);


}








/* ==========================================================
   PRODUCT CARD TEMPLATE
========================================================== */


function createProductCard(product){



    const heart =


    isFavorite(product.id)

    ?

    "❤️"

    :

    "🤍";




    return `



<article class="card">



<img

src="${product.image || 'https://via.placeholder.com/400x300'}"

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

${heart}

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

No Products Found

</h3>



<p>

Try another search or category.

</p>



</div>



`;



}








/* ==========================================================
   PRODUCT RENDERING
========================================================== */


function renderProducts(){



    const products =

    getProducts();





    const mainBox =

    $("products-container");





    const featuredBox =

    $("featured-products");







    if(mainBox){



        if(products.length){



            mainBox.innerHTML =

            products

            .map(createProductCard)

            .join("");



        }

        else{



            mainBox.innerHTML =

            emptyProducts();



        }


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
   END PART 2/6
========================================================== */


/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V3
   PART 3/6 - CART ENGINE + CHECKOUT
========================================================== */


/* ==========================================================
   ADD TO CART
========================================================== */


function addToCart(id){


    const product =

    state.products.find(

        item=>item.id===id

    );



    if(!product){

        return;

    }





    const existing =

    state.cart.find(

        item=>item.id===id

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


function changeQuantity(id,amount){



    const item =

    state.cart.find(

        product=>product.id===id

    );





    if(!item){

        return;

    }





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

        item=>item.id!==id

    );





    saveData();



    render();



}








/* ==========================================================
   CLEAR CART
========================================================== */


function clearCart(){



    state.cart=[];



    saveData();



    render();



}








/* ==========================================================
   CART TOTAL
========================================================== */


function getCartTotal(){



    return state.cart.reduce(


        (total,item)=>


        total +

        (

            item.price *

            item.qty

        ),


        0


    );


}








/* ==========================================================
   CART RENDER
========================================================== */


function renderCart(){



    const cartBox =

    $("cart-items");





    if(!cartBox){

        return;

    }






    if(state.cart.length===0){



        cartBox.innerHTML = `


        <div class="empty-state">


        <h3>

        🛒 Cart Empty

        </h3>



        <p>

        Add products to start shopping.

        </p>


        </div>


        `;


    }

    else{



        cartBox.innerHTML =


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

class="remove-btn"

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
   OPEN / CLOSE CART PANEL
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
   CHECKOUT SYSTEM
========================================================== */


function checkout(){



    if(state.cart.length===0){


        alert(

            "Your cart is empty."

        );


        return;


    }






    const order = {



        id:

        generateID(),



        items:

        [...state.cart],



        total:

        getCartTotal(),



        date:

        new Date().toISOString()



    };







    state.orders.unshift(order);





    clearCart();



    saveData();





    alert(

        "Order placed successfully!"

    );



}







/* ==========================================================
   END PART 3/6
========================================================== */


/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V3
   PART 4/6 - PRODUCT MODAL + DETAILS SYSTEM
========================================================== */


/* ==========================================================
   CURRENT SELECTED PRODUCT
========================================================== */


let selectedProduct = null;







/* ==========================================================
   OPEN PRODUCT MODAL
========================================================== */


function openProductModal(id){



    const product =

    state.products.find(

        item=>item.id===id

    );





    if(!product){

        return;

    }





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







    const modal =

    $("product-modal");





    if(modal){



        modal.classList.remove(

            "hidden"

        );


    }



}








/* ==========================================================
   CLOSE PRODUCT MODAL
========================================================== */


function closeProductModal(){



    const modal =

    $("product-modal");



    if(modal){



        modal.classList.add(

            "hidden"

        );



    }



    selectedProduct = null;



}








/* ==========================================================
   ADD PRODUCT FROM MODAL
========================================================== */


function addModalProductToCart(){



    if(!selectedProduct){

        return;

    }



    addToCart(

        selectedProduct.id

    );



    closeProductModal();



}








/* ==========================================================
   MODAL EVENTS
========================================================== */


$("close-modal")

?.addEventListener(

"click",

()=>{


    closeProductModal();


}

);






$("modal-cart")

?.addEventListener(

"click",

()=>{


    addModalProductToCart();


}

);









/* ==========================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
========================================================== */


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







/* ==========================================================
   KEYBOARD CONTROL
========================================================== */


document.addEventListener(

"keydown",

event=>{



    if(

        event.key==="Escape"

    ){


        closeProductModal();


        closeCart();


    }



}

);







/* ==========================================================
   END PART 4/6
========================================================== */



/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V3
   PART 5/6 - EVENTS + SELL FORM + NAVIGATION
========================================================== */


/* ==========================================================
   SELL PRODUCT FORM
========================================================== */


function setupSellForm(){



    const form =

    $("sell-form");





    if(!form){

        return;

    }





    form.addEventListener(

    "submit",

    event=>{



        event.preventDefault();





        const product = {



            name:

            $("product-name").value,



            price:

            $("product-price").value,



            category:

            $("product-category").value,



            image:

            $("product-image").value,



            description:

            $("product-description").value,



            location:

            "Ethiopia"



        };







        if(

            !product.name ||

            !product.price ||

            !product.category

        ){



            alert(

            "Please fill required fields."

            );



            return;



        }







        addProduct(product);






        form.reset();






        showPage(

            "home"

        );




    });



}








/* ==========================================================
   SEARCH SYSTEM
========================================================== */


function setupSearch(){



    const searchInput =

    $("search");





    if(!searchInput){

        return;

    }






    searchInput.addEventListener(

    "input",

    event=>{



        state.search =

        event.target.value

        .toLowerCase();





        renderProducts();



    });



}








/* ==========================================================
   CATEGORY FILTER SYSTEM
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

            btn=>

            btn.classList.remove(

                "active"

            )

            );





            button.classList.add(

                "active"

            );







            const category =

            button.dataset.category ||

            "all";







            state.category =

            category;





            renderProducts();





        });



    });



}








/* ==========================================================
   PAGE NAVIGATION
========================================================== */


function setupNavigation(){



    document.addEventListener(

    "click",

    event=>{



        const button =

        event.target.closest(

            "[data-page]"

        );






        if(!button){

            return;

        }







        showPage(

            button.dataset.page

        );



    });



}








/* ==========================================================
   CART BUTTON EVENTS
========================================================== */


function setupCartButtons(){



    $("open-cart")

    ?.addEventListener(

    "click",

    ()=>{


        openCart();


    }

    );






    $("close-cart")

    ?.addEventListener(

    "click",

    ()=>{


        closeCart();


    }

    );



}








/* ==========================================================
   CHECKOUT BUTTON
========================================================== */


function setupCheckout(){



    document.querySelector(

        ".checkout-btn"

    )

    ?.addEventListener(

    "click",

    ()=>{


        checkout();


    }

    );



}








/* ==========================================================
   PRODUCT CLICK DETAILS
========================================================== */


function setupProductClicks(){



    document.addEventListener(

    "click",

    event=>{



        const card =

        event.target.closest(

            ".card"

        );





        if(

            !card ||

            event.target.closest(

            "button"

            )

        ){

            return;

        }







        const id =

        Number(

            card.dataset.id

        );






        if(id){



            openProductModal(id);



        }





    });



}








/* ==========================================================
   INITIAL EVENT LOADER
========================================================== */


function setupEvents(){



    setupSellForm();



    setupSearch();



    setupCategories();



    setupNavigation();



    setupCartButtons();



    setupCheckout();



    setupProductClicks();



}








/* ==========================================================
   END PART 5/6
========================================================== */

/* ==========================================================
   HORNM ARKET PREMIUM MARKETPLACE
   JAVASCRIPT V3
   PART 6/6 - FINAL ENGINE + COMPATIBILITY FIXES
========================================================== */



/* ==========================================================
   FIX PRODUCT CARD DATA ID
========================================================== */


const originalProductCard = productCard;


productCard = function(product){


    const card = originalProductCard(product);


    return card.replace(

        '<article class="card">',

        `<article 
            class="card" 
            data-id="${product.id}"
        >`

    );


};







/* ==========================================================
   DARK MODE SUPPORT
========================================================== */


function toggleDarkMode(){



    state.darkMode =

    !state.darkMode;



    save();



    applyTheme();



}







/* ==========================================================
   AUTO UPDATE ACCOUNT DATA
========================================================== */


function updateAccount(){



    const productCount =

    $("my-products");



    if(productCount){



        productCount.textContent =

        state.products.length;



    }



    const sellerCount =

    $("seller-count");



    if(sellerCount){



        sellerCount.textContent =

        state.products.length > 0

        ? 1

        : 0;



    }



    const orderCount =

    $("order-count");



    if(orderCount){



        orderCount.textContent =

        state.cart.length;



    }



}







/* ==========================================================
   EXTEND MAIN RENDER
========================================================== */


const oldRender = render;



render = function(){



    oldRender();



    updateAccount();



};







/* ==========================================================
   START APPLICATION
========================================================== */


document.addEventListener(

"DOMContentLoaded",

()=>{



    setupEvents();



    applyTheme();



    render();



}

);







/* ==========================================================
   GLOBAL EXPORTS
   FOR HTML ONCLICK BUTTONS
========================================================== */


window.addToCart = addToCart;

window.removeCart = removeCart;

window.changeQty = changeQty;

window.toggleFavorite = toggleFavorite;

window.openProductModal = openProductModal;

window.closeProductModal = closeProductModal;

window.showPage = showPage;

window.toggleDarkMode = toggleDarkMode;







/* ==========================================================
   SAFETY CHECK
========================================================== */


window.addEventListener(

"error",

event=>{



    console.warn(

        "HornMarket handled error:",

        event.message

    );



});







/* ==========================================================
   HORNMARKET ENGINE COMPLETE
========================================================== */



