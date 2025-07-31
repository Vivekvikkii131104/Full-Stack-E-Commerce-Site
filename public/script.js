document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const noProductsFoundMessage = document.getElementById('noProductsFound');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const cartItemCountSpan = document.getElementById('cartItemCount');

    let allProducts = []; // To store all products fetched from backend
    let filteredProducts = []; // Products currently displayed after filters/search
    let currentSearchTerm = '';
    let currentSortOrder = 'default';

    // --- Helper Functions ---

    // Function to update cart item count in header
    function updateCartItemCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
    }

    // Function to display messages
    function showMessage(element, text, isError = false) {
        element.textContent = text;
        element.classList.remove('hidden');
        if (isError) {
            element.classList.add('error-message');
            element.classList.remove('info-message');
        } else {
            element.classList.add('info-message');
            element.classList.remove('error-message');
        }
    }

    function hideMessage(element) {
        element.classList.add('hidden');
    }

    // --- Core Functionality ---

    // 1. Fetch Products from Backend API
    async function fetchProducts() {
        showMessage(loadingMessage, 'Loading products...');
        hideMessage(errorMessage);
        hideMessage(noProductsFoundMessage);
        productGrid.innerHTML = ''; // Clear grid

        try {
            // Fetch from your Node.js backend API
            const response = await fetch('http://localhost:3000/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            allProducts = await response.json();
            applyFiltersAndSort(); // Apply filters and sort after fetching
        } catch (error) {
            console.error('Error fetching products:', error);
            showMessage(errorMessage, 'Failed to load products. Please ensure the backend server is running.', true);
        } finally {
            hideMessage(loadingMessage);
        }
    }

    // 2. Render Products to the Grid
    function renderProducts(productsToRender) {
        productGrid.innerHTML = ''; // Clear previous products
        if (productsToRender.length === 0) {
            showMessage(noProductsFoundMessage, 'No products found matching your criteria.');
        } else {
            hideMessage(noProductsFoundMessage);
            productsToRender.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="card-content">
                        <a href="/product-detail.html?id=${product.id}" class="card-title-link"><h2>${product.name}</h2></a>
                        <p class="description">${product.description}</p>
                        <div class="card-bottom">
                            <span class="card-price">$${product.price.toFixed(2)}</span>
                            <button class="btn-add-to-cart" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.imageUrl}">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                `;
                productGrid.appendChild(productCard);
            });
        }
    }

    // 3. Apply Filters and Sort
    function applyFiltersAndSort() {
        let tempProducts = [...allProducts]; // Start with a copy of all fetched products

        // Apply Search
        if (currentSearchTerm) {
            const searchTermLower = currentSearchTerm.toLowerCase();
            tempProducts = tempProducts.filter(product =>
                product.name.toLowerCase().includes(searchTermLower) ||
                product.description.toLowerCase().includes(searchTermLower) ||
                product.category.toLowerCase().includes(searchTermLower)
            );
        }

        // Apply Sorting
        switch (currentSortOrder) {
            case 'price-asc':
                tempProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                tempProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                tempProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                tempProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // No specific sort or default order (can be ID based or original array order)
                break;
        }

        filteredProducts = tempProducts;
        renderProducts(filteredProducts);
    }

    // 4. Add to Cart Functionality (using Local Storage)
    productGrid.addEventListener('click', (event) => {
        const addToCartBtn = event.target.closest('.btn-add-to-cart');
        if (addToCartBtn) {
            const productId = addToCartBtn.dataset.productId;
            const productName = addToCartBtn.dataset.productName;
            const productPrice = parseFloat(addToCartBtn.dataset.productPrice);
            const productImage = addToCartBtn.dataset.productImage;

            let cart = JSON.parse(localStorage.getItem('cart') || '[]');

            const existingItemIndex = cart.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                // Item exists, just increment quantity
                cart[existingItemIndex].quantity++;
            } else {
                // New item
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartItemCount();
            alert(`${productName} added to cart!`);
        }
    });

    // --- Event Listeners ---

    // Search Input
    searchInput.addEventListener('input', (event) => {
        currentSearchTerm = event.target.value;
        applyFiltersAndSort();
    });

    // Sort Select
    sortSelect.addEventListener('change', (event) => {
        currentSortOrder = event.target.value;
        applyFiltersAndSort();
    });

    // Clear Filters Button
    clearFiltersBtn.addEventListener('click', () => {
        searchInput.value = '';
        sortSelect.value = 'default';
        currentSearchTerm = '';
        currentSortOrder = 'default';
        applyFiltersAndSort();
    });
    
    // Add to Cart functionality from Hero 'Shop Now' button (smooth scroll)
    const shopNowBtn = document.querySelector('.hero-content .btn-primary');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(shopNowBtn.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - document.querySelector('.main-header').offsetHeight,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Initial Load
    fetchProducts(); // Fetch products when page loads
    updateCartItemCount(); // Update cart count on load
});