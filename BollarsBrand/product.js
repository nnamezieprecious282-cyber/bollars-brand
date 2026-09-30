document.addEventListener("DOMContentLoaded", () => {

    initWishlist();

    initCart();

    if (typeof Cart !== "undefined") {

        Cart.updateBadge();

    }

    initCategoryFilter();

    initProductSearch();

    initPriceFilter();

    initSorting();

    initLoadMore();

    loadURLFilters();

    filterProducts();

});

/*=====================================
        LOAD URL PARAMETERS
=====================================*/

function loadURLFilters() {

    const params = new URLSearchParams(window.location.search);

    const category = params.get("category");
    const search = params.get("search");
    const price = params.get("price");
    const sort = params.get("sort");

    if (category) {

        filters.category = category;

        const categoryFilter =
            document.getElementById("categoryFilter");

        if (categoryFilter) {
            categoryFilter.value = category;
        }

    }

    if (search) {

        filters.search = search.toLowerCase();

        const productSearch =
            document.getElementById("productSearch");

        if (productSearch) {
            productSearch.value = search;
        }

    }

    if (price) {

        filters.price = price;

        const priceFilter =
            document.getElementById("priceFilter");

        if (priceFilter) {
            priceFilter.value = price;
        }

    }

    if (sort) {

        filters.sort = sort;

        const sortProducts =
            document.getElementById("sortProducts");

        if (sortProducts) {
            sortProducts.value = sort;
        }

    }

}

/*=====================================
        SAVE URL PARAMETERS
=====================================*/

function saveURLFilters() {

    const params = new URLSearchParams();

    if (filters.category !== "all") {

        params.set(
            "category",
            filters.category
        );

    }

    if (filters.search !== "") {

        params.set(
            "search",
            filters.search
        );

    }

    if (filters.price !== "all") {

        params.set(
            "price",
            filters.price
        );

    }

    if (filters.sort !== "default") {

        params.set(
            "sort",
            filters.sort
        );

    }

    const query =
        params.toString();

    const newURL =
        query
            ? `${window.location.pathname}?${query}`
            : window.location.pathname;

    window.history.replaceState(
        {},
        "",
        newURL
    );

}

let filteredProducts = [...ProductStore.getAll()];

let productsPerLoad = 12;

let visibleProducts = 12;

const filters = {

    category: "all",

    search: "",

    price: "all",

    sort: "default"

};

function initCategoryFilter() {

    const categoryFilter =
        document.getElementById("categoryFilter");

    categoryFilter.addEventListener("change", () => {
         filters.category = categoryFilter.value;

// Clear previous search
        filters.search = "";
        document.getElementById("productSearch").value = "";

filterProducts();
saveURLFilters();

    });

}


/*=====================================
        PRODUCT SEARCH
=====================================*/
function initProductSearch() {

    const input =
        document.getElementById("productSearch");

    input.addEventListener("input", () => {

         filters.search =
         input.value.trim().toLowerCase();

       // Reset category back to All
         filters.category = "all";
         document.getElementById("categoryFilter").value = "all";

filterProducts();
saveURLFilters();

    });

}

/*=====================================
        PRICE FILTER
=====================================*/

function initPriceFilter() {

    const priceFilter =
        document.getElementById("priceFilter");

    priceFilter.addEventListener("change", () => {

        filters.price = priceFilter.value;

        filters.search = "";
        document.getElementById("productSearch").value = "";

        filterProducts();
        saveURLFilters();

    });

}

/*=====================================
            SORT PRODUCTS
=====================================*/

function initSorting() {

    const sortProducts =
        document.getElementById("sortProducts");

    sortProducts.addEventListener("change", () => {

        filters.sort = sortProducts.value;

        filterProducts();
        saveURLFilters();

    });

}

function filterProducts() {

  filteredProducts = [...ProductStore.getAll()];

    /*=========================
        CATEGORY FILTER
    =========================*/

    if (filters.category !== "all") {

        filteredProducts = filteredProducts.filter(product =>

            product.category === filters.category

        );

    }

    /*=========================
        LIVE SEARCH
    =========================*/

    if (filters.search !== "") {

        filteredProducts = filteredProducts.filter(product =>

            product.name
                .toLowerCase()
                .includes(filters.search)

        );

    }

    /*=========================
        PRICE FILTER
    =========================*/

if (filters.price !== "all") {

    filteredProducts = filteredProducts.filter(product => {

        const nairaPrice = product.price * 1500;

        if (filters.price === "0-50000") {

            return nairaPrice <= 50000;

        }

        if (filters.price === "50000-100000") {

            return nairaPrice >= 50000 &&
                   nairaPrice <= 100000;

        }

        if (filters.price === "100000+") {

            return nairaPrice >= 100000;

        }

        return true;

    });

}
    /*=========================
        SORT PRODUCTS
    =========================*/

    switch (filters.sort) {

        case "priceLow":

            filteredProducts.sort((a, b) =>

                a.price - b.price

            );

            break;

        case "priceHigh":

            filteredProducts.sort((a, b) =>

                b.price - a.price

            );

            break;

        case "rating":

            filteredProducts.sort((a, b) =>

                b.rating - a.rating

            );

            break;

           case "newest":

    filteredProducts.sort((a, b) =>

        b.order - a.order

    );

    break;

case "default":

    filteredProducts.sort((a, b) =>

        a.order - b.order

    );

    break;

    }

         visibleProducts = productsPerLoad;

       displayProducts(
            filteredProducts.slice(0, visibleProducts)
          );

updateLoadMoreButton();
}

/*=====================================
        LOAD MORE BUTTON
=====================================*/

function initLoadMore() {

    const loadMoreBtn =
        document.getElementById("loadMoreBtn");

    loadMoreBtn.addEventListener("click", () => {

        visibleProducts += productsPerLoad;

        displayProducts(

            filteredProducts.slice(0, visibleProducts)

        );

        updateLoadMoreButton();

    });

}

/*=====================================
    UPDATE LOAD MORE BUTTON
=====================================*/

function updateLoadMoreButton() {

    const loadMoreBtn =
        document.getElementById("loadMoreBtn");

    if (visibleProducts >= filteredProducts.length) {

        loadMoreBtn.style.display = "none";

    } else {

        loadMoreBtn.style.display = "inline-flex";

    }

}

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

/*==========================================
                CART
==========================================*/

function initCart() {

    document.addEventListener("click", (e) => {

        const button = e.target.closest(".add-cart-btn");

        if (!button) return;

        const id = button.dataset.id;

        if (!id) return;

        addToCart(id);

    });

}