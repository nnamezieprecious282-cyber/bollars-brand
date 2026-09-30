/*==========================================
        BOLLARS BRAND JAVASCRIPT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initScrollReveal();

    initCategoryLinks();

    initSearch();

    initCart();

    initWishlist();

    renderHomeProducts();

});

/*==========================================
            SCROLL REVEAL
==========================================*/

function initScrollReveal() {

    const revealElements = document.querySelectorAll(

        ".hero-content, .hero-image, .section-heading, .category-card, .product-card, .about-image, .about-content, .feature-card, .testimonial-card, .newsletter-content"

    );

    revealElements.forEach(element => {

        element.classList.add("reveal");

    });

    function revealOnScroll() {

        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(element => {

            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {

                element.classList.add("active");

            }

        });

    }

    window.addEventListener("scroll", revealOnScroll);

    revealOnScroll();

}

/*==========================================
        CATEGORY PAGE REDIRECT
==========================================*/

function initCategoryLinks() {

    const categories = document.querySelectorAll(".category-card");

    categories.forEach(category => {

        category.addEventListener("click", () => {

            const selectedCategory = category.dataset.category;

            window.location.href =
                `product.html?category=${selectedCategory}`;

        });

    });

}

/*==========================================
                SHOPPING CART
==========================================*/

function initCart(){

    if(typeof Cart !== "undefined"){

        Cart.updateBadge();

    }

    document.addEventListener("click",(e)=>{

        const button =
            e.target.closest(".add-cart-btn");

        if(!button) return;

        const id = button.dataset.id;

        if(!id) return;

        addToCart(id);

    });

}

/*==========================================
            PRODUCT SEARCH
==========================================*/

function initSearch() {

    const searchBtn = document.getElementById("searchBtn");
    const overlay = document.getElementById("searchOverlay");
    const closeBtn = document.getElementById("closeSearch");
    const input = document.getElementById("searchInput");
  
    

    // Open Search
    searchBtn.addEventListener("click", () => {

        overlay.classList.add("active");

        input.focus();

    });

    // Close Search
    closeBtn.addEventListener("click", () => {

        overlay.classList.remove("active");

        input.value = "";

    });

    // Search Function
    function goToProducts() {

        const keyword = input.value.trim();

        if (keyword === "") return;

        overlay.classList.remove("active");

        window.location.href =
            `product.html?search=${encodeURIComponent(keyword)}`;

    }

    // Press Enter
    input.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            goToProducts();

        }

    });

}


/*==========================================
            WISHLIST
==========================================*/

function initWishlist() {

    let wishlist = getValidWishlist();

    const desktopCount =
        document.getElementById("wishlistCount");

    const mobileCount =
        document.getElementById("mobileWishlistCount");

 function updateCount() {

    if (desktopCount) {

        const count = wishlist.length;

        desktopCount.textContent = count;
               if (count > 0) {

    const firstItem =
        desktopCount.style.display === "none";

    desktopCount.textContent = count;

    desktopCount.style.display = "flex";

    if (firstItem) {

        desktopCount.classList.remove("badge-pop");

        void desktopCount.offsetWidth;

        desktopCount.classList.add("badge-pop");

    }

} else {

    desktopCount.style.display = "none";

}

    }

    if (mobileCount) {

        const count = wishlist.length;

        mobileCount.textContent = count;

        if (count > 0) {

    const firstItem =
        mobileCount.style.display === "none";

   mobileCount.textContent = count;

   mobileCount.style.display = "flex";

    if (firstItem) {

        mobileCount.classList.remove("badge-pop");

        void mobileCount.offsetWidth;

        mobileCount.classList.add("badge-pop");

    }

} else {

         mobileCount.style.display = "none";

}

    }

}
    function refreshWishlistIcons() {

        document.querySelectorAll(".wishlist-btn").forEach(button => {

            const id = button.dataset.id;

            if (!id) return;

            const icon = button.querySelector("i");

            if (wishlist.includes(id)) {

                button.classList.add("active");

                icon.classList.remove("ri-heart-3-line");
                icon.classList.add("ri-heart-3-fill");

            } else {

                button.classList.remove("active");

                icon.classList.remove("ri-heart-3-fill");
                icon.classList.add("ri-heart-3-line");

            }

        });

    }

    updateCount();

    refreshWishlistIcons();

    document.addEventListener("click", (e) => {

        const button = e.target.closest(".wishlist-btn");

        if (!button) return;

        const id = button.dataset.id;

        if (!id) return;

        if (wishlist.includes(id)) {

            wishlist = wishlist.filter(item => item !== id);

        } else {

            wishlist.push(id);

        }

        localStorage.setItem(
            "wishlist",
            JSON.stringify(wishlist)
        );

        updateCount();

        refreshWishlistIcons();

    });

}

window.refreshWishlistIcons = function () {

        let wishlist = getValidWishlist();

    document.querySelectorAll(".wishlist-btn").forEach(button => {

        const id = button.dataset.id;

        const icon = button.querySelector("i");

        if (!icon) return;

        if (wishlist.includes(id)) {

            button.classList.add("active");

            icon.classList.remove("ri-heart-3-line");

            icon.classList.add("ri-heart-3-fill");

        } else {

            button.classList.remove("active");

            icon.classList.remove("ri-heart-3-fill");

            icon.classList.add("ri-heart-3-line");

        }

    });

};

/*==========================================
        HOME PRODUCTS
==========================================*/

function renderHomeProducts() {

    const container =
        document.getElementById("homeProducts");

    if (!container) return;

  const activeProducts = ProductStore.getAll().filter(
    product => product && product.id && product.image
);
    // Create a shuffled copy so the original
    // product order is never modified.
    const shuffledProducts =
        [...activeProducts].sort(() => Math.random() - 0.5);

    const homeProducts =
        shuffledProducts.slice(0, 6);

    container.innerHTML = "";

    homeProducts.forEach(product => {

        container.innerHTML += `

        <article class="product-card">

            <span class="product-badge">
                ${product.badge || ""}
            </span>

            <button
                class="product-wishlist-btn wishlist-btn wishlist-data"
                data-id="${product.id}">

                <i class="ri-heart-3-line"></i>

            </button>

            <img
                src="${product.image}"
                alt="${product.name}">

            <div class="product-info">

                <h3>${product.name}</h3>

                <div class="rating">

                    ${"★".repeat(product.rating)}

                </div>

                <h4>${formatPrice(product.price)}</h4>

                <div class="product-buttons">

                    <button
                        class="add-cart-btn"
                        data-id="${product.id}">

                        Add To Cart

                    </button>

                </div>

            </div>

        </article>

        `;

    });

    if (typeof refreshWishlistIcons === "function") {

        refreshWishlistIcons();

    }

    if (typeof refreshCartButtons === "function") {

        refreshCartButtons();

    }

}
