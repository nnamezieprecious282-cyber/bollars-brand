   document.addEventListener("DOMContentLoaded", () => {

    initWishlist();

    initCart();

     if (typeof Cart !== "undefined") {

        Cart.updateBadge();

    }

    initCartRedirect();

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

/*==========================================
        WISHLIST RENDERING
==========================================*/

const wishlistContainer = document.getElementById("wishlistContainer");
const emptyWishlist = document.getElementById("emptyWishlist");
const headerCon = document.getElementById("headerCon")

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function renderWishlist() {

    const wishlist = getWishlist();

   const wishlistProducts = wishlist
    .map(id => {

        if(typeof ProductStore !== "undefined"){
            return ProductStore.getById(id);
        }

        return products.find(product =>
            String(product.id) === String(id)
        );

    })
    .filter(Boolean);

    if (wishlistProducts.length === 0) {

        wishlistContainer.classList.add("hidden");
        emptyWishlist.classList.remove("hidden");
        headerCon.classList.add("hidden");

        wishlistContainer.innerHTML = "";

        return;

    }

    emptyWishlist.classList.add("hidden");
    wishlistContainer.classList.remove("hidden");
    headerCon.classList.remove("hidden");

    wishlistContainer.innerHTML = wishlistProducts.map(product => `

        <article class="wishlist-card">

            <div class="wishlist-image">

                <img
                    src="${product.image}"
                    alt="${product.name}">

            </div>

            <div class="wishlist-info">

                <h3 class="wishlist-name">
                    ${product.name}
                </h3>

                <div class="wishlist-rating">

                       ${"★".repeat(product.rating)}

                </div>

                <div class="wishlist-price">

                            ${formatPrice(product.price)}

                </div>

                <div class="wishlist-actions">

                    <button
                        class="btn move-cart-btn"
                        data-id="${product.id}">

                        Add To Cart

                    </button>

                    <button
                        class="btn remove-wishlist-btn"
                        data-id="${product.id}">

                        Remove

                    </button>

                </div>

            </div>

        </article>

    `).join("");

}

renderWishlist();

/*==========================================
            REMOVE WISHLIST ITEM
==========================================*/

function removeWishlistItem(productId){

    wishlist = wishlist.filter(
        id => String(id) !== String(productId)
    );

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    renderWishlist();

    if(typeof Cart !== "undefined"){

        refreshWishlistCartButtons();

    }

}

/*==========================================
        WISHLIST REMOVE EVENT
==========================================*/

wishlistContainer.addEventListener("click", (e) => {

    const removeButton =
        e.target.closest(".remove-wishlist-btn");

    if(!removeButton) return;

    const productId =
        removeButton.dataset.id;

    removeWishlistItem(productId);

});

/*==========================================
            WISHLIST → CART
==========================================*/

function addWishlistItemToCart(productId){

    if(!productId) return;

    Cart.add(productId);

    Cart.updateBadge();

    refreshWishlistCartButtons();

}


/*==========================================
        REFRESH WISHLIST CART BUTTONS
==========================================*/

function refreshWishlistCartButtons(){

    const cart = Cart.getCart();

    document
        .querySelectorAll(".move-cart-btn")
        .forEach(button => {

            const id = button.dataset.id;

            if(!id) return;

            const item =
                cart.find(product =>
                    String(product.id) === String(id)
                );

            if(item){

                button.innerHTML =
                    `Added (${item.quantity}) ✓`;

            }else{

                button.innerHTML =
                    "Add To Cart";

            }

        });

}


/*==========================================
        WISHLIST CART BUTTON CLICK
==========================================*/

wishlistContainer.addEventListener("click", (e) => {

    const button =
        e.target.closest(".move-cart-btn");

    if(!button) return;

    const productId =
        button.dataset.id;

    addWishlistItemToCart(productId);

});

/*==========================================
            CART PAGE NAVIGATION
==========================================*/

const cartBtn = document.getElementById("cartBtn");

if(cartBtn){

    cartBtn.addEventListener("click", () => {

        window.location.href = "cart.html";

    });

}

document.addEventListener("DOMContentLoaded", () => {

    if(typeof Cart !== "undefined"){

        Cart.updateBadge();

        refreshWishlistCartButtons();

    }

});