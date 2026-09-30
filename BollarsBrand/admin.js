
/*======================================================
                    BOLLARS ADMIN PANEL
                    ADMIN.JS — FOUNDATION + PRODUCTS
======================================================*/

document.addEventListener("DOMContentLoaded", () => {

    Admin.init();

});

/*======================================================
                    ADMIN CONTROLLER
======================================================*/

const Admin = (() => {

    let editingProductId = null;

    let deletingProductId = null;

/*==================================================
                    INITIALIZE
==================================================*/

function init() {

    initSidebar();

    initNavigation();

    initSectionLinks();

    initTheme();

    initLogout();

    initDashboard();

    initProducts();

    initProductModal();

    initDeleteProductModal();

    initProductImage();

    restoreActiveSection();

}


/*==================================================
                    SIDEBAR
==================================================*/

function initSidebar() {

    const sidebar =
        document.getElementById("adminSidebar");

    const toggle =
        document.getElementById("sidebarToggle");

    if (!sidebar || !toggle) return;


    toggle.addEventListener("click", () => {

        sidebar.classList.toggle("active");

    });


    /*
        Close sidebar when clicking outside
        on mobile.
    */

    document.addEventListener("click", event => {

        if (window.innerWidth > 768) return;

        if (!sidebar.classList.contains("active")) return;


        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedToggle =
            toggle.contains(event.target);


        if (!clickedInsideSidebar && !clickedToggle) {

            sidebar.classList.remove("active");

        }

    });

}


/*==================================================
                SECTION NAVIGATION
==================================================*/

function initNavigation() {

    const navItems =
        document.querySelectorAll(
            ".admin-nav-item[data-section]"
        );


    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const section =
                item.dataset.section;


            if (!section) return;


            showSection(section);

        });

    });

}


/*==================================================
            DASHBOARD INTERNAL LINKS
==================================================*/

function initSectionLinks() {

    const links =
        document.querySelectorAll(
            "[data-section-link]"
        );


    links.forEach(link => {

        link.addEventListener("click", () => {

            const section =
                link.dataset.sectionLink;


            if (!section) return;


            showSection(section);

        });

    });

}


/*==================================================
                SHOW SECTION
==================================================*/

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    const navItems =
        document.querySelectorAll(
            ".admin-nav-item[data-section]"
        );


    let targetFound = false;


    sections.forEach(section => {

        const sectionNameFromId =
            section.id.replace("Section", "");


        const isActive =
            sectionNameFromId === sectionName;


        section.classList.toggle(
            "active",
            isActive
        );


        if (isActive) {

            targetFound = true;

        }

    });


    if (!targetFound) return;


    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionName
        );

    });

    updatePageTitle(sectionName);
    localStorage.setItem(
    "bollars_admin_active_section",
    sectionName
);


    /*
        Close mobile sidebar after navigation.
    */

    const sidebar =
        document.getElementById("adminSidebar");


    if (sidebar && window.innerWidth <= 768) {

        sidebar.classList.remove("active");

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/*==================================================
                PAGE TITLE
==================================================*/

function updatePageTitle(sectionName) {

    const pageTitle =
        document.getElementById("pageTitle");


    if (!pageTitle) return;


    const titles = {

        dashboard: "Dashboard",

        products: "Products",

        orders: "Orders",

        customers: "Customers",

        settings: "Settings"

    };


    pageTitle.textContent =
        titles[sectionName] || "Dashboard";

}


/*==================================================
                DARK THEME
==================================================*/

function initTheme() {

    const themeButton =
        document.getElementById("adminThemeToggle");


    const savedTheme =
        localStorage.getItem("theme");


    if (savedTheme === "dark") {

        document.body.setAttribute(
            "data-theme",
            "dark"
        );


        updateThemeIcon(true);

    }


    if (!themeButton) return;


    themeButton.addEventListener("click", () => {

        const isDark =
            document.body.getAttribute("data-theme")
            === "dark";


        if (isDark) {

            document.body.removeAttribute(
                "data-theme"
            );


            localStorage.setItem(
                "theme",
                "light"
            );


            updateThemeIcon(false);

        } else {

            document.body.setAttribute(
                "data-theme",
                "dark"
            );


            localStorage.setItem(
                "theme",
                "dark"
            );


            updateThemeIcon(true);

        }

    });

}


function updateThemeIcon(isDark) {

    const themeButton =
        document.getElementById(
            "adminThemeToggle"
        );


    if (!themeButton) return;


    const icon =
        themeButton.querySelector("i");


    if (!icon) return;


    icon.classList.toggle(
        "ri-moon-line",
        !isDark
    );


    icon.classList.toggle(
        "ri-sun-line",
        isDark
    );

}


/*==================================================
                LOGOUT
==================================================*/

function initLogout() {

    const logoutButton =
        document.getElementById("adminLogoutBtn");


    if (!logoutButton) return;


    logoutButton.addEventListener("click", () => {

        localStorage.removeItem(
            "bollars_admin_verified"
        );


        window.location.href =
            "index.html";

    });

}

/*==================================================
                DASHBOARD
==================================================*/

function initDashboard() {

    updateProductCount();

}

/*==================================================
                PRODUCTS
==================================================*/

function initProducts() {

    const productList =
        document.getElementById(
            "adminProductsList"
        );


    const searchInput =
        document.getElementById(
            "adminProductSearch"
        );


    const categoryFilter =
        document.getElementById(
            "adminCategoryFilter"
        );


    if (!productList) return;


    /*
        Render all products when admin loads.
    */

   renderProducts(ProductStore.getAll());


    /*
        Product search.
    */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            handleProductFilters
        );

    }


    /*
        Category filter.
    */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            handleProductFilters
        );

    }

}

/*==================================================
                PRODUCT COUNT
==================================================*/

function updateProductCount() {

    const totalProducts =
        document.getElementById(
            "totalProducts"
        );


    if (!totalProducts) return;


    const allProducts =
        ProductStore.getAll();


    totalProducts.textContent =
        allProducts.length;

}

/*==================================================
                PRODUCT FILTERS
==================================================*/

function handleProductFilters() {

    const searchInput =
        document.getElementById(
            "adminProductSearch"
        );


    const categoryFilter =
        document.getElementById(
            "adminCategoryFilter"
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedCategory =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const allProducts =
        ProductStore.getAll();


    const filteredProducts =
        allProducts.filter(product => {

            const productName =
                String(product.name || "")
                    .toLowerCase();


            const productCategory =
                String(product.category || "")
                    .toLowerCase();


            const matchesSearch =
                productName.includes(
                    searchTerm
                );


            const matchesCategory =
                selectedCategory === "all"
                ||
                productCategory ===
                    selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    renderProducts(
        filteredProducts
    );

}

/*==================================================
                PRODUCT FORM SUBMIT
==================================================*/

async function handleProductSubmit(event) {

    event.preventDefault();


    const form =
        event.target;


    const formData =
        new FormData(form);


    const name =
        String(
            formData.get("name") || ""
        ).trim();


    const category =
        String(
            formData.get("category") || ""
        );


    const price =
        Number(
            formData.get("price")
        );


    const rating =
        Number(
            formData.get("rating")
        );


    const badge =
        String(
            formData.get("badge") || ""
        );


    const imageFile =
        formData.get("image");


    /*==============================================
                VALIDATION
    ==============================================*/

    if (!name) {

        alert(
            "Please enter a product name."
        );

        return;

    }


    if (!category) {

        alert(
            "Please select a category."
        );

        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;

    }


    if (
        !Number.isFinite(rating) ||
        rating < 1 ||
        rating > 5
    ) {

        alert(
            "Please select a valid rating."
        );

        return;

    }

/*==============================================
            PRODUCT ID
==============================================*/

const isEditing =
    Boolean(
        editingProductId
    );


const productId =
    isEditing
        ? editingProductId
        : generateProductId(category);


/*==============================================
                EXISTING PRODUCT
==============================================*/

const existingProduct =
    isEditing
        ? ProductStore.getById(
            editingProductId
        )
        : null;


/*==============================================
                IMAGE DATA
==============================================*/

let image =
    existingProduct?.image || "";


if (
    imageFile &&
    imageFile instanceof File &&
    imageFile.size > 0
) {

    try {

        image =
            await readImageAsDataURL(
                imageFile
            );

    } catch (error) {

        console.error(
            "Bollars Admin: Failed to process product image.",
            error
        );


        alert(
            "The product image could not be processed. Please try again."
        );


        return;

    }

}


/*==============================================
                PRODUCT DATA
==============================================*/

const productData = {

    id: productId,

    name,

    category,

    price,

    rating,

    ...(badge ? { badge } : {}),

    image

};


/*==============================================
                SAVE PRODUCT
==============================================*/

const saved =
    isEditing
        ? ProductStore.update(
            productData
        )
        : ProductStore.add(
            productData
        );


if (!saved) {

    alert(
        isEditing
            ? "The product could not be updated. Please try again."
            : "The product could not be saved. Please try again."
    );


    return;

}


/*==============================================
                REFRESH ADMIN UI
==============================================*/

updateProductCount();

handleProductFilters();


/*==============================================
                RESET + CLOSE
==============================================*/

resetProductImage();

form.reset();

closeProductModal();

}

/*==================================================
                READ IMAGE AS DATA URL
==================================================*/

function readImageAsDataURL(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();


        reader.onload = event => {

            resolve(
                event.target.result
            );

        };


        reader.onerror = () => {

            reject(
                new Error(
                    "Unable to read image file."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}

/*==================================================
                SET PRODUCT IMAGE PREVIEW
==================================================*/

function setProductImagePreview(image) {

    const imageInput =
        document.getElementById(
            "productImage"
        );


    const placeholder =
        document.getElementById(
            "imageUploadPlaceholder"
        );


    const previewContainer =
        document.getElementById(
            "imagePreviewContainer"
        );


    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (
        !placeholder ||
        !previewContainer ||
        !preview
    ) {

        return;

    }


    /*
        Clear the file input.

        The existing image is represented by
        its URL/data rather than a File object.
    */

    if (imageInput) {

        imageInput.value = "";

    }


    if (!image) {

        preview.src = "";

        previewContainer.hidden = true;

        placeholder.hidden = false;

        return;

    }


    preview.src =
        image;


    placeholder.hidden =
        true;


    previewContainer.hidden =
        false;

}

/*==================================================
                RESET PRODUCT IMAGE
==================================================*/

function resetProductImage() {

    const imageInput =
        document.getElementById(
            "productImage"
        );


    const placeholder =
        document.getElementById(
            "imageUploadPlaceholder"
        );


    const previewContainer =
        document.getElementById(
            "imagePreviewContainer"
        );


    const preview =
        document.getElementById(
            "productImagePreview"
        );


    if (imageInput) {

        imageInput.value = "";

    }


    if (preview) {

        preview.src = "";

    }


    if (previewContainer) {

        previewContainer.hidden = true;

    }


    if (placeholder) {

        placeholder.hidden = false;

    }

}

/*==================================================
                RENDER PRODUCTS
==================================================*/

function renderProducts(productArray) {

    const productList =
        document.getElementById(
            "adminProductsList"
        );


    const emptyState =
        document.getElementById(
            "adminProductsEmpty"
        );


    if (!productList || !emptyState) return;


    productList.innerHTML = "";


    /*
        No products found.
    */

    if (!productArray.length) {

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    /*
        Render product rows.
    */

    productArray.forEach(product => {

        const row =
            document.createElement("article");


        row.className =
            "admin-product-row";


        row.dataset.productId =
            product.id;


        row.innerHTML = `

            <div class="admin-product-image">

                ${
                    product.image
                    ?
                    `<img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy">`
                    :
                    `<i class="ri-image-line"></i>`
                }

            </div>


            <div class="admin-product-info">

                <strong class="admin-product-name">
                    ${product.name}
                </strong>

                <span class="admin-product-category">
                    ${product.category}
                </span>

            </div>

      <div class="admin-product-price">

          ${formatPrice(product.price)}

      </div>

            <span class="admin-product-stock">

                In Stock

            </span>


            <div class="admin-product-actions">

                <button
                    type="button"
                    class="admin-product-action edit"
                    data-product-action="edit"
                    data-product-id="${product.id}"
                    aria-label="Edit ${product.name}">

                    <i class="ri-edit-line"></i>

                </button>


                <button
                    type="button"
                    class="admin-product-action delete"
                    data-product-action="delete"
                    data-product-id="${product.id}"
                    aria-label="Delete ${product.name}">

                    <i class="ri-delete-bin-line"></i>

                </button>

            </div>

        `;


        productList.appendChild(row);

    });


    initProductActions();

}


/*==================================================
                PRODUCT ACTIONS
==================================================*/

function initProductActions() {

    const productList =
        document.getElementById(
            "adminProductsList"
        );


    if (!productList) return;


    /*
        Event delegation allows the list to
        be re-rendered without creating
        duplicate listeners.
    */

    productList.onclick = event => {

        const actionButton =
            event.target.closest(
                "[data-product-action]"
            );


        if (!actionButton) return;


        const action =
            actionButton.dataset.productAction;


        const productId =
            actionButton.dataset.productId;


        if (!productId) return;


        if (action === "edit") {

            handleEditProduct(productId);

        }


        if (action === "delete") {

            handleDeleteProduct(productId);

        }

    };

}

/*==================================================
                EDIT PRODUCT
==================================================*/

function handleEditProduct(productId) {

    const product =
        ProductStore.getById(
            productId
        );


    if (!product) {

        console.error(
            "Bollars Admin: Product not found.",
            productId
        );

        return;

    }


    editingProductId =
        product.id;


    /*==============================================
                GET FORM ELEMENTS
    ==============================================*/

    const modalTitle =
        document.getElementById(
            "productModalTitle"
        );


    const nameInput =
        document.getElementById(
            "productName"
        );


    const categoryInput =
        document.getElementById(
            "productCategory"
        );


    const priceInput =
        document.getElementById(
            "productPrice"
        );


    const ratingInput =
        document.getElementById(
            "productRating"
        );


    const badgeInput =
        document.getElementById(
            "productBadge"
        );


    if (
        !modalTitle ||
        !nameInput ||
        !categoryInput ||
        !priceInput ||
        !ratingInput ||
        !badgeInput
    ) {

        console.error(
            "Bollars Admin: Product edit form is incomplete."
        );

        return;

    }


    /*==============================================
                POPULATE FORM
    ==============================================*/

    modalTitle.textContent =
        "Edit Product";


    nameInput.value =
        product.name || "";


    categoryInput.value =
        product.category || "";


    priceInput.value =
        product.price ?? "";


    ratingInput.value =
        product.rating ?? 5;


    badgeInput.value =
        product.badge || "";


    /*==============================================
                LOAD EXISTING IMAGE
    ==============================================*/

    setProductImagePreview(
        product.image || ""
    );


    /*==============================================
                OPEN MODAL
    ==============================================*/

    openProductModal(
        true
    );

}

/*==================================================
                DELETE PRODUCT
==================================================*/

function handleDeleteProduct(productId) {

    const product =
        ProductStore.getById(
            productId
        );


    if (!product) {

        console.error(
            "Bollars Admin: Product not found.",
            productId
        );

        return;

    }


    deletingProductId =
        product.id;


    const productName =
        document.getElementById(
            "deleteProductName"
        );


    if (productName) {

        productName.textContent =
            product.name || "this product";

    }


    openDeleteProductModal();

}

/*==================================================
            DELETE PRODUCT MODAL
==================================================*/

function initDeleteProductModal() {

    const modal =
        document.getElementById(
            "deleteProductModal"
        );


    const closeButton =
        document.getElementById(
            "deleteProductModalClose"
        );


    const cancelButton =
        document.getElementById(
            "cancelDeleteProductBtn"
        );


    const confirmButton =
        document.getElementById(
            "confirmDeleteProductBtn"
        );


    const overlay =
        document.getElementById(
            "deleteProductModalOverlay"
        );


    if (!modal) return;


    /*==============================================
                CLOSE MODAL
    ==============================================*/

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDeleteProductModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDeleteProductModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeDeleteProductModal
        );

    }


    /*==============================================
                CONFIRM DELETE
    ==============================================*/

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            confirmDeleteProduct
        );

    }


    /*==============================================
                ESCAPE KEY
    ==============================================*/

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;


            if (
                !modal.classList.contains(
                    "active"
                )
            ) return;


            closeDeleteProductModal();

        }
    );

}


/*==================================================
            OPEN DELETE MODAL
==================================================*/

function openDeleteProductModal() {

    const modal =
        document.getElementById(
            "deleteProductModal"
        );


    if (!modal) return;


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/*==================================================
            CLOSE DELETE MODAL
==================================================*/

function closeDeleteProductModal() {

    const modal =
        document.getElementById(
            "deleteProductModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    deletingProductId = null;

}


/*==================================================
            CONFIRM DELETE
==================================================*/

function confirmDeleteProduct() {

    if (!deletingProductId) {

        return;

    }


    const productId =
        deletingProductId;


    const deleted =
        ProductStore.remove(
            productId
        );


    if (!deleted) {

        console.error(
            "Bollars Admin: Failed to delete product.",
            productId
        );


        alert(
            "The product could not be deleted. Please try again."
        );


        return;

    }


    /*==============================================
                REFRESH ADMIN UI
    ==============================================*/

    updateProductCount();

    handleProductFilters();


    /*==============================================
                CLOSE MODAL
    ==============================================*/

    closeDeleteProductModal();

}

/*==================================================
                PRODUCT MODAL
==================================================*/

function initProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const openButton =
        document.getElementById(
            "addProductBtn"
        );


    const closeButton =
        document.getElementById(
            "productModalClose"
        );


    const cancelButton =
        document.getElementById(
            "cancelProductBtn"
        );


    const overlay =
        document.getElementById(
            "productModalOverlay"
        );


    const form =
        document.getElementById(
            "adminProductForm"
        );


    if (!modal || !openButton) return;


    /*==============================================
                OPEN MODAL
    ==============================================*/

   openButton.addEventListener(
    "click",
    () => openProductModal(false)
);

    /*==============================================
                CLOSE MODAL
    ==============================================*/

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeProductModal
        );

    }


    /*==============================================
                ESCAPE KEY
    ==============================================*/

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;


            if (
                !modal.classList.contains(
                    "active"
                )
            ) return;


            closeProductModal();

        }
    );


    /*==============================================
                FORM SUBMIT
    ==============================================*/

    if (form) {

        form.addEventListener(
            "submit",
            handleProductSubmit
        );

    }

}

/*==================================================
                OPEN PRODUCT MODAL
==================================================*/

function openProductModal(isEditing = false) {

    const modal =
        document.getElementById(
            "productModal"
        );


    const form =
        document.getElementById(
            "adminProductForm"
        );


    const modalTitle =
        document.getElementById(
            "productModalTitle"
        );


    if (!modal) return;


    /*==============================================
                ADD MODE
    ==============================================*/

    if (!isEditing) {

        editingProductId = null;


        if (form) {

            form.reset();

        }


        resetProductImage();


        if (modalTitle) {

            modalTitle.textContent =
                "Add Product";

        }

    }


    /*==============================================
                OPEN MODAL
    ==============================================*/

    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );


    /*==============================================
                FOCUS PRODUCT NAME
    ==============================================*/

    const nameInput =
        document.getElementById(
            "productName"
        );


    if (nameInput) {

        setTimeout(() => {

            nameInput.focus();

        }, 150);

    }

}

/*==================================================
                CLOSE PRODUCT MODAL
==================================================*/

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );


    editingProductId = null;

}

/*==================================================
                GENERATE PRODUCT ID
==================================================*/

function generateProductId(category) {

    const prefix =
        category.replace(/[^a-z0-9]/gi, "");

const allProducts =
    ProductStore.getAll();


const existingIds =
    allProducts
        .map(product => product.id)
        .filter(id =>
            id.startsWith(`${prefix}-`)
        );


    let number =
        existingIds.length + 1;


    let id =
        `${prefix}-${String(number).padStart(2, "0")}`;


    while (
    allProducts.some(product =>
        product.id === id
    )
) {

        number++;

        id =
            `${prefix}-${String(number).padStart(2, "0")}`;

    }


    return id;

}

/*==================================================
PRODUCT IMAGE UPLOAD
==================================================*/

function initProductImage() {
    
const uploadArea =
    document.getElementById(
        "productImageUpload"
    );

const imageInput =
    document.getElementById(
        "productImage"
    );

const placeholder =
    document.getElementById(
        "imageUploadPlaceholder"
    );

const previewContainer =
    document.getElementById(
        "imagePreviewContainer"
    );

const preview =
    document.getElementById(
        "productImagePreview"
    );

const removeButton =
    document.getElementById(
        "removeProductImage"
    );


if (
    !uploadArea ||
    !imageInput ||
    !placeholder ||
    !previewContainer ||
    !preview
) return;


/*==============================================
            OPEN FILE PICKER
==============================================*/

uploadArea.addEventListener("click", event => {

    if (
        event.target.closest(
            "#removeProductImage"
        )
    ) return;

    imageInput.click();

});


/*==============================================
            IMAGE SELECTION
==============================================*/

imageInput.addEventListener(
    "change",
    () => {

        const file =
            imageInput.files[0];

        if (!file) return;


        /*==========================================
                VALIDATE IMAGE TYPE
        ==========================================*/

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select a valid image file."
            );

            imageInput.value = "";

            return;

        }


        /*==========================================
                VALIDATE IMAGE SIZE
        ==========================================*/

        const maxSize =
            5 * 1024 * 1024;

        if (file.size > maxSize) {

            alert(
                "Image must be smaller than 5MB."
            );

            imageInput.value = "";

            return;

        }


        /*==========================================
                CREATE IMAGE PREVIEW
        ==========================================*/

        const reader =
            new FileReader();


        reader.onload = event => {

            preview.src =
                event.target.result;

            placeholder.hidden = true;

            previewContainer.hidden = false;

        };


        reader.readAsDataURL(file);

    }
);


/*==============================================
            REMOVE IMAGE
==============================================*/

if (removeButton) {

    removeButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            resetProductImage();

        }
    );

}

}

 /*==================================================
            RESTORE ACTIVE SECTION
 ==================================================*/

function restoreActiveSection() {

    const savedSection =
        localStorage.getItem(
            "bollars_admin_active_section"
        );


    if (!savedSection) {

        showSection("dashboard");

        return;

    }

    showSection(savedSection);

}

/*==================================================
                PUBLIC API
==================================================*/

return {

    init,

    showSection

};

})();

