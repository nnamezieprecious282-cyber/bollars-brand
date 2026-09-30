/*======================================================
                BOLLARS SHIPPING SYSTEM
                SHIPPING.JS — SHIPPING CONFIGURATION
======================================================*/

const Shipping = (() => {

    /*==================================================
                    STORAGE
    ==================================================*/

    const STORAGE_KEY = "bollars_shipping_config";


    /*==================================================
                DEFAULT SHIPPING CONFIG
    ==================================================*/

    const DEFAULT_CONFIG = {

        mode: "manual",

       manual: {
    defaultFee: 6500,

    /*
        Initial Bollars domestic shipping bands.

        Origin:
        Lagos Mainland

        These are configurable merchant rates,
        not live courier quotes.
    */
    rules: [
        {
            state: "Lagos",
            area: "",
            fee: 3000
        },

        {
            state: "Ogun",
            area: "",
            fee: 4000
        },

        {
            state: "Oyo",
            area: "",
            fee: 4500
        },

        {
            state: "Osun",
            area: "",
            fee: 5000
        },

        {
            state: "Ondo",
            area: "",
            fee: 5500
        },

        {
            state: "Ekiti",
            area: "",
            fee: 5500
        },

        {
            state: "Kwara",
            area: "",
            fee: 5500
        },

        {
            state: "Edo",
            area: "",
            fee: 5500
        },

        {
            state: "Delta",
            area: "",
            fee: 6000
        },

        {
            state: "Rivers",
            area: "",
            fee: 6500
        },

        {
            state: "Akwa Ibom",
            area: "",
            fee: 7000
        },

        {
            state: "Cross River",
            area: "",
            fee: 7000
        },

        {
            state: "Abia",
            area: "",
            fee: 6500
        },

        {
            state: "Anambra",
            area: "",
            fee: 6000
        },

        {
            state: "Enugu",
            area: "",
            fee: 6000
        },

        {
            state: "Ebonyi",
            area: "",
            fee: 6500
        },

        {
            state: "Imo",
            area: "",
            fee: 6500
        },

        {
            state: "Bayelsa",
            area: "",
            fee: 7000
        },

        {
            state: "Benue",
            area: "",
            fee: 7000
        },

        {
            state: "Kogi",
            area: "",
            fee: 6000
        },

        {
            state: "Nasarawa",
            area: "",
            fee: 6500
        },

        {
            state: "Plateau",
            area: "",
            fee: 7000
        },

        {
            state: "Federal Capital Territory",
            area: "",
            fee: 6000
        },

        {
            state: "Niger",
            area: "",
            fee: 6500
        },

        {
            state: "Kaduna",
            area: "",
            fee: 7000
        },

        {
            state: "Kano",
            area: "",
            fee: 7500
        },

        {
            state: "Katsina",
            area: "",
            fee: 7500
        },

        {
            state: "Jigawa",
            area: "",
            fee: 7500
        },

        {
            state: "Bauchi",
            area: "",
            fee: 7500
        },

        {
            state: "Gombe",
            area: "",
            fee: 7500
        },

        {
            state: "Yobe",
            area: "",
            fee: 8000
        },

        {
            state: "Borno",
            area: "",
            fee: 8000
        },

        {
            state: "Adamawa",
            area: "",
            fee: 8000
        },

        {
            state: "Taraba",
            area: "",
            fee: 8000
        },

        {
            state: "Kebbi",
            area: "",
            fee: 8000
        },

        {
            state: "Sokoto",
            area: "",
            fee: 8000
        },

        {
            state: "Zamfara",
            area: "",
            fee: 8000
        }
    ]
},

        api: {

            enabled: false,

            provider: ""

        },

        origin: {

            state: "Lagos",

            area: "Mainland",

            address: ""

       },

    };

    /*==================================================
                LOAD CONFIGURATION
    ==================================================*/

    function loadConfig() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(STORAGE_KEY)
                );

            if (!saved) {
                return structuredClone(DEFAULT_CONFIG);
            }

            return mergeConfig(
                structuredClone(DEFAULT_CONFIG),
                saved
            );

        } catch (error) {

            console.warn(
                "Bollars Shipping: Invalid saved configuration.",
                error
            );

            return structuredClone(DEFAULT_CONFIG);

        }

    }


    /*==================================================
                MERGE CONFIGURATION
    ==================================================*/

    function mergeConfig(defaults, saved) {

        return {

            ...defaults,

            ...saved,

            manual: {

                ...defaults.manual,

                ...(saved.manual || {}),

                rules:
                    Array.isArray(saved.manual?.rules)
                        ? saved.manual.rules
                        : defaults.manual.rules

            },

            api: {

                ...defaults.api,

                ...(saved.api || {})

            },

            origin: {

                ...defaults.origin,

                ...(saved.origin || {})

            },

        };

    }

    /*==================================================
                ACTIVE CONFIGURATION
    ==================================================*/

    let CONFIG = loadConfig();


    /*==================================================
                    SAVE CONFIG
    ==================================================*/

    function saveConfig() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(CONFIG)
        );

    }


    /*==================================================
                    GET CONFIG
    ==================================================*/

    function getConfig() {

        return CONFIG;

    }


    /*==================================================
                GET DEFAULT FEE
    ==================================================*/

    function getDefaultFee() {

        return CONFIG.manual.defaultFee;

    }


    /*==================================================
                GET SHIPPING MODE
    ==================================================*/

    function getMode() {

        return CONFIG.mode;

    }


    /*==================================================
                UPDATE CONFIG
    ==================================================*/

    function updateConfig(updates) {

        if (!updates || typeof updates !== "object") {
            return false;
        }

        CONFIG = mergeConfig(
            structuredClone(DEFAULT_CONFIG),
            {
                ...CONFIG,
                ...updates
            }
        );

        saveConfig();

        return true;

    }


    /*==================================================
                FIND LOCATION RULE
    ==================================================*/

    function findRule(state, area) {

        if (!state) return null;

        const normalizedState =
            state.trim().toLowerCase();

        const normalizedArea =
            area
                ? area.trim().toLowerCase()
                : "";

        /*
            Exact state + area rule.
        */

        const areaRule =
            CONFIG.manual.rules.find(rule =>
                rule.state &&
                rule.area &&
                rule.state.trim().toLowerCase() === normalizedState &&
                rule.area.trim().toLowerCase() === normalizedArea
            );

        if (areaRule) {
            return areaRule;
        }

        /*
            State-only rule.
        */

        const stateRule =
            CONFIG.manual.rules.find(rule =>
                rule.state &&
                !rule.area &&
                rule.state.trim().toLowerCase() === normalizedState
            );

        if (stateRule) {
            return stateRule;
        }

        return null;

    }

/*==================================================
                MANUAL SHIPPING QUOTE
==================================================*/

function getManualQuote(state, area) {

    const rule = findRule(state, area);

    const fee = rule
        ? Number(rule.fee)
        : Number(CONFIG.manual.defaultFee);

    return {

        fee,

        method: "manual",

        provider: null,

        source: rule
            ? "rule"
            : "default"

    };

}

 /*==================================================
                    PUBLIC API
 ==================================================*/

   return {
    getConfig,

    getDefaultFee,

    getMode,

    updateConfig,

    findRule,

    getManualQuote,
    
    saveConfig
};

})();