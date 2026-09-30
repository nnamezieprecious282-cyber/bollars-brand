/*======================================================
                BOLLARS PAYMENT SYSTEM
                PAYMENT.JS — PAYMENT FOUNDATION
======================================================*/

const Payment = (() => {


    /*==================================================
                    STORAGE
    ==================================================*/

    const STORAGE_KEY =
        "bollars_payment_config";


    /*==================================================
                    PAYMENT METHODS
    ==================================================*/

    const METHODS = {

        BANK_TRANSFER: "bank_transfer",

        OPAY: "opay"

    };


    /*==================================================
                    PAYMENT STATUS
    ==================================================*/

    const STATUS = {

        PENDING: "pending",

        AWAITING_VERIFICATION:
            "awaiting_verification",

        PROCESSING: "processing",

        PAID: "paid",

        FAILED: "failed",

        CANCELLED: "cancelled"

    };


    /*==================================================
                    DEFAULT CONFIGURATION
    ==================================================*/

    const DEFAULT_CONFIG = {

        bankTransfer: {

            enabled: true,

            bankName: "",

            accountName: "",

            accountNumber: ""

        },

         opay: {

             enabled: true,

             accountName: "",

             accountNumber: ""
        }

    };

    /*==================================================
                    LOAD CONFIGURATION
    ==================================================*/

    function loadConfig() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );


            if (!saved) {

                return structuredClone(
                    DEFAULT_CONFIG
                );

            }


            return mergeConfig(
                structuredClone(
                    DEFAULT_CONFIG
                ),
                saved
            );

        } catch (error) {

            console.warn(
                "Bollars Payment: Invalid saved configuration.",
                error
            );

            return structuredClone(
                DEFAULT_CONFIG
            );

        }

    }


    /*==================================================
                    MERGE CONFIGURATION
    ==================================================*/

    function mergeConfig(
        defaults,
        saved
    ) {

        return {

            ...defaults,

            ...saved,

            bankTransfer: {

                ...defaults.bankTransfer,

                ...(saved.bankTransfer || {})

            },

            opay: {

                ...defaults.opay,

                ...(saved.opay || {})

            }

        };

    }


    /*==================================================
                    ACTIVE CONFIGURATION
    ==================================================*/

    let CONFIG =
        loadConfig();


    /*==================================================
                    SAVE CONFIGURATION
    ==================================================*/

    function saveConfig() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(CONFIG)
            );

            return true;

        } catch (error) {

            console.warn(
                "Bollars Payment: Unable to save configuration.",
                error
            );

            return false;

        }

    }


    /*==================================================
                    GET CONFIGURATION
    ==================================================*/

    function getConfig() {

        return CONFIG;

    }


    /*==================================================
                    UPDATE CONFIGURATION
    ==================================================*/

    function updateConfig(
        updates
    ) {

        if (
            !updates ||
            typeof updates !== "object"
        ) {

            return false;

        }


        CONFIG =
            mergeConfig(
                structuredClone(
                    DEFAULT_CONFIG
                ),
                {
                    ...CONFIG,
                    ...updates
                }
            );


        return saveConfig();

    }


    /*==================================================
                    GET PENDING ORDER
    ==================================================*/

    function getPendingOrder() {

        if (
            typeof OrderStore === "undefined"
        ) {

            console.warn(
                "Bollars Payment: OrderStore unavailable."
            );

            return null;

        }

        return OrderStore.getPendingOrder();

    }


    /*==================================================
                    VALIDATE PAYMENT DATA
    ==================================================*/

    function validatePaymentData(
        order
    ) {

        if (!order) {

            return {

                valid: false,

                message:
                    "No pending order was found."

            };

        }


        if (!order.orderId) {

            return {

                valid: false,

                message:
                    "Order ID is missing."

            };

        }


        if (
            !order.customer ||
            !order.customer.email
        ) {

            return {

                valid: false,

                message:
                    "Customer email is missing."

            };

        }


        if (
            !order.pricing ||
            !Number.isFinite(
                order.pricing.total
            ) ||
            order.pricing.total <= 0
        ) {

            return {

                valid: false,

                message:
                    "Invalid payment amount."

            };

        }


        return {

            valid: true,

            message: null

        };

    }


    /*==================================================
                    VALIDATE PAYMENT METHOD
    ==================================================*/

    function isValidMethod(
        method
    ) {

        return Object.values(
            METHODS
        ).includes(method);

    }


    /*==================================================
                    PREPARE PAYMENT
    ==================================================*/

    function preparePayment(
        order,
        method
    ) {

        const validation =
            validatePaymentData(
                order
            );


        if (!validation.valid) {

            return validation;

        }


        if (
            !isValidMethod(
                method
            )
        ) {

            return {

                valid: false,

                message:
                    "Invalid payment method."

            };

        }


        return {

            valid: true,

            payment: {

                orderId:
                    order.orderId,

                method,

                email:
                    order.customer.email,

                amount:
                    order.pricing.total,

                currency:
                    "NGN",

                status:
                    STATUS.PENDING

            }

        };

    }


    /*==================================================
                    PUBLIC API
    ==================================================*/

    return {

        METHODS,

        STATUS,

        getConfig,

        updateConfig,

        saveConfig,

        getPendingOrder,

        validatePaymentData,

        isValidMethod,

        preparePayment

    };

})();