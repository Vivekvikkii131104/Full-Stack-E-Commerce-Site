const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Set up a simple logger for incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- API Endpoints ---
const productsFilePath = path.join(__dirname, 'products.json');
const ordersFilePath = path.join(__dirname, 'orders.json');

// GET all products
app.get('/api/products', (req, res) => {
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products.json:', err);
            return res.status(500).json({ message: 'Error loading products.' });
        }
        res.json(JSON.parse(data));
    });
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products.json:', err);
            return res.status(500).json({ message: 'Error loading product data.' });
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        res.json(product);
    });
});

// POST a new order
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (!newOrder || !newOrder.items || newOrder.items.length === 0 || !newOrder.shippingInfo) {
        return res.status(400).json({ message: 'Order data is incomplete.' });
    }

    fs.readFile(ordersFilePath, 'utf8', (err, data) => {
        let orders = [];
        if (!err) {
            try {
                orders = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing orders.json:', parseErr);
            }
        }

        newOrder.id = `order_${Date.now()}`;
        newOrder.timestamp = new Date().toISOString();
        orders.push(newOrder);

        fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing orders.json:', writeErr);
                return res.status(500).json({ message: 'Failed to place order.' });
            }
            res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder.id });
        });
    });
});

// --- Serve static files as a fallback ---
// This middleware must be LAST, after all specific API routes.
app.use(express.static(path.join(__dirname, 'public')));


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});