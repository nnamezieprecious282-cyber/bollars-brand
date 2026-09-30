/*==========================================
        BOLLARS BRAND JAVASCRIPT
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initHeader();

    initMobileMenu();

    initTheme();

    initCartRedirect();

});
/*==========================================
            STICKY HEADER
==========================================*/

function initHeader() {

    const header = document.querySelector(".header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

}

/*==========================================
            MOBILE MENU
==========================================*/

function initMobileMenu() {

    const menuBtn = document.getElementById("menuBtn");

    const navLinks = document.querySelector(".nav-links");

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        const icon = menuBtn.querySelector("i");

        if (navLinks.classList.contains("active")) {

            icon.classList.remove("ri-menu-line");
            icon.classList.add("ri-close-line");

        } else {

            icon.classList.remove("ri-close-line");
            icon.classList.add("ri-menu-line");

        }

    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

            const icon = menuBtn.querySelector("i");

            icon.classList.remove("ri-close-line");
            icon.classList.add("ri-menu-line");

        });

    });

}
/*==========================================
            DARK THEME
==========================================*/

function initTheme() {

    const themeButtons = document.querySelectorAll(".theme-toggle");

    const savedTheme = localStorage.getItem("theme");

    // Apply saved theme
    if (savedTheme === "dark") {

        document.body.setAttribute("data-theme", "dark");

        themeButtons.forEach(button => {

            const icon = button.querySelector("i");

            icon.classList.remove("ri-moon-line");
            icon.classList.add("ri-sun-line");

        });

    }

    // Add click event to BOTH buttons
    themeButtons.forEach(button => {

        button.addEventListener("click", () => {

            const isDark =
                document.body.getAttribute("data-theme") === "dark";

            if (isDark) {

                document.body.removeAttribute("data-theme");

                localStorage.setItem("theme", "light");

                themeButtons.forEach(btn => {

                    const icon = btn.querySelector("i");

                    icon.classList.remove("ri-sun-line");
                    icon.classList.add("ri-moon-line");

                });

            } else {

                document.body.setAttribute("data-theme", "dark");

                localStorage.setItem("theme", "dark");

                themeButtons.forEach(btn => {

                    const icon = btn.querySelector("i");

                    icon.classList.remove("ri-moon-line");
                    icon.classList.add("ri-sun-line");

                });

            }

        });

    });

}

/*==========================================
        CART PAGE REDIRECT
==========================================*/

function initCartRedirect() {

    const cartButtons = document.querySelectorAll(

        "#cartBtn, #mobileCartBtn"

    );

    cartButtons.forEach(button => {

        button.addEventListener("click", () => {

            window.location.href = "cart.html";

        });

    });

}

function getValidWishlist() {
    const allProducts = ProductStore.getAll();
    const validIds = new Set(allProducts.map(product => product.id));

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const validWishlist = wishlist.filter(id => validIds.has(id));

    // Remove deleted/non-existing product IDs
    if (validWishlist.length !== wishlist.length) {
        localStorage.setItem("wishlist", JSON.stringify(validWishlist));
    }

    return validWishlist;
}