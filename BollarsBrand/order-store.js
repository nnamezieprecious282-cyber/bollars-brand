/*======================================================
                BOLLARS ORDER STORE
                ORDER-STORE.JS — ORDER MANAGEMENT
======================================================*/

const OrderStore = (() => {

    const PENDING_ORDER_KEY =
        "bollars_pending_order";

    const SUBMITTED_ORDERS_KEY =
        "bollars_submitted_orders";

    const ACTIVE_STATUSES = [
        "pending",
        "pending_payment",
        "awaiting_verification"
     ];

    const SUBMITTED_STATUSES = [
        "awaiting_verification",
        "paid"
    ];

    const DUPLICATE_BLOCKING_STATUSES = [
        "pending",
        "pending_payment",
        "awaiting_verification"
    ];

    /*==================================================
                    GENERATE ORDER ID
    ==================================================*/

    function generateOrderId() {

        const date = new Date();

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        const random =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        return `BB-${year}${month}${day}-${random}`;

    }


    /*==================================================
                CREATE CART FINGERPRINT
    ==================================================*/

    function createCartFingerprint(cart) {

        if (!Array.isArray(cart) || cart.length === 0) {
            return null;
        }

        const normalizedItems =
            cart
                .map(item => ({
                    productId:
                        String(item.productId ?? item.id ?? "")
                            .trim(),

                    quantity:
                        Number(item.quantity) || 0,

                    size:
                        String(item.size ?? "")
                            .trim()
                            .toLowerCase(),

                    color:
                        String(item.color ?? "")
                            .trim()
                            .toLowerCase()
                }))
                .filter(item =>
                    item.productId &&
                    item.quantity > 0
                )
                .sort((a, b) => {

                    const first =
                        `${a.productId}|${a.size}|${a.color}`;

                    const second =
                        `${b.productId}|${b.size}|${b.color}`;

                    return first.localeCompare(second);

                });

        if (normalizedItems.length === 0) {
            return null;
        }

        return normalizedItems
            .map(item =>
                [
                    item.productId,
                    item.size,
                    item.color,
                    item.quantity
                ].join(":")
            )
            .join("|");

    }
     
/*==================================================
            CREATE ORDER FINGERPRINT
==================================================*/

function createOrderFingerprint(orderData) {

    if (!orderData) {
        return null;
    }

    const cartFingerprint =
        orderData.cartFingerprint ||
        createCartFingerprint(
            orderData.items
        );

    if (!cartFingerprint) {
        return null;
    }

    const customer =
        orderData.customer || {};

    const delivery =
        orderData.delivery || {};

    const shipping =
        orderData.shipping || {};

    /*
    ----------------------------------------------
        CUSTOMER DETAILS
    ----------------------------------------------
    */

    const customerName =
        String(customer.name ?? "")
            .trim()
            .toLowerCase();

    const customerEmail =
        String(customer.email ?? "")
            .trim()
            .toLowerCase();

    const customerPhone =
        String(customer.phone ?? "")
            .trim();

    /*
    ----------------------------------------------
        DELIVERY DETAILS
    ----------------------------------------------
    */

    const state =
        String(delivery.state ?? "")
            .trim()
            .toLowerCase();

    const city =
        String(delivery.city ?? "")
            .trim()
            .toLowerCase();

    const address =
        String(delivery.address ?? "")
            .trim()
            .toLowerCase();

    /*
    ----------------------------------------------
        SHIPPING DETAILS
    ----------------------------------------------
    */

    const shippingMethod =
        String(shipping.method ?? "")
            .trim()
            .toLowerCase();

    const shippingProvider =
        String(shipping.provider ?? "")
            .trim()
            .toLowerCase();

    /*
    ----------------------------------------------
        CREATE ORDER FINGERPRINT
    ----------------------------------------------
    */

    return [
        cartFingerprint,
        customerName,
        customerEmail,
        customerPhone,
        state,
        city,
        address,
        shippingMethod,
        shippingProvider
    ].join("|");

}

    /*==================================================
                GET ORDER CART FINGERPRINT
    ==================================================*/

    function getOrderCartFingerprint(order) {

        if (!order) {
            return null;
        }

        if (order.cartFingerprint) {
            return order.cartFingerprint;
        }

        return createCartFingerprint(
            order.items
        );

    }
 
/*==================================================
            GET ORDER FINGERPRINT
==================================================*/

function getOrderFingerprint(order) {

    if (!order) {
        return null;
    }

    if (order.orderFingerprint) {
        return order.orderFingerprint;
    }

    return createOrderFingerprint(order);

}

    /*==================================================
                FIND ACTIVE DUPLICATE ORDER
    ==================================================*/

    function findActiveOrderByCartFingerprint(
        cartFingerprint
    ) {

        if (!cartFingerprint) {
            return null;
        }


        /*----------------------------------------------
            CHECK CURRENT PENDING ORDER
        ----------------------------------------------*/

        const pendingOrder =
            getPendingOrder();

      if (
         pendingOrder &&
         DUPLICATE_BLOCKING_STATUSES.includes(
         pendingOrder.status
    ) &&
          getOrderCartFingerprint(
          pendingOrder
    ) === cartFingerprint

   ) {

            return pendingOrder;

        }

        /*----------------------------------------------
            CHECK SUBMITTED ORDERS
        ----------------------------------------------*/

        const submittedOrders =
            getSubmittedOrders();

        const duplicateOrder =
            submittedOrders.find(order => {

                if (
                  !DUPLICATE_BLOCKING_STATUSES.includes(
                  order.status
               )
            ) {
                return false;
        }
                return (
                    getOrderCartFingerprint(order) ===
                    cartFingerprint
                );

            });

        return duplicateOrder || null;

    }

    /*==================================================
            FIND ACTIVE ORDER BY
            ORDER FINGERPRINT
==================================================*/

function findActiveOrderByOrderFingerprint(
    orderFingerprint
) {

    if (!orderFingerprint) {
        return null;
    }

    /*----------------------------------------------
        CHECK CURRENT PENDING ORDER
    ----------------------------------------------*/

    const pendingOrder =
        getPendingOrder();

    if (
        pendingOrder &&
        DUPLICATE_BLOCKING_STATUSES.includes(
            pendingOrder.status
        ) &&
        getOrderFingerprint(
            pendingOrder
        ) === orderFingerprint
    ) {

        return pendingOrder;

    }

    /*----------------------------------------------
        CHECK SUBMITTED ORDERS
    ----------------------------------------------*/

    const submittedOrders =
        getSubmittedOrders();

    const duplicateOrder =
        submittedOrders.find(order => {

            if (
                !DUPLICATE_BLOCKING_STATUSES.includes(
                    order.status
                )
            ) {
                return false;
            }

            return (
                getOrderFingerprint(order) ===
                orderFingerprint
            );

        });

    return duplicateOrder || null;

}


    /*==================================================
                CHECK ACTIVE DUPLICATE
    ==================================================*/

    function hasActiveOrderForCart(cart) {

        const fingerprint =
            createCartFingerprint(cart);

        if (!fingerprint) {
            return false;
        }

        return Boolean(
            findActiveOrderByCartFingerprint(
                fingerprint
            )
        );

    }


    /*==================================================
                    SAVE PENDING ORDER
    ==================================================*/

    function savePendingOrder(order) {

        if (!order) {
            return false;
        }

        try {

            localStorage.setItem(
                PENDING_ORDER_KEY,
                JSON.stringify(order)
            );

            return true;

        } catch (error) {

            console.warn(
                "Bollars Order Store: Unable to save pending order.",
                error
            );

            return false;

        }

    }


    /*==================================================
                    GET PENDING ORDER
    ==================================================*/

    function getPendingOrder() {

        try {

            const saved =
                localStorage.getItem(
                    PENDING_ORDER_KEY
                );

            if (!saved) {
                return null;
            }

            return JSON.parse(saved);

        } catch (error) {

            console.warn(
                "Bollars Order Store: Invalid pending order.",
                error
            );

            return null;

        }

    }


    /*==================================================
                    CLEAR PENDING ORDER
    ==================================================*/

    function clearPendingOrder() {

        localStorage.removeItem(
            PENDING_ORDER_KEY
        );

    }


    /*==================================================
                GET PENDING ORDER STATUS
    ==================================================*/

    function getPendingOrderStatus() {

        const order =
            getPendingOrder();

        if (!order) {
            return null;
        }

        return order.status || null;

    }


    /*==================================================
                    ACTIVE ORDER
    ==================================================*/

    function hasActiveOrder() {

        const order =
            getPendingOrder();

        if (!order) {
            return false;
        }

        return ACTIVE_STATUSES.includes(
            order.status
        );

    }


    /*==================================================
                SUBMITTED ORDER CHECK
    ==================================================*/

    function isSubmittedOrder() {

        const order =
            getPendingOrder();

        if (!order) {
            return false;
        }

        return SUBMITTED_STATUSES.includes(
            order.status
        );

    }


    /*==================================================
            AWAITING VERIFICATION CHECK
    ==================================================*/

    function isAwaitingVerification() {

        const order =
            getPendingOrder();

        if (!order) {
            return false;
        }

        return order.status ===
            "awaiting_verification";

    }


    /*==================================================
            GET ALL SUBMITTED ORDERS
    ==================================================*/

    function getSubmittedOrders() {

        try {

            const saved =
                localStorage.getItem(
                    SUBMITTED_ORDERS_KEY
                );

            if (!saved) {
                return [];
            }

            const orders =
                JSON.parse(saved);

            return Array.isArray(orders)
                ? orders
                : [];

        } catch (error) {

            console.warn(
                "Bollars Order Store: Invalid submitted orders.",
                error
            );

            return [];

        }

    }


    /*==================================================
            SAVE SUBMITTED ORDER
    ==================================================*/

    function saveSubmittedOrder(order) {

        if (!order || !order.orderId) {
            return false;
        }

        try {

            const orders =
                getSubmittedOrders();

            const existingIndex =
                orders.findIndex(
                    existingOrder =>
                        existingOrder.orderId ===
                        order.orderId
                );

            if (existingIndex !== -1) {

                orders[existingIndex] =
                    order;

            } else {

                orders.push(order);

            }

            localStorage.setItem(
                SUBMITTED_ORDERS_KEY,
                JSON.stringify(orders)
            );

            return true;

        } catch (error) {

            console.warn(
                "Bollars Order Store: Unable to save submitted order.",
                error
            );

            return false;

        }

    }


    /*==================================================
            GET SUBMITTED ORDER BY ID
    ==================================================*/

    function getSubmittedOrder(orderId) {

        if (!orderId) {
            return null;
        }

        const orders =
            getSubmittedOrders();

        return (
            orders.find(
                order =>
                    order.orderId === orderId
            ) || null
        );

    }


    /*==================================================
            CLEAR SUBMITTED ORDERS
    ==================================================*/

    function clearSubmittedOrders() {

        localStorage.removeItem(
            SUBMITTED_ORDERS_KEY
        );

    }


    /*==================================================
                    PUBLIC API
    ==================================================*/

return {

    generateOrderId,

    createCartFingerprint,

    getOrderCartFingerprint,

    createOrderFingerprint,

    getOrderFingerprint,

    findActiveOrderByCartFingerprint,

    findActiveOrderByOrderFingerprint,

    hasActiveOrderForCart,

    savePendingOrder,

    getPendingOrder,

    clearPendingOrder,

    getPendingOrderStatus,

    hasActiveOrder,

    isSubmittedOrder,

    isAwaitingVerification,

    getSubmittedOrders,

    saveSubmittedOrder,

    getSubmittedOrder,

    clearSubmittedOrders

};

})();