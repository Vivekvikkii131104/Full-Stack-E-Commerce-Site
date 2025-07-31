document.addEventListener('DOMContentLoaded', () => {
    const cartItemsSection = document.getElementById('cartItemsSection');
    const cartItemCountSpan = document.getElementById('cartItemCount');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartSubtotalSpan = document.getElementById('cartSubtotal');
    const cartTotalSpan = document.getElementById('cartTotal');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const cartSummarySection = document.querySelector('.cart-summary-section');

    let cart = [];

    // --- Helper Functions ---
    function updateCartItemCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
        // Show/hide summary section based on cart items
        if (totalItems > 0) {
            cartSummarySection.classList.remove('hidden');
        } else {
            cartSummarySection.classList.add('hidden');
        }
    }

    function saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function calculateCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        cartTotalSpan.textContent = `$${subtotal.toFixed(2)}`; // Assuming free shipping
    }

    // --- Core Functionality ---

    // 1. Fetch cart from local storage and render
    function renderCart() {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cartItemsSection.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartSummarySection.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cartSummarySection.classList.remove('hidden');
            cart.forEach(item => {
                const cartItemCard = document.createElement('div');
                cartItemCard.classList.add('cart-item-card');
                cartItemCard.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h2>${item.name}</h2>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="btn-quantity-minus" data-id="${item.id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="btn-quantity-plus" data-id="${item.id}">+</button>
                        <button class="btn-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                cartItemsSection.appendChild(cartItemCard);
            });
            calculateCartTotals();
        }
        updateCartItemCount();
    }

    // 2. Handle cart item quantity changes and removal
    cartItemsSection.addEventListener('click', (event) => {
        const target = event.target;
        const itemId = target.dataset.id;

        if (target.classList.contains('btn-quantity-plus')) {
            const item = cart.find(i => i.id === itemId);
            if (item) {
                item.quantity++;
            }
        } else if (target.classList.contains('btn-quantity-minus')) {
            const item = cart.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity--;
            }
        } else if (target.classList.contains('btn-remove')) {
            cart = cart.filter(i => i.id !== itemId);
        }

        saveCartToLocalStorage();
        renderCart();
    });

    // Initial Load
    renderCart();
});