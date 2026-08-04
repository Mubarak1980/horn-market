/* =====================================
   HORNMARKET APP ENGINE
===================================== */


const state = {

products:
JSON.parse(localStorage.getItem("products")) || [],


cart:
JSON.parse(localStorage.getItem("cart")) || [],


favorites:
JSON.parse(localStorage.getItem("favorites")) || [],


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


localStorage.setItem(
"favorites",
JSON.stringify(state.favorites)
);


render();

}





/* ==============================
PRODUCT MANAGEMENT
============================== */


function addProduct(product){

product.id = Date.now();


product.date =
new Date().toISOString();



state.products.unshift(product);


save();

}




function addToCart(id){


const product =
state.products.find(
p=>p.id===id
);



if(!product)return;



const existing =
state.cart.find(
p=>p.id===id
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





/* ==============================
SEARCH
============================== */


function searchProducts(text){

state.search =
text.toLowerCase();


render();


}





/* ==============================
FILTER
============================== */


function getProducts(){


return state.products.filter(product=>{


const matchSearch =
product.name
.toLowerCase()
.includes(state.search);



const matchCategory =
state.category==="all" ||
product.category===state.category;



return matchSearch && matchCategory;


});


}





/* ==============================
RENDER PRODUCTS
============================== */


function renderProducts(){


const box =
$("products-container");


if(!box)return;



const products =
getProducts();



if(products.length===0){


box.innerHTML=`

<div class="empty">

No products available

</div>

`;

return;

}



box.innerHTML =
products.map(p=>`


<div class="product-card">


<img 
src="${p.image || 'images/default.png'}"
onerror="this.src='images/default.png'"
>


<h3>
${p.name}
</h3>


<p class="location">
📍 ${p.location || "Ethiopia"}
</p>


<strong>
${p.price} Birr
</strong>



<button onclick="addToCart(${p.id})">

Add Cart

</button>


</div>


`).join("");



}





/* ==============================
CART DISPLAY
============================== */


function renderCart(){


const box =
$("cart-items");


if(!box)return;



box.innerHTML =
state.cart.map(item=>`


<div class="cart-item">


<h4>
${item.name}
</h4>


<p>
${item.price} Birr
</p>



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


`).join("");



const count =
state.cart.reduce(
(a,b)=>a+b.qty,
0
);



if($("cart-count"))

$("cart-count").innerHTML=count;



}





/* ==============================
PAGE ROUTING
============================== */


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


state.page=page;


}





/* ==============================
MAIN RENDER
============================== */


function render(){


renderProducts();

renderCart();


}




/* ==============================
EVENTS
============================== */


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
Number($("product-price").value),


category:
$("product-category").value,


image:
$("product-image").value,


location:"Ethiopia"


});



e.target.reset();


alert(
"Product published successfully"
);



});





$("search")?.addEventListener(
"input",
e=>{


searchProducts(
e.target.value
);


});





render();
