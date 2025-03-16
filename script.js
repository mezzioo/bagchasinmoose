// Initialize Stripe
const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');

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

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    updateCartCount();
    showCartNotification();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
}

function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Added to cart!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
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

// Add to cart
const addToCartButtons = document.querySelectorAll('.add-to-cart');
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const product = button.closest('.product-item');
        const productName = product.querySelector('h3').textContent;
        const productPrice = product.querySelector('.price').textContent;
        const productImage = product.querySelector('img').src;
        const productBrand = product.dataset.brand;
        const productType = product.dataset.type;

        if (!selectedColor) {
            alert('Please select a color first!');
            return;
        }

        const cartItem = {
            name: productName,
            price: productPrice,
            image: productImage,
            brand: productBrand,
            type: productType,
            color: selectedColor,
            quantity: 1
        };

        // Check if item already exists in cart
        const existingItem = cart.find(item => 
            item.name === productName && 
            item.color === selectedColor
        );

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push(cartItem);
        }

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = `Added ${productName} (${selectedColor}) to cart!`;
        document.body.appendChild(successMessage);

        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);

        // Reset color selection
        selectedColor = null;
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
