document.addEventListener('DOMContentLoaded', () => {
    const productDetailCard = document.getElementById('productDetailCard');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const cartItemCountSpan = document.getElementById('cartItemCount');

    let currentProduct = null;

    // --- Helper Functions ---

    // Function to update cart item count in header
    function updateCartItemCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
    }

    // Function to get product ID from URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // --- Core Functionality ---

    // 1. Fetch single product from Backend API
    async function fetchProduct(productId) {
        loadingMessage.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        productDetailCard.classList.add('hidden');

        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Product not found.');
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            currentProduct = await response.json();
            renderProductDetails(currentProduct);
        } catch (error) {
            console.error('Error fetching product details:', error);
            errorMessage.classList.remove('hidden');
        } finally {
            loadingMessage.classList.add('hidden');
        }
    }

    // 2. Render the product details on the page
    function renderProductDetails(product) {
        productDetailCard.innerHTML = `
            <div class="product-image">
                <img src="${product.imageUrl}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <span class="product-category"><i class="fas fa-tag"></i> ${product.category}</span>
                    <span class="product-rating"><i class="fas fa-star"></i> ${product.rating}</span>
                    <span class="product-stock"><i class="fas fa-box"></i> ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div class="product-actions">
                    <button id="addToCartBtn" class="btn btn-primary btn-add-to-cart" ${product.stock === 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> ${product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <a href="/cart.html" class="btn btn-secondary">View Cart <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `;
        productDetailCard.classList.remove('hidden');
    }

    // 3. Add to Cart Functionality (from detail page)
    productDetailCard.addEventListener('click', (event) => {
        const addToCartBtn = event.target.closest('#addToCartBtn');
        if (addToCartBtn && currentProduct) {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');

            const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity++;
            } else {
                cart.push({
                    id: currentProduct.id,
                    name: currentProduct.name,
                    price: currentProduct.price,
                    image: currentProduct.imageUrl,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartItemCount();
            alert(`${currentProduct.name} added to cart!`);
        }
    });

    // Initial Load
    const productId = getProductIdFromUrl();
    if (productId) {
        fetchProduct(productId);
    } else {
        errorMessage.classList.remove('hidden');
        errorMessage.innerHTML = 'Invalid product ID. <a href="/" class="btn-link">Back to Products</a>';
    }
    updateCartItemCount();
});