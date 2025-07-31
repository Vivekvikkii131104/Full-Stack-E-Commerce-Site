document.addEventListener('DOMContentLoaded', () => {
    const cartItemCountSpan = document.getElementById('cartItemCount');
    const orderIdDisplay = document.getElementById('orderIdDisplay');

    // --- Helper Functions ---

    // Function to update cart item count in header (should be 0 now)
    function updateCartItemCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartItemCountSpan.textContent = totalItems;
    }

    // Function to get order ID from URL
    function getOrderIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('orderId');
    }

    // Initial Load
    updateCartItemCount(); // The count should be 0
    const orderId = getOrderIdFromUrl();
    if (orderId) {
        orderIdDisplay.textContent = orderId;
    }
});