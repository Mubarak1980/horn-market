/* =====================================
   HORNM ARKET APP ENGINE
===================================== */


const state = {

products:
JSON.parse(localStorage.getItem("products")) || [],


cart:
JSON.parse(localStorage.getItem("cart")) || [],


page:"home",


search:"",


category:"all"

};



const $ = id => document.getElementById(id);



function save(){

localStorage.setItem(
"products",
JSON.stringify(state.products)
);


localStorage.setItem(
"cart",
JSON.stringify(state.cart)
);


render();

}





/* =========================
PRODUCT SYSTEM
========================= */


function addProduct(product){


product.id = Date.now();


state.products.unshift(product);


save();


}





function addToCart(id){


const product =
state.products.find(
p=>p.id===id
);


if(!product)return;



const item =
state.cart.find(
p=>p.id===id
);



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


}






function removeCart(id){


state.cart =
state.cart.filter(
p=>p.id!==id
);


save();

}





function changeQty(id,value){


const item =
state.cart.find(
p=>p.id===id
);



if(!item)return;


item.qty += value;


if(item.qty<=0){

removeCart(id);

}

else{

save();

}


}





/* =========================
SEARCH + CATEGORY
========================= */


function getProducts(){


return state.products.filter(p=>{


const search =
p.name
.toLowerCase()
.includes(
state.search
);



const category =
state.category==="all" ||
p.category===state.category;



return search && category;


});


}





/* =========================
PRODUCT DISPLAY
========================= */


function productHTML(p){


return `


<div class="card">


<img src="${p.image || ''}">


<div class="card-content">


<h3>
${p.name}
</h3>


<span class="category">
${p.category}
</span>


<p class="price">

${p.price} Birr

</p>



<button class="add-to-cart"
onclick="addToCart(${p.id})">

Add Cart

</button>


</div>


</div>


`;

}





function renderProducts(){


const products =
getProducts();



const all =
$("products-container");


const featured =
$("featured-products");



const html =
products.length

?

products.map(productHTML).join("")

:

`

<div class="empty-state">

<h3>
No products yet
</h3>

<p>
Be the first seller on HornMarket
</p>

</div>

`;



if(all)
all.innerHTML=html;



if(featured)
featured.innerHTML=
products.slice(0,4)
.map(productHTML)
.join("");



if($("product-count"))

$("product-count").innerHTML =
state.products.length;


}





/* =========================
CART
========================= */


function renderCart(){


const box =
$("cart-items");


if(!box)return;



box.innerHTML =
state.cart.length

?

state.cart.map(item=>`


<div class="cart-item">


<div>

<h4>
${item.name}
</h4>


<p>
${item.price} Birr
</p>


</div>



<div>


<button onclick="changeQty(${item.id},-1)">
-
</button>


${item.qty}


<button onclick="changeQty(${item.id},1)">
+
</button>


<button onclick="removeCart(${item.id})">

Remove

</button>


</div>


</div>


`).join("")


:

"<p>Your cart is empty</p>";





const count =
state.cart.reduce(
(a,b)=>a+b.qty,
0
);



if($("cart-count"))

$("cart-count").innerHTML=count;



let total =
state.cart.reduce(
(a,b)=>a+(b.price*b.qty),
0
);



if($("cart-total"))

$("cart-total").innerHTML =
"Total: "+total+" Birr";


}





/* =========================
PAGE SYSTEM
========================= */


function showPage(page){


document
.querySelectorAll(".page")
.forEach(
p=>p.classList.add("hidden")
);



const target =
$(page+"-page");


if(target)

target.classList.remove("hidden");


}





/* =========================
EVENTS
========================= */


document.addEventListener(
"click",
e=>{


const page =
e.target.dataset.page;


if(page){

showPage(page);

}



});





$("sell-form")?.addEventListener(
"submit",
e=>{


e.preventDefault();



addProduct({


name:
$("product-name").value,


price:
Number(
$("product-price").value
),


category:
$("product-category").value,


image:
$("product-image").value,


description:
$("product-description").value


});



e.target.reset();


showPage("home");


});





$("search")?.addEventListener(
"input",
e=>{


state.search =
e.target.value.toLowerCase();


render();


});







document
.querySelectorAll(".category-btn")
.forEach(btn=>{


btn.onclick=()=>{


state.category =
btn.innerText==="All"
?
"all"
:
btn.innerText;


render();


};


});





/* CART OPEN CLOSE */


$("open-cart")?.addEventListener(
"click",
()=>{

$("cart-panel")
.classList.remove("hidden");

});



$("close-cart")?.addEventListener(
"click",
()=>{

$("cart-panel")
.classList.add("hidden");

});







render();
