
/* ======================================================
   BOLLARS ADMIN ACCESS
   HOMEPAGE 5-CLICK LOGO + VERIFICATION MODAL
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================
       ELEMENTS
    ================================================== */

    const logo = document.getElementById("adminAccessLogo");
    const modal = document.getElementById("adminVerificationModal");
    const overlay = document.getElementById("adminModalOverlay");
    const closeButton = document.getElementById("closeAdminModal");

    const form = document.getElementById("adminVerificationForm");
    const passwordInput = document.getElementById("adminPassword");
    const togglePassword = document.getElementById("toggleAdminPassword");
    const errorMessage = document.getElementById("verificationError");


    /* ==================================================
       LOGO CHECK
    ================================================== */

    if (!logo) {
        console.warn(
            "Bollars Admin Access: #adminAccessLogo was not found."
        );

        return;
    }


    /* ==================================================
       5-CLICK CONFIGURATION
    ================================================== */

    const REQUIRED_CLICKS = 5;
    const CLICK_TIMEOUT = 2000;

    let clickCount = 0;
    let clickTimer = null;


    /* ==================================================
       OPEN ADMIN MODAL
    ================================================== */

    function openAdminModal() {

        if (!modal) return;

        modal.classList.add("active");

        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        if (passwordInput) {
            passwordInput.value = "";
        }

        if (errorMessage) {
            errorMessage.textContent = "";
        }

        if (passwordInput) {
            passwordInput.type = "password";
        }

        if (togglePassword) {

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

            const icon = togglePassword.querySelector("i");

            if (icon) {
                icon.className = "ri-eye-line";
            }
        }

        setTimeout(() => {

            if (passwordInput) {
                passwordInput.focus();
            }

        }, 100);

    }


    /* ==================================================
       CLOSE ADMIN MODAL
    ================================================== */

    function closeAdminModal() {

        if (!modal) return;

        modal.classList.remove("active");

        modal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

        if (passwordInput) {
            passwordInput.value = "";
        }

        if (errorMessage) {
            errorMessage.textContent = "";
        }

    }


    /* ==================================================
       5-CLICK LOGO TRIGGER
    ================================================== */

    logo.addEventListener("click", (event) => {

        /*
         * Prevent the logo link from immediately
         * navigating back to index.html.
         */
        event.preventDefault();

        clickCount++;

        clearTimeout(clickTimer);


        if (clickCount === REQUIRED_CLICKS) {

            clickCount = 0;

            openAdminModal();

            return;
        }


        clickTimer = setTimeout(() => {

            clickCount = 0;

        }, CLICK_TIMEOUT);

    });


    /* ==================================================
       CLOSE BUTTON
    ================================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAdminModal
        );

    }


    /* ==================================================
       OVERLAY
    ================================================== */

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeAdminModal
        );

    }


    /* ==================================================
       ESCAPE KEY
    ================================================== */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            modal &&
            modal.classList.contains("active")
        ) {

            closeAdminModal();

        }

    });


    /* ==================================================
       PASSWORD VISIBILITY
    ================================================== */

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );


            const icon =
                togglePassword.querySelector("i");

            if (icon) {

                icon.className =
                    isPassword
                        ? "ri-eye-off-line"
                        : "ri-eye-line";

            }

        });

    }


    /* ==================================================
       ADMIN PASSWORD
    ================================================== */

    const ADMIN_PASSWORD = "Bollarsadmin2026";


    /* ==================================================
       VERIFICATION
    ================================================== */

    if (form && passwordInput && errorMessage) {

        form.addEventListener("submit", (event) => {

            event.preventDefault();

            const enteredPassword =
                passwordInput.value.trim();

            errorMessage.textContent = "";


            if (!enteredPassword) {

                errorMessage.textContent =
                    "Please enter the administrator password.";

                passwordInput.focus();

                return;

            }


            if (enteredPassword !== ADMIN_PASSWORD) {

                errorMessage.textContent =
                    "Incorrect administrator password.";

                passwordInput.select();

                return;

            }


            /* ==========================================
               SUCCESS
            ========================================== */

            closeAdminModal();

            window.location.href = "admin.html";

        });

    }

});


