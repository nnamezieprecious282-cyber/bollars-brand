/*==========================================
            BOLLARS CART SYSTEM
==========================================*/

const Cart = (() => {

    const STORAGE_KEY = "bollars_cart";

  function getCart() {

    let cart = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

    // Get currently available products
    const allProducts =
        typeof ProductStore !== "undefined"
            ? ProductStore.getAll()
            : products;

    const validIds =
        new Set(allProducts.map(product => product.id));

    // Remove products that no longer exist
    const validCart = cart.filter(item =>
        item && validIds.has(item.id)
    );

    // Keep cart storage clean
    if (validCart.length !== cart.length) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(validCart)
        );

    }

    validCart.forEach(item => {

        if (!("size" in item)) {

            item.size = null;

        }

        if (!("color" in item)) {

            item.color = "Default";

        }

    });

    return validCart;

}

    function saveCart(cart) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );

    }

    function getTotalItems() {

        return getCart().reduce((total, item) => {

            return total + item.quantity;

        }, 0);

    }

    function updateBadge() {

    const total = getTotalItems();

    const desktopCart =
        document.getElementById("cartCount");

    const mobileCart =
        document.getElementById("mobileCartCount");

    [desktopCart, mobileCart].forEach(counter => {

        if (!counter) return;

        if (total > 0) {

            const firstItem =
                counter.style.display === "none";

            counter.textContent = total;

            counter.style.display = "flex";

            if (firstItem) {

                counter.classList.remove("badge-pop");

                void counter.offsetWidth;

                counter.classList.add("badge-pop");

            }

        } else {

            counter.style.display = "none";

        }

    });

}

    function remove(productId) {

        const cart = getCart().filter(item => {

            return item.id !== productId;

        });

        saveCart(cart);

        updateBadge();

    }

    function add(productId) {

    const cart = getCart();

    const existing = cart.find(item => item.id === productId);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

         id: productId,

         quantity: 1,

         size: null,

         color: "Default"

});

    }

    saveCart(cart);

    updateBadge();

    return cart;

}

function increase(productId) {

    const cart = getCart();

    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity++;

    saveCart(cart);

    updateBadge();

}

function decrease(productId) {

    const cart = getCart();

    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity--;

    if (item.quantity <= 0) {

        const index = cart.findIndex(product => {

            return product.id === productId;

        });

        cart.splice(index,1);

    }

    saveCart(cart);

    updateBadge();

}

function updateSize(productId, size){

    const cart = getCart();

    const item = cart.find(product => product.id === productId);

    if(!item) return;

    item.size = size;

    saveCart(cart);

}

function updateColor(productId, color){

    const cart = getCart();

    const item = cart.find(product => product.id === productId);

    if(!item) return;

    item.color = color;

    saveCart(cart);

}

    function clear() {

        saveCart([]);

        updateBadge();

    }

  return {

    getCart,
    saveCart,
    getTotalItems,
    updateBadge,

    add,
    remove,

    increase,
    decrease,

    updateSize,
    updateColor,

    clear

   };

})();


/*==========================================
        GLOBAL CART FUNCTIONS
==========================================*/

/*==========================================
            ADD TO CART
==========================================*/

function addToCart(productId) {

    Cart.add(productId);

    Cart.updateBadge();

    refreshCartButtons();

}

function removeFromCart(productId) {

    Cart.remove(productId);

    refreshCartButtons();

}

/*==========================================
        REFRESH CART BUTTONS
==========================================*/

function refreshCartButtons() {

    const cart = Cart.getCart();

    document.querySelectorAll(".add-cart-btn").forEach(button => {

        const id = button.dataset.id;

        if (!id) return;

        const item = cart.find(product => product.id === id);

        if (item) {

            button.innerHTML = `Added (${item.quantity}) ✓`;

        } else {

            button.innerHTML = "Add To Cart";

        }

    });

}


document.addEventListener("DOMContentLoaded", () => {

    Cart.updateBadge();

    refreshCartButtons();

});

function initWishlistRedirect() {

    const buttons = document.querySelectorAll(

        "#wishlistBtn, #mobileWishlistBtn"

    );

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            window.location.href = "wish.html";

        });

    });

}

initWishlistRedirect();