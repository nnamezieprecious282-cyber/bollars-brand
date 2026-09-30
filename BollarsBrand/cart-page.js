   document.addEventListener("DOMContentLoaded", () => {

     Cart.updateBadge();

     renderCart();

    initWishlist();

});


function renderCart() {

    const container =
        document.getElementById("cartContainer");

    const cart =
        Cart.getCart();

        if(cart.length === 0){

    toggleEmptyCart(true);

    document.getElementById("cartItemCount").textContent = "0 Items";

    document.getElementById("subtotal").textContent = "₦0.00";

    document.getElementById("total").textContent = "₦0.00";

    return;

}

toggleEmptyCart(false);


    let html = "";

    let subtotal = 0;

    let totalItems = 0;

    cart.forEach(item => {

 const product =
        typeof ProductStore !== "undefined"
        ? ProductStore.getById(item.id)
        : products.find(p => p.id === item.id);

    if(!product) return;

    const itemTotal =
        product.price * item.quantity;

    subtotal += itemTotal;

    totalItems += item.quantity;

        html += `

    <article class="cart-item">

        <img
            src="${product.image}"
            alt="${product.name}">

     <div class="cart-details">

    <h3>${product.name}</h3>

  <p>${formatPrice(product.price)}</p>

    <!-- Size -->

    <div class="cart-option">

        <label>

            Size
            <span class="required">*</span>

        </label>

        <select
            class="size-select"
            data-id="${product.id}">

            <option value="">

                Select Size

            </option>

            <option value="S"
                ${item.size === "S" ? "selected" : ""}>

                S

            </option>

            <option value="M"
                ${item.size === "M" ? "selected" : ""}>

                M

            </option>

            <option value="L"
                ${item.size === "L" ? "selected" : ""}>

                L

            </option>

            <option value="XL"
                ${item.size === "XL" ? "selected" : ""}>

                XL

            </option>

            <option value="XXL"
                ${item.size === "XXL" ? "selected" : ""}>

                XXL

            </option>

        </select>

    </div>

    <!-- Colour -->

    <div class="cart-option">

        <label>

            Colour

        </label>

        <select
            class="color-select"
            data-id="${product.id}">

            <option
                value="Default"
                ${item.color === "Default" ? "selected" : ""}>

                Default

            </option>

            <option
                value="Black"
                ${item.color === "Black" ? "selected" : ""}>

                Black

            </option>

            <option
                value="White"
                ${item.color === "White" ? "selected" : ""}>

                White

            </option>

            <option
                value="Red"
                ${item.color === "Red" ? "selected" : ""}>

                Red

            </option>

            <option
                value="Blue"
                ${item.color === "Blue" ? "selected" : ""}>

                Blue

            </option>

            <option
                value="Green"
                ${item.color === "Green" ? "selected" : ""}>

                Green

            </option>

        </select>

    </div>

</div>

        <div class="cart-item-quantity">

    <button
        class="qty-btn decrease-btn"
        data-id="${product.id}">
        −
    </button>

    <span class="quantity-number">

        ${item.quantity}

    </span>

    <button
        class="qty-btn increase-btn"
        data-id="${product.id}">
        +

    </button>

  </div>

    <div class="cart-item-total">

      <h3>${formatPrice(itemTotal)}</h3>

    <button
        class="remove-btn"
        data-id="${product.id}">

        Remove

    </button>

  </div>

    </article>

    `;

});

container.innerHTML = html;

document.getElementById("cartItemCount")
.textContent =
`${totalItems} Item${totalItems > 1 ? "s" : ""}`;

document.getElementById("subtotal")
.textContent =
formatPrice(subtotal);

document.getElementById("total")
.textContent =
formatPrice(subtotal);

}

document.addEventListener("click",(e)=>{

    const increase = e.target.closest(".increase-btn");

    const decrease = e.target.closest(".decrease-btn");

    const remove = e.target.closest(".remove-btn");

    if(increase){

        Cart.increase(increase.dataset.id);

        renderCart();

    }

    if(decrease){

        Cart.decrease(decrease.dataset.id);

        renderCart();

    }

    if(remove){

        Cart.remove(remove.dataset.id);

        renderCart();

    }

});

/*=====================================
        WISHLIST
=====================================*/

let wishlist =
(JSON.parse(localStorage.getItem("wishlist")) || [])
.filter(id => id);

function initWishlist(){

    updateWishlistCount();

    document.addEventListener("click",(e)=>{

        const button =
        e.target.closest(".wishlist-btn");

        if(!button) return;

        const id = button.dataset.id;

        if (!id) return;

        toggleWishlist(id);

    });

    refreshWishlistIcons();

}

function toggleWishlist(id){

    if(!id) return;

    if(wishlist.includes(id)){

        wishlist = wishlist.filter(item => item !== id);

    }else{

        wishlist.push(id);

    }

    wishlist = wishlist.filter(item => item);

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    refreshWishlistIcons();

}

function updateWishlistCount(){

    wishlist = wishlist.filter(Boolean);

    const desktopCount =
        document.getElementById("wishlistCount");

    const mobileCount =
        document.getElementById("mobileWishlistCount");

    const total = wishlist.length;

    [desktopCount, mobileCount].forEach(counter => {

        if(!counter) return;

        if(total > 0){

            counter.textContent = total;

            counter.style.display = "flex";

            counter.classList.remove("badge-pop");

            void counter.offsetWidth;

            counter.classList.add("badge-pop");

        }else{

            counter.style.display = "none";

        }

    });

}

function refreshWishlistIcons(){

    document
    .querySelectorAll(".wishlist-btn")
    .forEach(button=>{

        const id = button.dataset.id;

            if(!id) return;

        const icon =
        button.querySelector("i");

        if(wishlist.includes(id)){

            button.classList.add("active");

            icon.classList.remove("ri-heart-3-line");
            icon.classList.add("ri-heart-3-fill");

        }else{

            button.classList.remove("active");

            icon.classList.remove("ri-heart-3-fill");
            icon.classList.add("ri-heart-3-line");

        }

    });

}
document.addEventListener("change",(e)=>{

    if(e.target.classList.contains("size-select")){

        Cart.updateSize(

            e.target.dataset.id,

            e.target.value

        );

    }

    if(e.target.classList.contains("color-select")){

        Cart.updateColor(

            e.target.dataset.id,

            e.target.value

        );

    }

});

/*==========================================
        CHECKOUT VALIDATION
==========================================*/

function validateCheckout(){

    const cart = Cart.getCart();

    let missingSize = false;

    cart.forEach(item => {

        if(!item.size){

            missingSize = true;

        }

    });

    return !missingSize;

}

const checkoutBtn =
    document.getElementById("checkoutBtn");

checkoutBtn.addEventListener("click", () => {

    if(!validateCheckout()){

        showCheckoutModal();

        return;

    }

    window.location.href = "checkout.html";

});

function showCheckoutModal(){

    document
        .getElementById("checkoutModal")
        .classList.add("active");

}

document
.getElementById("closeCheckoutModal")
.addEventListener("click",()=>{

    document
        .getElementById("checkoutModal")
        .classList.remove("active");

});

const cartContent = document.getElementById("cartContent");
const emptyCart = document.getElementById("emptyCart");
const heroCon = document.getElementById("heroCon");

function toggleEmptyCart(isEmpty){

    cartContent.classList.toggle("hidden", isEmpty);

    emptyCart.classList.toggle("hidden", !isEmpty);

    heroCon.classList.toggle("hidden", isEmpty);

}