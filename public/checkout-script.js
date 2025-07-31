document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutErrorMessage = document.getElementById('checkoutErrorMessage');
    const cartItemCountSpan = document.getElementById('cartItemCount');

    const checkoutSteps = document.querySelectorAll('.checkout-steps .step');
    const shippingSection = document.querySelector('.shipping-section');
    const paymentSection = document.querySelector('.payment-section');
    const orderSummarySection = document.querySelector('.order-summary-section');

    const prevStepBtn = document.getElementById('prevStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    let currentStep = 1;

    // --- Helper Functions ---

    // Function to update cart item count in header
    function updateCartItemCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
    }

    // Function to get cart items from local storage
    function getCartItems() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    function calculateCartTotals() {
        const cart = getCartItems();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
            subtotal,
            total: subtotal // Assuming free shipping
        };
    }

    // Function to show an error message for a specific form group
    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.add('error');
        const errorMessageDiv = formGroup.querySelector('.error-message');
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.classList.remove('hidden');
        }
    }

    // Function to clear an error message for a specific form group
    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.remove('error');
        const errorMessageDiv = formGroup.querySelector('.error-message');
        if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
            errorMessageDiv.classList.add('hidden');
        }
    }

    // Function to validate the shipping form
    function validateShipping() {
        let isValid = true;
        clearError(document.getElementById('fullName'));
        clearError(document.getElementById('address'));
        clearError(document.getElementById('city'));
        clearError(document.getElementById('zipCode'));
        clearError(document.getElementById('email'));

        if (document.getElementById('fullName').value.trim() === '') {
            showError(document.getElementById('fullName'), 'Full name is required.');
            isValid = false;
        }
        if (document.getElementById('address').value.trim() === '') {
            showError(document.getElementById('address'), 'Address is required.');
            isValid = false;
        }
        if (document.getElementById('city').value.trim() === '') {
            showError(document.getElementById('city'), 'City is required.');
            isValid = false;
        }
        if (document.getElementById('zipCode').value.trim() === '') {
            showError(document.getElementById('zipCode'), 'Zip code is required.');
            isValid = false;
        }
        const emailInput = document.getElementById('email');
        if (emailInput.value.trim() === '' || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
            showError(emailInput, 'A valid email is required.');
            isValid = false;
        }

        return isValid;
    }

    // Function to validate the payment form
    function validatePayment() {
        let isValid = true;
        clearError(document.getElementById('cardNumber'));
        clearError(document.getElementById('cardName'));
        clearError(document.getElementById('expDate'));
        clearError(document.getElementById('cvv'));

        // Basic validation for demonstration purposes
        if (document.getElementById('cardNumber').value.trim().length < 19) { // 16 digits + 3 spaces
            showError(document.getElementById('cardNumber'), 'Please enter a valid card number.');
            isValid = false;
        }
        if (document.getElementById('cardName').value.trim() === '') {
            showError(document.getElementById('cardName'), 'Name on card is required.');
            isValid = false;
        }
        if (!/^\d{2}\/\d{2}$/.test(document.getElementById('expDate').value)) {
            showError(document.getElementById('expDate'), 'Invalid expiry date format (MM/YY).');
            isValid = false;
        }
        if (document.getElementById('cvv').value.trim().length < 3) {
            showError(document.getElementById('cvv'), 'CVV is required.');
            isValid = false;
        }

        return isValid;
    }

    // Function to render the order review
    function renderOrderReview() {
        const cart = getCartItems();
        const reviewItemsContainer = document.getElementById('reviewItems');
        reviewItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            reviewItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="review-item-details">
                    <span>${item.name}</span>
                    <span>Quantity: ${item.quantity}</span>
                </div>
                <span class="review-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            reviewItemsContainer.appendChild(reviewItem);
        });

        const totals = calculateCartTotals();
        document.getElementById('reviewSubtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
        document.getElementById('reviewTotal').textContent = `$${totals.total.toFixed(2)}`;
    }

    // Function to navigate between steps
    function goToStep(step) {
        currentStep = step;
        checkoutSteps.forEach((s, index) => s.classList.remove('active'));
        checkoutSteps[currentStep - 1].classList.add('active');

        shippingSection.classList.add('hidden');
        paymentSection.classList.add('hidden');
        orderSummarySection.classList.add('hidden');
        prevStepBtn.classList.add('hidden');
        nextStepBtn.classList.add('hidden');
        placeOrderBtn.classList.add('hidden');

        switch (currentStep) {
            case 1:
                shippingSection.classList.remove('hidden');
                nextStepBtn.classList.remove('hidden');
                break;
            case 2:
                paymentSection.classList.remove('hidden');
                prevStepBtn.classList.remove('hidden');
                nextStepBtn.classList.remove('hidden');
                break;
            case 3:
                orderSummarySection.classList.remove('hidden');
                prevStepBtn.classList.remove('hidden');
                placeOrderBtn.classList.remove('hidden');
                renderOrderReview();
                break;
        }
    }

    // --- Event Listeners ---

    // Next button click handler
    nextStepBtn.addEventListener('click', () => {
        if (currentStep === 1 && validateShipping()) {
            goToStep(2);
        } else if (currentStep === 2 && validatePayment()) {
            goToStep(3);
        }
    });

    // Previous button click handler
    prevStepBtn.addEventListener('click', () => {
        if (currentStep === 2) {
            goToStep(1);
        } else if (currentStep === 3) {
            goToStep(2);
        }
    });

    // Final form submission (Place Order) handler
    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // This is where we send data to the backend
        const cart = getCartItems();
        if (cart.length === 0) {
            checkoutErrorMessage.textContent = 'Your cart is empty. Please add items before checking out.';
            checkoutErrorMessage.classList.remove('hidden');
            return;
        }
        
        const shippingInfo = {
            fullName: document.getElementById('fullName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
        };

        const orderData = {
            shippingInfo,
            items: cart,
            totals: calculateCartTotals()
        };

        try {
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const result = await response.json();
            if (response.ok) {
                // Order successful!
                localStorage.removeItem('cart'); // Clear cart
                window.location.href = `/order-confirmation.html?orderId=${result.orderId}`;
            } else {
                checkoutErrorMessage.textContent = result.message || 'Failed to place order. Please try again.';
                checkoutErrorMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            checkoutErrorMessage.textContent = 'An error occurred. Please check your network and try again.';
            checkoutErrorMessage.classList.remove('hidden');
        }
    });


    // Initial Load check
    const cart = getCartItems();
    if (cart.length === 0) {
        window.location.href = '/cart.html'; // Redirect to cart if it's empty
    } else {
        goToStep(1);
    }
    updateCartItemCount();
});