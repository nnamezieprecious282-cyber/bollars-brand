/*======================================================
                BOLLARS PRODUCT STORE
                SHARED PRODUCT DATA LAYER
======================================================*/

const ProductStore = (() => {

    const PRODUCTS_KEY =
        "bollars_admin_products";

    const DELETED_KEY =
        "bollars_admin_deleted_products";


    /*==================================================
                    READ PRODUCTS
    ==================================================*/

    function getStoredProducts() {

        try {

            const stored =
                localStorage.getItem(
                    PRODUCTS_KEY
                );

            if (!stored) {

                return [];

            }

            const parsed =
                JSON.parse(stored);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Bollars ProductStore: Failed to read stored products.",
                error
            );

            return [];

        }

    }


    /*==================================================
                    SAVE PRODUCTS
    ==================================================*/

    function saveStoredProducts(productList) {

        try {

            localStorage.setItem(
                PRODUCTS_KEY,
                JSON.stringify(productList)
            );

            return true;

        } catch (error) {

            console.error(
                "Bollars ProductStore: Failed to save products.",
                error
            );

            return false;

        }

    }


    /*==================================================
                    READ DELETED IDS
    ==================================================*/

    function getDeletedProductIds() {

        try {

            const stored =
                localStorage.getItem(
                    DELETED_KEY
                );

            if (!stored) {

                return [];

            }

            const parsed =
                JSON.parse(stored);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Bollars ProductStore: Failed to read deleted products.",
                error
            );

            return [];

        }

    }


    /*==================================================
                    SAVE DELETED IDS
    ==================================================*/

    function saveDeletedProductIds(
        deletedIds
    ) {

        try {

            localStorage.setItem(
                DELETED_KEY,
                JSON.stringify(deletedIds)
            );

            return true;

        } catch (error) {

            console.error(
                "Bollars ProductStore: Failed to save deleted products.",
                error
            );

            return false;

        }

    }


    /*==================================================
                    GET ALL PRODUCTS
    ==================================================*/

    function getAll() {

        const baseProducts =
            Array.isArray(products)
                ? products
                : [];


        const storedProducts =
            getStoredProducts();


        const deletedIds =
            new Set(
                getDeletedProductIds()
            );


        /*
            Stored products override original
            products with the same ID.
        */

        const storedMap =
            new Map(
                storedProducts.map(
                    product => [
                        product.id,
                        product
                    ]
                )
            );


        /*
            Build the final catalog from the
            original products.js catalog.
        */

        const finalProducts =
            baseProducts
                .filter(
                    product =>
                        !deletedIds.has(
                            product.id
                        )
                )
                .map(
                    product => {

                        const storedProduct =
                            storedMap.get(
                                product.id
                            );

                        /*
                            Preserve the original
                            product order when an
                            admin override exists.
                        */

                        if (storedProduct) {

                            return {
                                ...product,
                                ...storedProduct,
                                order:
                                    storedProduct.order ??
                                    product.order
                            };

                        }

                        return product;

                    }
                );


        /*
            Add products created directly
            from the admin panel.
        */

        const baseIds =
            new Set(
                baseProducts.map(
                    product => product.id
                )
            );


        const additionalProducts =
            storedProducts
                .filter(
                    product =>
                        !baseIds.has(product.id) &&
                        !deletedIds.has(product.id)
                )
                .map(
                    (product, index) => ({

                        ...product,

                        /*
                            Give newly created products
                            a valid order value.
                        */

                        order:
                            product.order ??
                            baseProducts.length + index

                    })
                );


        return [
            ...finalProducts,
            ...additionalProducts
        ];

    }


    /*==================================================
                    GET PRODUCT
    ==================================================*/

    function getById(productId) {

        return getAll().find(
            product =>
                product.id === productId
        ) || null;

    }


    /*==================================================
                    ADD PRODUCT
    ==================================================*/

    function add(product) {

        if (
            !product ||
            !product.id
        ) {

            return false;

        }


        const existing =
            getAll().some(
                item =>
                    item.id === product.id
            );


        if (existing) {

            console.error(
                "Bollars ProductStore: Product ID already exists.",
                product.id
            );

            return false;

        }


        const storedProducts =
            getStoredProducts();


        const deletedIds =
            getDeletedProductIds()
                .filter(
                    id =>
                        id !== product.id
                );


        storedProducts.push(product);


        const productsSaved =
            saveStoredProducts(
                storedProducts
            );


        if (!productsSaved) {

            return false;

        }


        return saveDeletedProductIds(
            deletedIds
        );

    }


    /*==================================================
                    UPDATE PRODUCT
    ==================================================*/

    function update(product) {

        if (
            !product ||
            !product.id
        ) {

            return false;

        }


        const storedProducts =
            getStoredProducts();


        const index =
            storedProducts.findIndex(
                item =>
                    item.id === product.id
            );


        if (index === -1) {

            storedProducts.push(
                product
            );

        } else {

            storedProducts[index] =
                product;

        }


        const deletedIds =
            getDeletedProductIds()
                .filter(
                    id =>
                        id !== product.id
                );


        const productsSaved =
            saveStoredProducts(
                storedProducts
            );


        if (!productsSaved) {

            return false;

        }


        return saveDeletedProductIds(
            deletedIds
        );

    }


    /*==================================================
                    DELETE PRODUCT
    ==================================================*/

    function remove(productId) {

        if (!productId) {

            return false;

        }


        const baseProductExists =
            Array.isArray(products) &&
            products.some(
                product =>
                    product.id === productId
            );


        const storedProducts =
            getStoredProducts();


        const storedProductExists =
            storedProducts.some(
                product =>
                    product.id === productId
            );


        if (
            !baseProductExists &&
            !storedProductExists
        ) {

            return false;

        }


        const filteredProducts =
            storedProducts.filter(
                product =>
                    product.id !== productId
            );


        const productsSaved =
            saveStoredProducts(
                filteredProducts
            );


        if (!productsSaved) {

            return false;

        }


        /*
            Original products are hidden by
            adding their ID to the deleted list.
        */

        if (baseProductExists) {

            const deletedIds =
                getDeletedProductIds();


            if (
                !deletedIds.includes(
                    productId
                )
            ) {

                deletedIds.push(
                    productId
                );

            }


            return saveDeletedProductIds(
                deletedIds
            );

        }


        return true;

    }


    /*==================================================
                    RESET STORAGE
    ==================================================*/

    function clear() {

        localStorage.removeItem(
            PRODUCTS_KEY
        );

        localStorage.removeItem(
            DELETED_KEY
        );

    }


    /*==================================================
                    PUBLIC API
    ==================================================*/

    return {

        getAll,

        getById,

        add,

        update,

        remove,

        clear

    };

})();