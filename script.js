// Initialize PayPal
paypal.Buttons({
    createOrder: function(data, actions) {
        return fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                cart: getCartItems()
            })
        }).then(function(res) {
            return res.json();
        }).then(function(orderData) {
            return orderData.id;
        });
    },
    onApprove: function(data, actions) {
        return fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                orderID: data.orderID
            })
        }).then(function(res) {
            return res.json();
        }).then(function(details) {
            showOrderConfirmation(details);
        });
    }
}).render('#paypal-button-container');

// Initialize Klaviyo
window.klaviyoInitialize('YOUR_KLAVIYO_PUBLIC_API_KEY');

// Initialize Afterpay
window.afterpay.init({
    publicKey: 'YOUR_AFTERPAY_PUBLIC_KEY'
});

// Initialize Klarna
window.klarna.init({
    publicKey: 'YOUR_KLARNA_PUBLIC_KEY'
});

// Cart functionality
let cart = [];

// Get cart items from localStorage
function getCartItems() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
}

// Save cart items to localStorage
function saveCartItems() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in the header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Add item to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    saveCartItems();
    showNotification('Item added to cart!');
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartItems();
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCartItems();
    }
}

// Calculate total price
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render cart items
function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total h3');
    
    if (!cartItemsContainer || !cartTotal) return;

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
    `).join('');

    cartTotal.textContent = `Total: $${calculateTotal().toFixed(2)}`;
}

// Initialize cart
function initializeCart() {
    cart = getCartItems();
    updateCartCount();
    renderCart();
}

// Event listeners for add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const product = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            image: button.dataset.image,
            description: button.dataset.description,
            quantity: 1
        };
        addToCart(product);
    });
});

// Initialize cart when page loads
window.addEventListener('load', initializeCart);

// Clear cart functionality
document.querySelector('.clear-cart').addEventListener('click', () => {
    cart = [];
    saveCartItems();
    showNotification('Cart cleared!');
});

// Checkout functionality
document.querySelectorAll('.checkout-btn').forEach(button => {
    button.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }
        
        const total = calculateTotal();
        if (button.classList.contains('paypal')) {
            // Handle PayPal checkout
            showNotification('PayPal checkout coming soon!');
        }
    });
});

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Product filtering
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterProducts(button.dataset.filter);
    });
});

function filterProducts(filter) {
    const products = document.querySelectorAll('.product-item');
    products.forEach(product => {
        if (filter === 'all' || product.classList.contains(filter)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Stock alerts
function updateStockAlert(productElement, quantity) {
    const stockAlert = productElement.querySelector('.stock-alert');
    if (quantity <= 5) {
        stockAlert.textContent = `Only ${quantity} left!`;
        stockAlert.style.display = 'block';
    } else {
        stockAlert.style.display = 'none';
    }
}

// Countdown timer
function startCountdown(productElement, endTime) {
    const timer = productElement.querySelector('.countdown-timer');
    const countdown = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s left`;

        if (distance < 0) {
            clearInterval(countdown);
            timer.textContent = 'Sale ended!';
        }
    }, 1000);
}

// Newsletter popup
function showNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    popup.classList.add('active');
}

function closeNewsletterPopup() {
    const popup = document.getElementById('newsletterPopup');
    popup.classList.remove('active');
}

// Form submissions
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input').value;
    
    try {
        await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });
        showSuccessMessage('Thank you for subscribing!');
        closeNewsletterPopup();
    } catch (error) {
        showErrorMessage('Failed to subscribe. Please try again.');
    }
});

// Success/error messages
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize product filters
    filterProducts('all');
    
    // Initialize stock alerts and countdown timers
    const productElements = document.querySelectorAll('.product-item');
    productElements.forEach((product, index) => {
        const quantity = Math.floor(Math.random() * 10) + 1;
        updateStockAlert(product, quantity);
        
        // Add countdown timer for limited-time offers
        if (Math.random() > 0.5) {
            const endTime = new Date().getTime() + (Math.random() * 24 * 60 * 60 * 1000);
            startCountdown(product, endTime);
        }
    });

    // Add event listeners for add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = {
                id: button.closest('.product-item').dataset.id || Date.now(),
                name: button.closest('.product-item').querySelector('h3').textContent,
                price: parseFloat(button.closest('.product-item').querySelector('.price').textContent.replace('$', '')),
                brand: button.closest('.product-item').dataset.brand,
                type: button.closest('.product-item').dataset.type,
                image: button.closest('.product-item').querySelector('img').src,
                color: selectedColor || 'default'
            };
            addToCart(product);
        });
    });

    // Add event listeners for cart actions
    const cartItems = document.querySelector('.cart-items');
    cartItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const itemId = e.target.dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            updateCartCount();
            renderCart();
            showSuccessMessage('Item removed from cart!');
        }

        if (e.target.classList.contains('quantity-btn')) {
            const itemId = e.target.closest('.cart-item').querySelector('.remove-item').dataset.id;
            const item = cart.find(item => item.id === itemId);
            const action = e.target.dataset.action;

            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease' && item.quantity > 1) {
                item.quantity -= 1;
            }

            updateCartCount();
            renderCart();
            showSuccessMessage('Quantity updated!');
        }
    });

    // Add event listener for clear cart button
    const clearCartBtn = document.querySelector('.clear-cart');
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        updateCartCount();
        renderCart();
        showSuccessMessage('Cart cleared successfully!');
    });

    // Add event listeners for checkout buttons
    const paypalBtn = document.querySelector('.checkout-btn.paypal');

    paypalBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showErrorMessage('Your cart is empty!');
            return;
        }

        // Initialize PayPal checkout
        paypal.Buttons({
            createOrder: function(data, actions) {
                return fetch('/api/paypal/create-order', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        cart: cart
                    })
                }).then(function(res) {
                    return res.json();
                }).then(function(orderData) {
                    return orderData.id;
                });
            },
            onApprove: function(data, actions) {
                return fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderID: data.orderID
                    })
                }).then(function(res) {
                    return res.json();
                }).then(function(details) {
                    showSuccessMessage('Order completed successfully!');
                    clearCart();
                });
            }
        }).render('#paypal-button-container');
    });
});

// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// Add success message styles
const style = document.createElement('style');
style.textContent = `
    .success-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Mobile navigation toggle
const navLinks = document.querySelector('.nav-links');
const hamburger = document.createElement('button');
hamburger.innerHTML = '<i class="fas fa-bars"></i>';
hamburger.classList.add('hamburger');
hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Add hamburger menu to navigation
const nav = document.querySelector('nav');
nav.insertBefore(hamburger, navLinks);

// Product card animations
const productCards = document.querySelectorAll('.product-card');
productCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Scroll to top button
const scrollToTopButton = document.createElement('button');
scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopButton.classList.add('scroll-to-top');
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.body.appendChild(scrollToTopButton);

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

// Recent purchases
function showRecentPurchase() {
    const purchaseAlert = document.querySelector('.purchase-alert');
    const names = ['John D.', 'Sarah M.', 'Mike R.', 'Emily W.'];
    const cities = ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'];
    const products = ['SP5DER Hoodie Red', 'Denim Tears Jacket', 'SP5DER T-Shirt', 'Denim Tears Hat'];

    const randomIndex = Math.floor(Math.random() * 4);
    purchaseAlert.innerHTML = `
        <i class="fas fa-shopping-bag"></i>
        <span>Just Now</span>
        <strong>${names[randomIndex]}</strong>
        <span>bought</span>
        <strong>${products[randomIndex]}</strong>
        <span>from</span>
        <strong>${cities[randomIndex]}</strong>
    `;
}

// Color selection
const colorButtons = document.querySelectorAll('.color-btn');
let selectedColor = null;

colorButtons.forEach(button => {
    button.addEventListener('click', () => {
        const color = button.dataset.color;
        const product = button.closest('.product-item');
        const colorOptions = product.querySelector('.color-options');
        
        // Remove active class from all color buttons
        colorOptions.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected color
        button.classList.add('active');
        selectedColor = color;
    });
});

// Collection buttons
const collectionButtons = document.querySelectorAll('.view-collection');
collectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        filterProducts(category);
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Contact information
const contactInfo = document.getElementById('contact-info');
contactInfo.innerHTML = `
    <p>Address: 456 Elm St, Othertown, USA</p>
    <p>Phone: 555-123-4567</p>
    <p>Email: <a href="mailto:info@example.com">info@example.com</a></p>
`;
