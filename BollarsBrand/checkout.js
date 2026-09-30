
/*======================================================
                BOLLARS CHECKOUT SYSTEM
                CHECKOUT.JS — CHECKOUT + SHIPPING
======================================================*/

const BOLLARS_ADMIN_WHATSAPP =
    "2349061374997";

let transferReceiptFile = null;
let openBankPaymentModal = null;

document.addEventListener("DOMContentLoaded", () => {

    initWishlist();

    initCheckout();

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

/*======================================================
                    INITIALIZE
======================================================*/

function initCheckout() {

    const cart = Cart.getCart();


    /*
        Checkout should never contain an empty order.
        If the cart is empty, return the customer to cart.html.
    */

    if (cart.length === 0) {

        window.location.href = "cart.html";

        return;

    }


    /*
        Restore previously entered checkout information.
    */

    restoreCheckoutDraft();


    /*
        Render the current cart.
    */

    renderCheckoutItems(cart);


    /*
        Initialize shipping after the delivery
        information has been restored.
    */

    initShipping();

    initCheckoutDraft();

    initPaymentMethods();

    initBankTransferModal();

    const bankPaymentModal =
    initBankPaymentModal();

    initOpayPaymentModal();

    initTransferSubmissionModal();

    initPaymentConfirmationModal();

    initPlaceOrder();

    initStateSelector();

}

/*======================================================
                GET PRODUCT
======================================================*/

function getCheckoutProduct(productId) {

    return typeof ProductStore !== "undefined"

        ? ProductStore.getById(productId)

        : products.find(product =>
            product.id === productId
        );

}


/*======================================================
                GET CART SUBTOTAL
                RESULT IS NGN
======================================================*/

function getCheckoutSubtotal() {

    const cart = Cart.getCart();

    let subtotal = 0;


    cart.forEach(item => {

        const product =
            getCheckoutProduct(item.id);


        if (!product) return;


        const productPriceNaira =
            convertToNaira(product.price);


        subtotal +=
            productPriceNaira * item.quantity;

    });


    return subtotal;

}


/*======================================================
                RENDER CHECKOUT ITEMS
======================================================*/

function renderCheckoutItems(cart) {

    const container =
        document.getElementById("checkoutItems");

    if (!container) return;


    let html = "";


    cart.forEach(item => {

        const product =
            getCheckoutProduct(item.id);


        if (!product) return;


        const itemTotal =
            convertToNaira(product.price)
            * item.quantity;


        html += `

            <article class="checkout-item">

                <div class="checkout-item-image">

                    <img
                        src="${product.image}"
                        alt="${product.name}">

                </div>


                <div class="checkout-item-details">

                    <h3>${product.name}</h3>

                    <p>
                        Qty: ${item.quantity}
                        · Size: ${item.size || "Not selected"}
                        · Colour: ${item.color || "Default"}
                    </p>

                </div>


                <span class="checkout-item-price">

                    ${formatNaira(itemTotal)}

                </span>

            </article>

        `;

    });


    container.innerHTML = html;


    updateCheckoutSummary(
        getCheckoutSubtotal()
    );

}


/*======================================================
                SHIPPING INITIALIZATION
======================================================*/

function initShipping() {

    const stateField =
        document.getElementById("deliveryState");

    const areaField =
        document.getElementById("deliveryCity");


    /*
        Recalculate shipping when state changes.
    */

    if (stateField) {

        stateField.addEventListener(
            "change",
            updateShippingQuote
        );

    }


    /*
        Recalculate shipping when area changes.
    */

    if (areaField) {

        areaField.addEventListener(
            "input",
            updateShippingQuote
        );

        areaField.addEventListener(
            "change",
            updateShippingQuote
        );

    }


    /*
        Calculate initial shipping.
    */

    updateShippingQuote();

}


/*======================================================
                GET CHECKOUT LOCATION
======================================================*/

function getCheckoutLocation() {

    const stateField =
        document.getElementById("deliveryState");

    const areaField =
        document.getElementById("deliveryCity");


    return {

        state:
            stateField
                ? stateField.value.trim()
                : "",

        area:
            areaField
                ? areaField.value.trim()
                : ""

    };

}


/*======================================================
                UPDATE SHIPPING QUOTE
======================================================*/

function updateShippingQuote() {

    if (
        typeof Shipping === "undefined"
    ) {

        console.warn(
            "Bollars Shipping: Shipping system unavailable."
        );

        return;

    }


    const location =
        getCheckoutLocation();


    /*
        Manual shipping is currently active.
        API support will be connected later.
    */

     const quote = Shipping.getManualQuote(
    location.state,
    location.area                                              
);

 /*
        Shipping is already stored in NGN.
        DO NOT use formatPrice().
    */

    const shippingFeeElement =
        document.getElementById("shippingFee");


    if (shippingFeeElement) {

        shippingFeeElement.textContent =
            formatNaira(quote.fee);

    }


    /*
        Update checkout summary.
    */

    updateCheckoutSummary(
        getCheckoutSubtotal(),
        quote.fee
    );

}


/*======================================================
                UPDATE CHECKOUT SUMMARY
======================================================*/

function updateCheckoutSummary(
    subtotal,
    shipping = null
) {

    /*
        Shipping is already NGN.
    */

    if (shipping === null) {

        shipping =
            typeof Shipping !== "undefined"
                ? Shipping.getDefaultFee()
                : 0;

    }


    /*
        Both values are now NGN.
    */

    const total =
        subtotal + shipping;


    const subtotalElement =
        document.getElementById("checkoutSubtotal");

    const shippingElement =
        document.getElementById("checkoutShipping");

    const totalElement =
        document.getElementById("checkoutTotal");


    if (subtotalElement) {

        subtotalElement.textContent =
            formatNaira(subtotal);

    }


    if (shippingElement) {

        shippingElement.textContent =
            formatNaira(shipping);

    }


    if (totalElement) {

        totalElement.textContent =
            formatNaira(total);

    }

}


/*======================================================
                CHECKOUT VALIDATION
======================================================*/

function validateCheckoutForm() {

    const requiredFields = [

        {
            id: "customerName",
            message: "Please enter your full name."
        },

        {
            id: "customerEmail",
            message: "Please enter your email address."
        },

        {
            id: "customerPhone",
            message: "Please enter your phone number."
        },

        {
            id: "deliveryAddress",
            message: "Please enter your delivery address."
        },

        {
            id: "deliveryCity",
            message: "Please enter your city."
        },

        {
            id: "deliveryState",
            message: "Please select your delivery state."
        }

    ];


    /*==================================================
                CHECK REQUIRED FIELDS
    ==================================================*/

    for (const field of requiredFields) {

        const element =
            document.getElementById(field.id);

        if (!element) continue;


        if (!element.value.trim()) {

            showCheckoutNotification(
                field.message
            );

            focusCheckoutField(element);

            return false;

        }

    }


  /*==================================================
                    CHECK EMAIL
==================================================*/

const emailField =
    document.getElementById("customerEmail");


if (emailField) {

    const email =
        emailField.value.trim();


    if (!isValidEmail(email)) {

        showCheckoutNotification(
            "Please enter a valid email address."
        );

        focusCheckoutField(emailField);

        return false;

    }

}


/*==================================================
                    CHECK PHONE
==================================================*/

const phoneField =
    document.getElementById("customerPhone");


if (phoneField) {

    const phone =
        phoneField.value.replace(/\D/g, "");


    if (!isValidNigerianPhone(phone)) {

        showCheckoutNotification(
            "Please enter a valid Nigerian phone number with 11 digits."
        );

        focusCheckoutField(phoneField);

        return false;

    }

}

    /*==================================================
                    CHECK CART SIZES
    ==================================================*/

    const cart =
        Cart.getCart();


    const missingSize =
        cart.find(item => !item.size);


    if (missingSize) {

        showCheckoutNotification(
            "Please select a size for every product before placing your order."
        );

        return false;

    }


    /*==================================================
                    VALIDATION PASSED
    ==================================================*/

    return true;

}


/*======================================================
                    EMAIL VALIDATION
======================================================*/

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

/*======================================================
            NIGERIAN PHONE VALIDATION
======================================================*/

function isValidNigerianPhone(phone) {

    /*
        Nigerian local phone numbers use
        11 digits and normally begin with 0.

        Example:
        08012345678
    */

    return /^0\d{10}$/.test(phone);

}

/*======================================================
                FOCUS CHECKOUT FIELD
======================================================*/

function focusCheckoutField(element) {

    element.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


    setTimeout(() => {

        element.focus();

    }, 400);

}


/*======================================================
                CHECKOUT NOTIFICATION
======================================================*/

function showCheckoutNotification(message) {

    /*
        Remove an existing notification first.
        This prevents duplicate notifications.
    */

    const existing =
        document.querySelector(
            ".checkout-notification"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement("div");


    notification.className =
        "checkout-notification";


    notification.innerHTML = `

        <div class="checkout-notification-icon">

            <i class="ri-error-warning-line"></i>

        </div>

        <div class="checkout-notification-content">

            <strong>
                Almost there!
            </strong>

            <p>
                ${message}
            </p>

        </div>

        <button
            type="button"
            class="checkout-notification-close"
            aria-label="Close notification">

            <i class="ri-close-line"></i>

        </button>

    `;


    document.body.appendChild(notification);


    const closeButton =
        notification.querySelector(
            ".checkout-notification-close"
        );


    closeButton.addEventListener(
        "click",
        () => {

            notification.remove();

        }
    );


    /*
        Automatically remove notification
        after 5 seconds.
    */

    setTimeout(() => {

        if (notification.isConnected) {

            notification.remove();

        }

    }, 5000);

}


/*======================================================
                PLACE ORDER INITIALIZATION
======================================================*/

function initPlaceOrder() {

    const placeOrderButton =
        document.getElementById("placeOrderBtn");


    if (!placeOrderButton) return;


    placeOrderButton.addEventListener(
        "click",
        handlePlaceOrder
    );

}


/*======================================================
                HANDLE PLACE ORDER
======================================================*/

function handlePlaceOrder() {

    const isValid =
        validateCheckoutForm();

    if (!isValid) {
        return;
    }


    /*==========================================
                GET PAYMENT METHOD
    ==========================================*/

    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    if (
        !selectedPayment ||
        selectedPayment.disabled
    ) {

        showCheckoutNotification(
            "Please select a payment method."
        );

        return;

    }


    const paymentMethod =
        selectedPayment.value;

        if (
    paymentMethod ===
    Payment.METHODS.BANK_TRANSFER
) {

    const bankTransferModal =
        document.getElementById(
            "bankTransferModal"
        );

    if (bankTransferModal) {

        bankTransferModal.classList.add(
            "active"
        );

        bankTransferModal.setAttribute(
            "aria-hidden",
            "false"
        );

        const accountName =
            document.getElementById(
                "transferAccountName"
            );

        if (accountName) {
            accountName.focus();
        }

    }

    return;

}

if (
    paymentMethod ===
    Payment.METHODS.OPAY
) {

    processOpayPayment();

    return;
}

    /*==========================================
                COLLECT ORDER DATA
    ==========================================*/

    const orderData =
        collectCheckoutData();


    /*==========================================
                GENERATE ORDER ID
    ==========================================*/

    orderData.orderId =
        OrderStore.generateOrderId();


    /*==========================================
                SAVE PAYMENT METHOD
    ==========================================*/

    orderData.payment.method =
        paymentMethod;


    /*==========================================
                SAVE PENDING ORDER
    ==========================================*/

    const saved =
        OrderStore.savePendingOrder(
            orderData
        );

    if (!saved) {

        showCheckoutNotification(
            "Unable to save your order. Please try again."
        );

        return;

    }


    /*==========================================
                PREPARE PAYMENT
    ==========================================*/

    const payment =
        Payment.preparePayment(
            orderData,
            paymentMethod
        );


    if (!payment.valid) {

        showCheckoutNotification(
            payment.message ||
            "Unable to prepare payment."
        );

        return;

    }


    /*==========================================
                    DEBUG
    ==========================================*/

    console.log(
        "Bollars Pending Order:",
        orderData
    );

    console.log(
        "Bollars Payment:",
        payment.payment
    );


    showCheckoutNotification(
        "Your order is ready for payment."
    );

}

/*======================================================
                COLLECT CHECKOUT DATA
======================================================*/

function collectCheckoutData() {

    const customer = {

        name:
            document
                .getElementById("customerName")
                ?.value
                .trim() || "",

        email:
            document
                .getElementById("customerEmail")
                ?.value
                .trim() || "",

        phone:
            document
                .getElementById("customerPhone")
                ?.value
                .replace(/\D/g, "") || ""

    };


    const delivery = {

        address:
            document
                .getElementById("deliveryAddress")
                ?.value
                .trim() || "",

        city:
            document
                .getElementById("deliveryCity")
                ?.value
                .trim() || "",

        state:
            document
                .getElementById("deliveryState")
                ?.value
                .trim() || "",

        notes:
            document
                .getElementById("deliveryNotes")
                ?.value
                .trim() || ""

    };


    const cart =
        Cart.getCart();


    const items = [];


    cart.forEach(item => {

        const product =
            getCheckoutProduct(item.id);


        if (!product) return;


        items.push({

            productId: product.id,

            name: product.name,

            quantity: item.quantity,

            size: item.size || null,

            color: item.color || "Default",

            priceUSD: product.price,

            priceNGN:
                convertToNaira(product.price),

            itemTotalNGN:
                convertToNaira(product.price)
                * item.quantity

        });

    });


    const subtotal =
        getCheckoutSubtotal();


    const location =
        getCheckoutLocation();


 const shippingQuote = Shipping.getManualQuote(
    location.state,
    location.area
);

    const shipping =
        shippingQuote.fee;


    const total =
        subtotal + shipping;

    return {

        orderDate:
            new Date().toISOString(),

        customer,

        delivery,

        items,

        pricing: {

            subtotal,

            shipping,

            total

        },
 shipping: {
    fee: shipping,
    method: shippingQuote.method,
    provider: shippingQuote.provider,
    source: shippingQuote.source,
    state: location.state,
    area: location.area
},

        payment: {

            status: "pending",

            reference: null

        },

        status: "pending"

    };

}

/*======================================================
            CHECKOUT DRAFT PERSISTENCE
======================================================*/

const CHECKOUT_DRAFT_KEY =
    "bollars_checkout_draft";


/*======================================================
                GET CHECKOUT FIELDS
======================================================*/

function getCheckoutFields() {

    return {

        customerName:
            document.getElementById("customerName"),

        customerEmail:
            document.getElementById("customerEmail"),

        customerPhone:
            document.getElementById("customerPhone"),

        deliveryAddress:
            document.getElementById("deliveryAddress"),

        deliveryCity:
            document.getElementById("deliveryCity"),

        deliveryState:
            document.getElementById("deliveryState"),

        deliveryNotes:
            document.getElementById("deliveryNotes")

    };

}


/*======================================================
                SAVE CHECKOUT DRAFT
======================================================*/

function saveCheckoutDraft() {

    const fields =
        getCheckoutFields();


    const draft = {

        customerName:
            fields.customerName?.value || "",

        customerEmail:
            fields.customerEmail?.value || "",

        customerPhone:
            fields.customerPhone?.value || "",

        deliveryAddress:
            fields.deliveryAddress?.value || "",

        deliveryCity:
            fields.deliveryCity?.value || "",

        deliveryState:
            fields.deliveryState?.value || "",

        deliveryNotes:
            fields.deliveryNotes?.value || ""

    };


    try {

        localStorage.setItem(
            CHECKOUT_DRAFT_KEY,
            JSON.stringify(draft)
        );

    } catch (error) {

        console.warn(
            "Bollars Checkout: Unable to save checkout draft.",
            error
        );

    }

}


/*======================================================
                RESTORE CHECKOUT DRAFT
======================================================*/

function restoreCheckoutDraft() {

    let draft;


    try {

        draft =
            JSON.parse(
                localStorage.getItem(
                    CHECKOUT_DRAFT_KEY
                )
            );

    } catch (error) {

        console.warn(
            "Bollars Checkout: Invalid checkout draft.",
            error
        );

        return;

    }


    if (!draft) return;


    const fields =
        getCheckoutFields();


   Object.keys(fields).forEach(key => {

    const field =
        fields[key];

    if (!field) return;

    if (
        Object.prototype.hasOwnProperty.call(
            draft,
            key
        )
    ) {
        field.value =
            draft[key];
    }
});

/*
    Restore the visible state search field.

    deliveryState is the hidden value used by
    checkout/shipping logic, while
    deliveryStateSearch is what the customer sees.
*/
const stateSearch =
    document.getElementById(
        "deliveryStateSearch"
    );

const selectedState =
    document.getElementById(
        "deliveryState"
    );

if (
    stateSearch &&
    selectedState &&
    selectedState.value
) {
    stateSearch.value =
        selectedState.value;
}
}


/*======================================================
                INITIALIZE DRAFT
======================================================*/

function initCheckoutDraft() {

    const fields =
        getCheckoutFields();


    Object.values(fields).forEach(field => {

        if (!field) return;


        field.addEventListener(
            "input",
            saveCheckoutDraft
        );


        field.addEventListener(
            "change",
            saveCheckoutDraft
        );

    });

}

function initPaymentMethods() {

    const paymentMethods =
        document.querySelectorAll(
            ".payment-method"
        );

    if (!paymentMethods.length) {
        return;
    }


    function updateActiveMethod() {

        paymentMethods.forEach(method => {

            const radio =
                method.querySelector(
                    'input[name="paymentMethod"]'
                );

            if (!radio) return;


            method.classList.toggle(
                "active",
                radio.checked
            );

        });

    }


    paymentMethods.forEach(method => {

        const radio =
            method.querySelector(
                'input[name="paymentMethod"]'
            );

        if (!radio || radio.disabled) {
            return;
        }


        method.addEventListener(
            "click",
            () => {

                radio.checked = true;

                updateActiveMethod();

            }
        );


        radio.addEventListener(
            "change",
            updateActiveMethod
        );

    });


    /*
        Make sure the visual state
        matches the actual radio state
        when checkout loads.
    */

    updateActiveMethod();

}

function initBankTransferModal() {

    const modal =
        document.getElementById(
            "bankTransferModal"
        );

    const closeButton =
        document.getElementById(
            "closeBankTransferModal"
        );

    const overlay =
        modal?.querySelector(
            ".payment-modal-overlay"
        );

    const continueButton =
        document.getElementById(
            "continueBankTransfer"
        );

    const accountName =
        document.getElementById(
            "transferAccountName"
        );

    const bankName =
        document.getElementById(
            "transferBankName"
        );


    if (
        !modal ||
        !closeButton ||
        !continueButton ||
        !accountName ||
        !bankName
    ) {
        return;
    }


    /*==========================================
                    OPEN MODAL
    ==========================================*/

    function openModal() {

        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        accountName.focus();

    }


    /*==========================================
                    CLOSE MODAL
    ==========================================*/

  function closeModal() {

    /*
        Remove focus from an element inside
        the modal before hiding it.
    */

    if (
        modal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }

    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}

    /*==========================================
                    VALIDATE FORM
    ==========================================*/

    function validateTransferDetails() {

        const customerAccountName =
            accountName.value.trim();

        const customerBankName =
            bankName.value.trim();


        if (!customerAccountName) {

            showCheckoutNotification(
                "Please enter the account holder name."
            );

            accountName.focus();

            return false;

        }


        if (!customerBankName) {

            showCheckoutNotification(
                "Please enter the sending bank."
            );

            bankName.focus();

            return false;

        }


        return true;

    }


    /*==========================================
                    CLOSE EVENTS
    ==========================================*/

    closeButton.addEventListener(
        "click",
        closeModal
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    /*==========================================
                CONTINUE TO PAYMENT
    ==========================================*/

    continueButton.addEventListener(
        "click",
        () => {

            if (!validateTransferDetails()) {
                return;
            }


       const transferDetails = {

            accountHolderName:
                 accountName.value.trim(),

            sendingBank:
                 bankName.value.trim()

    };

       closeModal();

        setTimeout(() => {

        processBankTransferPayment(
           transferDetails
    );

           }, 0);

        }
    );

    /*==========================================
                    ESCAPE KEY
    ==========================================*/

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeModal();

            }

        }
    );


    return {
        openModal,
        closeModal
    };

}

function processBankTransferPayment(transferDetails) {

    if (
        !transferDetails ||
        !transferDetails.accountHolderName ||
        !transferDetails.sendingBank
    ) {
        showCheckoutNotification(
            "Please provide your account holder name and sending bank.",
            "error"
        );
        return;
    }

    const checkoutData =
        collectCheckoutData();

    if (!checkoutData) {
        return;
    }

    /*
    ==========================================
        CREATE CART FINGERPRINT
    ==========================================
    */

    const cartFingerprint =
        OrderStore.createCartFingerprint(
            checkoutData.items
        );

    if (!cartFingerprint) {
        showCheckoutNotification(
            "Unable to identify the items in this order. Please refresh and try again.",
            "error"
        );
        return;
    }

    /*
    ==========================================
        CREATE ORDER FINGERPRINT
    ==========================================
    */

    checkoutData.cartFingerprint =
        cartFingerprint;

    const orderFingerprint =
        OrderStore.createOrderFingerprint(
            checkoutData
        );

    if (!orderFingerprint) {
        showCheckoutNotification(
            "Unable to identify this order. Please check your delivery details and try again.",
            "error"
        );
        return;
    }

    /*
    ==========================================
        CHECK FOR EXISTING ACTIVE ORDER
    ==========================================
    */

    const existingOrder =
        OrderStore.findActiveOrderByOrderFingerprint(
            orderFingerprint
        );

    /*
    ==========================================
        PAYMENT ALREADY SUBMITTED
    ==========================================
    */

    if (
        existingOrder &&
        existingOrder.status ===
            "awaiting_verification"
    ) {

        showCheckoutNotification(
            `Payment for order ${existingOrder.orderId} is already awaiting verification. Please wait for confirmation.`,
            "error"
        );

        console.warn(
            "Bollars Checkout: Payment already submitted.",
            existingOrder
        );

        return;
    }

    /*
    ==========================================
        DETERMINE WHETHER TO RESUME
        OR CREATE A NEW ORDER
    ==========================================
    */

    const resumableStatuses = [
        "pending",
        "pending_payment"
    ];

    const isResumingOrder =
        existingOrder &&
        resumableStatuses.includes(
            existingOrder.status
        );

    /*
    ==========================================
        ORDER ID
    ==========================================
    */

    if (isResumingOrder) {

        /*
        --------------------------------------
            RESUME EXISTING ORDER
        --------------------------------------
        */

        checkoutData.orderId =
            existingOrder.orderId;

        /*
        Preserve original creation date.
        */

        checkoutData.orderDate =
            existingOrder.orderDate ||
            checkoutData.orderDate;

        console.log(
            "Bollars Checkout: Resuming existing order.",
            existingOrder.orderId
        );

    } else {

        /*
        --------------------------------------
            CREATE NEW ORDER
        --------------------------------------
        */

        checkoutData.orderId =
            OrderStore.generateOrderId();

        console.log(
            "Bollars Checkout: Creating new order.",
            checkoutData.orderId
        );
    }

    /*
    ==========================================
        SAVE FINGERPRINTS
    ==========================================
    */

    checkoutData.cartFingerprint =
        cartFingerprint;

    checkoutData.orderFingerprint =
        orderFingerprint;

    /*
    ==========================================
        ORDER STATE
    ==========================================
    */

    checkoutData.status =
        "pending_payment";

    /*
    ==========================================
        PAYMENT DATA
    ==========================================
    */

    checkoutData.payment = {

        method:
            Payment.METHODS.BANK_TRANSFER,

        status:
            Payment.STATUS.PENDING,

        transferDetails: {

            accountHolderName:
                transferDetails.accountHolderName
                    .trim(),

            sendingBank:
                transferDetails.sendingBank
                    .trim()

        }

    };

    /*
    ==========================================
        PREPARE PAYMENT
    ==========================================
    */

    const preparedPayment =
        Payment.preparePayment(
            checkoutData,
            Payment.METHODS.BANK_TRANSFER
        );

    if (
        !preparedPayment ||
        !preparedPayment.valid
    ) {

        showCheckoutNotification(
            preparedPayment?.message ||
            "Unable to prepare your payment. Please try again.",
            "error"
        );

        return;
    }

    checkoutData.payment = {

        ...checkoutData.payment,

        ...preparedPayment.payment

    };

    /*
    ==========================================
        SAVE PENDING ORDER
    ==========================================
    */

    const saved =
        OrderStore.savePendingOrder(
            checkoutData
        );

    if (!saved) {

        showCheckoutNotification(
            "Unable to save your order. Please try again.",
            "error"
        );

        return;
    }

    /*
    ==========================================
        OPEN PAYMENT DETAILS
    ==========================================
    */

    if (
        typeof openBankPaymentModal ===
        "function"
    ) {

        openBankPaymentModal();

    } else {

        console.error(
            "openBankPaymentModal is not available. Bank payment modal may not be initialized."
        );

        showCheckoutNotification(
            "Payment window could not be opened. Please refresh and try again.",
            "error"
        );
    }

}

function processOpayPayment() {

    const checkoutData =
        collectCheckoutData();

    if (!checkoutData) {
        return;
    }

    const cartFingerprint =
        OrderStore.createCartFingerprint(
            checkoutData.items
        );

    if (!cartFingerprint) {

        showCheckoutNotification(
            "Unable to identify the items in this order. Please refresh and try again.",
            "error"
        );

        return;
    }

    checkoutData.cartFingerprint =
        cartFingerprint;

    const orderFingerprint =
        OrderStore.createOrderFingerprint(
            checkoutData
        );

    if (!orderFingerprint) {

        showCheckoutNotification(
            "Unable to identify this order. Please check your delivery details and try again.",
            "error"
        );

        return;
    }

    const existingOrder =
        OrderStore.findActiveOrderByOrderFingerprint(
            orderFingerprint
        );

    if (
        existingOrder &&
        existingOrder.status ===
            "awaiting_verification"
    ) {

        showCheckoutNotification(
            `Payment for order ${existingOrder.orderId} is already awaiting verification. Please wait for confirmation.`,
            "error"
        );

        console.warn(
            "Bollars Checkout: Payment already submitted.",
            existingOrder
        );

        return;
    }

    const resumableStatuses = [
        "pending",
        "pending_payment"
    ];

    const isResumingOrder =
        existingOrder &&
        resumableStatuses.includes(
            existingOrder.status
        );

    if (isResumingOrder) {

        checkoutData.orderId =
            existingOrder.orderId;

        checkoutData.orderDate =
            existingOrder.orderDate ||
            checkoutData.orderDate;

        console.log(
            "Bollars Checkout: Resuming existing OPay order.",
            existingOrder.orderId
        );

    } else {

        checkoutData.orderId =
            OrderStore.generateOrderId();

        console.log(
            "Bollars Checkout: Creating new OPay order.",
            checkoutData.orderId
        );
    }

    checkoutData.cartFingerprint =
        cartFingerprint;

    checkoutData.orderFingerprint =
        orderFingerprint;

    checkoutData.status =
        "pending_payment";

    checkoutData.payment = {

        method:
            Payment.METHODS.OPAY,

        status:
            Payment.STATUS.PENDING

    };

    const preparedPayment =
        Payment.preparePayment(
            checkoutData,
            Payment.METHODS.OPAY
        );

    if (
        !preparedPayment ||
        !preparedPayment.valid
    ) {

        showCheckoutNotification(
            preparedPayment?.message ||
            "Unable to prepare your payment. Please try again.",
            "error"
        );

        return;
    }

    checkoutData.payment = {

        ...checkoutData.payment,

        ...preparedPayment.payment

    };

    const saved =
        OrderStore.savePendingOrder(
            checkoutData
        );

    if (!saved) {

        showCheckoutNotification(
            "Unable to save your order. Please try again.",
            "error"
        );

        return;
    }

    const opayModal =
        document.getElementById(
            "opayPaymentModal"
        );

    if (!opayModal) {

        console.error(
            "Bollars Checkout: OPay payment modal is not available."
        );

        showCheckoutNotification(
            "Payment window could not be opened. Please refresh and try again.",
            "error"
        );

        return;
    }

    opayModal.classList.add(
        "active"
    );

    opayModal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function initBankPaymentModal() {

    const modal =
        document.getElementById(
            "bankTransferPaymentModal"
        );

    const closeButton =
        document.getElementById(
            "closeBankPaymentModal"
        );

    const overlay =
        modal?.querySelector(
            ".payment-modal-overlay"
        );

    const copyButton =
        document.getElementById(
            "copyBankAccount"
        );

    const transferMadeButton =
        document.getElementById(
            "transferMadeBtn"
        );


    if (
        !modal ||
        !closeButton ||
        !copyButton ||
        !transferMadeButton
    ) {
        return;
    }


    /*==========================================
                    CLOSE MODAL
    ==========================================*/

   function closeModal() {

    /*
        Remove focus from an element inside
        the modal before hiding it.
    */

    if (
        modal.contains(
            document.activeElement
        )
    ) {

        document.activeElement.blur();

    }


    modal.classList.remove(
        "active"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}

    /*==========================================
                POPULATE BANK DETAILS
    ==========================================*/

    function populateBankDetails() {

        const config =
            Payment.getConfig();

        const order =
            OrderStore.getPendingOrder();


        if (!order) {

            showCheckoutNotification(
                "No pending order was found."
            );

            return false;

        }


        const bankTransfer =
            config.bankTransfer;


        if (
            !bankTransfer ||
            !bankTransfer.enabled
        ) {

            showCheckoutNotification(
                "Bank transfer is currently unavailable."
            );

            return false;

        }


        const amount =
            document.getElementById(
                "bankPaymentAmount"
            );

        const bankName =
            document.getElementById(
                "bankPaymentBankName"
            );

        const accountName =
            document.getElementById(
                "bankPaymentAccountName"
            );

        const accountNumber =
            document.getElementById(
                "bankPaymentAccountNumber"
            );


        if (
            !amount ||
            !bankName ||
            !accountName ||
            !accountNumber
        ) {

            return false;

        }


        amount.textContent =
            formatNaira(
                order.pricing.total
            );


        bankName.textContent =
            bankTransfer.bankName ||
            "Not configured";


        accountName.textContent =
            bankTransfer.accountName ||
            "Not configured";


        accountNumber.textContent =
            bankTransfer.accountNumber ||
            "Not configured";


        return true;

    }


    /*==========================================
                    OPEN MODAL
    ==========================================*/

    function openModal() {

        const populated =
            populateBankDetails();


        if (!populated) {
            return;
        }


        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /*==========================================
                    COPY ACCOUNT
    ==========================================*/

    copyButton.addEventListener(
        "click",
        async () => {

            const accountNumber =
                document.getElementById(
                    "bankPaymentAccountNumber"
                );


            if (
                !accountNumber ||
                !accountNumber.textContent.trim() ||
                accountNumber.textContent.trim() === "—" ||
                accountNumber.textContent.trim() === "Not configured"
            ) {

                showCheckoutNotification(
                    "Account number is not available."
                );

                return;

            }


            try {

                await navigator.clipboard.writeText(
                    accountNumber.textContent.trim()
                );

                showCheckoutNotification(
                    "Account number copied."
                );

            } catch (error) {

                console.warn(
                    "Bollars Payment: Unable to copy account number.",
                    error
                );

                showCheckoutNotification(
                    "Unable to copy account number."
                );

            }

        }
    );


    /*==========================================
                    CLOSE EVENTS
    ==========================================*/

    closeButton.addEventListener(
        "click",
        closeModal
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeModal();

            }

        }
    );


    /*==========================================
                TRANSFER MADE BUTTON
    ==========================================*/
    
       transferMadeButton.addEventListener(
    "click",
    () => {

        closeModal();


        const submissionModal =
            document.getElementById(
                "transferSubmissionModal"
            );


        if (!submissionModal) {

            showCheckoutNotification(
                "Unable to open transfer submission."
            );

            return;

        }


        submissionModal.classList.add(
            "active"
        );

        submissionModal.setAttribute(
            "aria-hidden",
            "false"
        );


        const referenceInput =
            document.getElementById(
                "transferReference"
            );


        if (referenceInput) {

            referenceInput.focus();

        }

    }
);
  openBankPaymentModal =
    openModal;


return {
    openModal,
    closeModal
};

}

function initOpayPaymentModal() {

    const modal =
        document.getElementById(
            "opayPaymentModal"
        );

    if (!modal) {
        return;
    }


    const closeBtn =
        document.getElementById(
            "closeOpayPaymentModal"
        );

    const amountElement =
        document.getElementById(
            "opayPaymentAmount"
        );

    const accountNameElement =
        document.getElementById(
            "opayPaymentAccountName"
        );

    const accountNumberElement =
        document.getElementById(
            "opayPaymentAccountNumber"
        );

    const copyAccountBtn =
        document.getElementById(
            "copyOpayAccount"
        );


    /*==========================================
                CLOSE MODAL
    ==========================================*/

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "active"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


    /*==========================================
                COPY OPAY ACCOUNT
    ==========================================*/

    if (copyAccountBtn) {

        copyAccountBtn.addEventListener(
            "click",
            async () => {

                const accountNumber =
                    accountNumberElement?.textContent
                        ?.trim();

                if (
                    !accountNumber ||
                    accountNumber === "—"
                ) {
                    return;
                }

                try {

                    await navigator.clipboard.writeText(
                        accountNumber
                    );

                    showCheckoutNotification(
                        "OPay account number copied."
                    );

                } catch (error) {

                    console.error(
                        "Unable to copy OPay account number:",
                        error
                    );

                }

            }
        );

    }

    const transferMadeButton =
    document.getElementById(
        "opayTransferMadeBtn"
    );


/*==========================================
            TRANSFER MADE BUTTON
==========================================*/

if (transferMadeButton) {

    transferMadeButton.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "active"
            );

            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            const submissionModal =
                document.getElementById(
                    "transferSubmissionModal"
                );


            if (!submissionModal) {

                showCheckoutNotification(
                    "Unable to open transfer submission."
                );

                return;

            }


            submissionModal.classList.add(
                "active"
            );

            submissionModal.setAttribute(
                "aria-hidden",
                "false"
            );


            const referenceInput =
                document.getElementById(
                    "transferReference"
                );


            if (referenceInput) {

                referenceInput.focus();

            }

        }
    );

}

    /*==========================================
            POPULATE PAYMENT DETAILS
    ==========================================*/

    const config =
        Payment.getConfig();

    const opay =
        config?.opay || {};


    if (accountNameElement) {

        accountNameElement.textContent =
            opay.accountName ||
            "—";

    }


    if (accountNumberElement) {

        accountNumberElement.textContent =
            opay.accountNumber ||
            "—";

    }


    /*==========================================
                GET CURRENT ORDER
    ==========================================*/

    const pendingOrder =
        OrderStore.getPendingOrder();


    if (
        pendingOrder &&
        pendingOrder.pricing &&
        amountElement
    ) {

        amountElement.textContent =
            formatNaira(
                pendingOrder.pricing.total
            );

    }

}

function initTransferSubmissionModal() {

    const modal =
        document.getElementById(
            "transferSubmissionModal"
        );

    const closeButton =
        document.getElementById(
            "closeTransferSubmission"
        );

    const overlay =
        modal?.querySelector(
            ".payment-modal-overlay"
        );

    const referenceInput =
        document.getElementById(
            "transferReference"
        );

    const amountInput =
        document.getElementById(
            "transferAmount"
        );

    const receiptInput =
        document.getElementById(
            "transferReceipt"
        );

    const submitButton =
        document.getElementById(
            "submitTransfer"
        );


    if (
        !modal ||
        !closeButton ||
        !referenceInput ||
        !amountInput ||
        !receiptInput ||
        !submitButton
    ) {
        return;
    }


    /*==========================================
                    CLOSE MODAL
    ==========================================*/

    function closeModal() {

        if (
            modal.contains(
                document.activeElement
            )
        ) {

            document.activeElement.blur();

        }


        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*==========================================
                    OPEN MODAL
    ==========================================*/

    function openModal() {

        const order =
            OrderStore.getPendingOrder();


        if (!order) {

            showCheckoutNotification(
                "No pending order was found."
            );

            return;

        }


        amountInput.value =
            Number(
                order.pricing.total
            ).toFixed(2);


        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        referenceInput.focus();

    }


    /*==========================================
                RECEIPT SELECTION
    ==========================================*/

    receiptInput.addEventListener(
        "change",
        () => {

            const file =
                receiptInput.files?.[0];


            transferReceiptFile =
                null;


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showCheckoutNotification(
                    "Please upload a JPG, PNG, WebP or PDF receipt."
                );

                receiptInput.value = "";

                return;

            }


            const maxSize =
                5 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                showCheckoutNotification(
                    "Receipt must be 5MB or smaller."
                );

                receiptInput.value = "";

                return;

            }


            transferReceiptFile =
                file;

        }
    );


    /*==========================================
                SUBMIT TRANSFER
    ==========================================*/

    submitButton.addEventListener(
        "click",
        () => {

            const order =
                OrderStore.getPendingOrder();


            if (!order) {

                showCheckoutNotification(
                    "No pending order was found."
                );

                return;

            }


            const reference =
                referenceInput.value.trim();


            const amount =
                Number(
                    amountInput.value
                );


            const orderTotal =
                Number(
                    order.pricing.total
                );


            /*----------------------------------
                    REFERENCE
            ----------------------------------*/

            if (!reference) {

                showCheckoutNotification(
                    "Please enter your transfer reference."
                );

                referenceInput.focus();

                return;

            }


            /*----------------------------------
                    AMOUNT
            ----------------------------------*/

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                showCheckoutNotification(
                    "Please enter a valid transfer amount."
                );

                amountInput.focus();

                return;

            }


            if (
                Math.abs(
                    amount - orderTotal
                ) > 0.01
            ) {

                showCheckoutNotification(
                    `The transfer amount must be ${formatNaira(orderTotal)}.`
                );

                amountInput.focus();

                return;

            }


            /*----------------------------------
                    RECEIPT
            ----------------------------------*/

            if (!transferReceiptFile) {

                showCheckoutNotification(
                    "Please upload your payment receipt."
                );

                receiptInput.focus();

                return;

            }


            /*----------------------------------
                UPDATE PAYMENT INFORMATION
            ----------------------------------*/

            order.payment.reference =
                reference;


            order.payment.transferAmount =
                amount;


            order.payment.transferReceipt = {

                fileName:
                    transferReceiptFile.name,

                fileType:
                    transferReceiptFile.type,

                fileSize:
                    transferReceiptFile.size

            };


            order.payment.status =
                Payment.STATUS.AWAITING_VERIFICATION;


            order.status =
                "awaiting_verification";

/*----------------------------------
        SAVE CURRENT ORDER
----------------------------------*/

const saved =
    OrderStore.savePendingOrder(
        order
    );

if (!saved) {

    showCheckoutNotification(
        "Unable to save your order session. Please try again."
    );

    return;

}


/*----------------------------------
        SAVE SUBMITTED ORDER
----------------------------------*/

const submitted =
    OrderStore.saveSubmittedOrder(
        order
    );

if (!submitted) {

    showCheckoutNotification(
        "Unable to submit your payment details. Please try again."
    );

    return;

}
              closeModal();


     const confirmationModal =
        document.getElementById(
        "paymentConfirmationModal"
    );

     const confirmationOrderId =
        document.getElementById(
          "confirmationOrderId"
    );

     const confirmationAmount =
        document.getElementById(
         "confirmationAmount"
    );

    
    const confirmationPaymentMethod =
         document.getElementById(
        "confirmationPaymentMethod"
    );


if (
    confirmationModal &&
    confirmationOrderId &&
    confirmationAmount 
) {

    confirmationOrderId.textContent =
        order.orderId;

    confirmationAmount.textContent =
        formatNaira(
            order.pricing.total
        );

         if (confirmationPaymentMethod) {

    confirmationPaymentMethod.textContent =
        order.payment.method ===
        Payment.METHODS.OPAY
            ? "OPay"
            : "Bank Transfer";

}

    confirmationModal.classList.add(
        "active"
    );

    confirmationModal.setAttribute(
        "aria-hidden",
        "false"
    );

}

        }
    );

    /*==========================================
                    CLOSE EVENTS
    ==========================================*/

    closeButton.addEventListener(
        "click",
        closeModal
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeModal();

            }

        }
    );


    return {

        openModal,

        closeModal

    };

}

function initPaymentConfirmationModal() {

    const modal =
        document.getElementById(
            "paymentConfirmationModal"
        );

    const doneButton =
        document.getElementById(
            "confirmationDoneBtn"
        );

    const contactAdminButton =
       document.getElementById(
         "contactAdminBtn"
    );

    if (!modal || !doneButton) {
        return;
    }

    if (contactAdminButton) {

    contactAdminButton.addEventListener(
        "click",
        () => {

            const order =
                OrderStore.getPendingOrder();


            if (!order || !order.orderId) {

                showCheckoutNotification(
                    "Unable to find your order information."
                );

                return;

            }


            const message =
                `Hello Bollars, I have submitted a bank transfer for order ${order.orderId}. My payment is currently awaiting verification. Please confirm my payment.`;


         const whatsappUrl =
              `https://wa.me/${BOLLARS_ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

}
    function closeModal() {

        if (
            modal.contains(
                document.activeElement
            )
        ) {

            document.activeElement.blur();

        }


        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    doneButton.addEventListener(
        "click",
        () => {

            closeModal();

            window.location.href =
                "index.html";

        }
    );


    return {
        closeModal
    };

}

/*==========================================
        NIGERIAN STATE SELECTOR
==========================================*/

const NIGERIAN_STATES = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "Federal Capital Territory"
];

function initStateSelector() {
    const searchInput = document.getElementById("deliveryStateSearch");
    const stateInput = document.getElementById("deliveryState");
    const dropdown = document.getElementById("stateDropdown");

    if (!searchInput || !stateInput || !dropdown) return;

    function renderStates(searchTerm = "") {
        const query = searchTerm.trim().toLowerCase();

        const filteredStates = NIGERIAN_STATES.filter(state =>
            state.toLowerCase().includes(query)
        );

        dropdown.innerHTML = "";

        if (filteredStates.length === 0) {
            dropdown.innerHTML = `
                <div class="state-empty">
                    No state found
                </div>
            `;
            dropdown.classList.add("active");
            return;
        }

        filteredStates.forEach(state => {
            const option = document.createElement("button");

            option.type = "button";
            option.className = "state-option";
            option.textContent = state;
            option.setAttribute("role", "option");

            option.addEventListener("click", () => {
                searchInput.value = state;
                stateInput.value = state;

                dropdown.classList.remove("active");

                // Trigger change so existing checkout logic can react.
                stateInput.dispatchEvent(new Event("change", {
                    bubbles: true
                }));
            });

            dropdown.appendChild(option);
        });

        dropdown.classList.add("active");
    }

    searchInput.addEventListener("focus", () => {
        renderStates(searchInput.value);
    });

    searchInput.addEventListener("input", () => {
        // Clear the actual selected value while searching.
        stateInput.value = "";
        renderStates(searchInput.value);
    });

    document.addEventListener("click", event => {
        if (!event.target.closest("#stateSelect")) {
            dropdown.classList.remove("active");
        }
    });
}