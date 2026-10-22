// ============================================
// ROUGE VÈRA - COMPLETE JAVASCRIPT
// ============================================

// ============================================
// 1. CONFIGURATION & CONSTANTS
// ============================================
const CONFIG = {
    EXCHANGE_RATE: 1, // Now using PHP directly (1 PHP = 1 PHP)
    CURRENCY_SYMBOL: '₱',
    TAX_RATE: 0.12, // 12%
    SHIPPING_FEE: 100.00, // PHP
    PROMO_CODES: {
        WELCOME10: 0.10,
        WELCOME15: 0.15,
        ROUGE15: 0.15,
        VIP20: 0.20,
        BUNDLE25: 0.25
    }
};

// ============================================
// 2. CURRENCY SYSTEM (PHP DIRECT)
// ============================================
class CurrencySystem {
    static formatPHP(amountPHP) {
        return `${CONFIG.CURRENCY_SYMBOL}${amountPHP.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    static calculateCartTotal(cartItems, promoCode = null) {
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        let discountRate = 0;
        if (promoCode) {
            const normalizedCode = String(promoCode).trim().toUpperCase();
            discountRate = CONFIG.PROMO_CODES[normalizedCode] || 0;
        }

        const discountAmount = subtotal * discountRate;
        const discountedSubtotal = subtotal - discountAmount;
        const tax = discountedSubtotal * CONFIG.TAX_RATE;
        const shipping = cartItems.length ? CONFIG.SHIPPING_FEE : 0;
        const total = discountedSubtotal + tax + shipping;

        return {
            subtotal,
            discountRate,
            discountAmount,
            discountedSubtotal,
            tax,
            shipping,
            total
        };
    }
}

// ============================================
// 3. STORAGE MANAGEMENT
// ============================================
class StorageManager {
    static getCart() {
        return JSON.parse(localStorage.getItem('prestigeBlissCart')) || [];
    }

    static saveCart(cart) {
        localStorage.setItem('prestigeBlissCart', JSON.stringify(cart));
    }

    static getUser() {
        return JSON.parse(localStorage.getItem('prestigeBlissUser')) || null;
    }

    static saveUser(user) {
        localStorage.setItem('prestigeBlissUser', JSON.stringify(user));
    }

    static getOrders() {
        return JSON.parse(localStorage.getItem('prestigeBlissOrders')) || [];
    }

    static saveOrders(orders) {
        localStorage.setItem('prestigeBlissOrders', JSON.stringify(orders));
    }

    static getProductReviews() {
        return JSON.parse(localStorage.getItem('rougeVeraProductReviews') || '[]');
    }

    static saveProductReviews(reviews) {
        localStorage.setItem('rougeVeraProductReviews', JSON.stringify(reviews));
    }

    static getInventory() {
        return JSON.parse(localStorage.getItem('prestigeBlissInventory')) || {};
    }

    static saveInventory(products) {
        const inventory = products.reduce((stockById, product) => {
            stockById[product.id] = product.stock;
            return stockById;
        }, {});
        localStorage.setItem('prestigeBlissInventory', JSON.stringify(inventory));
    }

    static getProductCatalog() {
        return JSON.parse(localStorage.getItem('prestigeBlissProductCatalog')) || null;
    }

    static saveProductCatalog(products) {
        localStorage.setItem('prestigeBlissProductCatalog', JSON.stringify(products));
    }

    static getTheme() {
        return localStorage.getItem('prestigeTheme') || 'dark';
    }

    static saveTheme(theme) {
        localStorage.setItem('prestigeTheme', theme);
    }

    static getWishlist() {
        return JSON.parse(localStorage.getItem('prestigeBlissWishlist') || '[]');
    }

    static saveWishlist(items) {
        localStorage.setItem('prestigeBlissWishlist', JSON.stringify(items));
    }

    static getPromoCode() {
        return localStorage.getItem('prestigeBlissPromoCode') || '';
    }

    static savePromoCode(code) {
        if (code) {
            localStorage.setItem('prestigeBlissPromoCode', code.toUpperCase());
        } else {
            localStorage.removeItem('prestigeBlissPromoCode');
        }
    }
}

// ============================================
// 4. CART MANAGEMENT
// ============================================
class CartManager {
    constructor() {
        this.cart = StorageManager.getCart();
    }

    addItem(product, quantity = 1) {
        // Check if item with same id AND same size already exists
        const existingItem = this.cart.find(item => 
            item.id === product.id && item.selectedSize === product.selectedSize
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.save();
        return this.cart;
    }

    removeItem(productId, selectedSize = null) {
        this.cart = this.cart.filter(item => item.id !== productId || (selectedSize !== null && (item.selectedSize || '') !== selectedSize));
        this.save();
        return this.cart;
    }

    updateQuantity(productId, selectedSize, quantity) {
        const item = this.cart.find(cartItem => cartItem.id === productId && (cartItem.selectedSize || '') === selectedSize);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId, selectedSize);
            } else {
                item.quantity = item.stock !== undefined
                    ? Math.min(quantity, item.stock)
                    : quantity;
                this.save();
            }
        }
        return this.cart;
    }

    clear() {
        this.cart = [];
        this.save();
        return this.cart;
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalAmount() {
        return CurrencySystem.calculateCartTotal(this.cart, StorageManager.getPromoCode());
    }

    save() {
        StorageManager.saveCart(this.cart);
    }
}

// ============================================
// 5. PRODUCT DATA WITH MULTIPLE SIZES (PRICES IN PHP)
// ============================================
const PRODUCTS = [
    {
        id: '1',
        name: 'Nexus Noir',
        category: 'signature',
        description: 'A deep, mysterious blend of oud and leather. Limited edition.',
        badge: '35% OFF',
        featured: true,
        stock: 24,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 350.00,
                originalPrice: 399.00,
                discountPercentage: 12
            }
        ],
        image: '1.jpeg',
        gallery: ['1.jpeg', '5.jpg']
    },
    {
        id: '2',
        name: 'Garden of Roses',
        category: 'limited',
        description: 'Amber, vanilla, and white flowers. Spring collection.',
        badge: '34% OFF',
        featured: true,
        stock: 18,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 395.00,
                originalPrice: 429.00,
                discountPercentage: 8
            }
        ],
        image: 'https://images.unsplash.com/photo-1590736969958-65d5e7c5e867?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '3',
        name: 'Velvet Bloom',
        category: 'seasonal',
        description: 'Jasmine, tuberose, and sandalwood. Winter edition.',
        badge: '34% OFF',
        featured: true,
        stock: 12,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 350.00,
                originalPrice: 389.00,
                discountPercentage: 10
            }
        ],
        image: '4.jpg'
    },
    {
        id: '4',
        name: 'Comming Soon...',
        category: 'signature',
        description: 'Exotic spices and precious woods. Collector item.',
        badge: '35% OFF',
        featured: false,
        stock: 31,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 385.00,
                originalPrice: 425.00,
                discountPercentage: 9
            }
        ],
        image: '1.jpeg'
    },
    {
        id: '5',
        name: 'Comming Soon...',
        category: 'unisex',
        description: 'Musk, amber, and patchouli. Unisex fragrance.',
        badge: '35% OFF',
        featured: false,
        stock: 27,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 360.00,
                originalPrice: 399.00,
                discountPercentage: 10
            }
        ],
        image: '1.jpeg'
    },
    {
        id: '6',
        name: 'Comming Soon...',
        category: 'signature',
        description: 'Citrus, bergamot, and cedarwood. Summer special.',
        badge: '35% OFF',
        featured: true,
        stock: 15,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 370.00,
                originalPrice: 415.00,
                discountPercentage: 11
            }
        ],
        image: '1.jpeg'
    },
    {
        id: '7',
        name: 'Comming Soon...',
        category: 'limited',
        description: 'Saffron, rose, and sandalwood. Arabian nights.',
        badge: '34% OFF',
        featured: false,
        stock: 9,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 350.00,
                originalPrice: 389.00,
                discountPercentage: 10
            }
        ],
        image: '1.jpeg'
    },
    {
        id: '8',
        name: 'Comming Soon...',
        category: 'seasonal',
        description: 'Sea salt, driftwood, and marine notes. Fresh aquatic.',
        badge: '34% OFF',
        featured: true,
        stock: 43,
        sizes: [
            {
                size: '10ml',
                price: 99.00,
                originalPrice: 149.00,
                discountPercentage: 33
            },
            {
                size: '30ml',
                price: 190.00,
                originalPrice: 299.00,
                discountPercentage: 36
            },
            {
                size: '50ml',
                price: 395.00,
                originalPrice: 429.00,
                discountPercentage: 8
            }
        ],
        image: '1.jpeg'
    },
    {
        id: '9',
        name: 'Cedar Royale',
        category: 'signature',
        description: 'Polished cedar, smoky vetiver, and warm amber for a confident finish.',
        badge: 'NEW',
        featured: true,
        stock: 22,
        sizes: [
            { size: '10ml', price: 109.00, originalPrice: 149.00, discountPercentage: 27 },
            { size: '30ml', price: 199.00, originalPrice: 299.00, discountPercentage: 33 },
            { size: '50ml', price: 399.00, originalPrice: 429.00, discountPercentage: 7 }
        ],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '10',
        name: 'Saffron Veil',
        category: 'limited',
        description: 'Rare saffron, raspberry, and soft suede wrapped in a golden trail.',
        badge: 'LIMITED',
        featured: true,
        stock: 14,
        sizes: [
            { size: '10ml', price: 119.00, originalPrice: 159.00, discountPercentage: 25 },
            { size: '30ml', price: 219.00, originalPrice: 319.00, discountPercentage: 31 },
            { size: '50ml', price: 395.00, originalPrice: 439.00, discountPercentage: 10 }
        ],
        image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '11',
        name: 'Citrus Atelier',
        category: 'seasonal',
        description: 'Bright bergamot, mandarin peel, and neroli with a clean mineral base.',
        badge: 'NEW',
        featured: true,
        stock: 28,
        sizes: [
            { size: '10ml', price: 99.00, originalPrice: 139.00, discountPercentage: 29 },
            { size: '30ml', price: 189.00, originalPrice: 279.00, discountPercentage: 32 },
            { size: '50ml', price: 380.00, originalPrice: 420.00, discountPercentage: 10 }
        ],
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '12',
        name: 'Moonlit Musk',
        category: 'unisex',
        description: 'Velvety white musk, iris, and cashmere woods with a quiet sensuality.',
        badge: 'NEW',
        featured: false,
        stock: 19,
        sizes: [
            { size: '10ml', price: 109.00, originalPrice: 149.00, discountPercentage: 27 },
            { size: '30ml', price: 199.00, originalPrice: 299.00, discountPercentage: 33 },
            { size: '50ml', price: 390.00, originalPrice: 429.00, discountPercentage: 9 }
        ],
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '13',
        name: 'Jade Mist',
        category: 'seasonal',
        description: 'Green tea, bamboo leaf, and cool water inspired by a hidden garden.',
        badge: 'FRESH PICK',
        featured: false,
        stock: 25,
        sizes: [
            { size: '10ml', price: 99.00, originalPrice: 139.00, discountPercentage: 29 },
            { size: '30ml', price: 179.00, originalPrice: 269.00, discountPercentage: 33 },
            { size: '50ml', price: 350.00, originalPrice: 399.00, discountPercentage: 12 }
        ],
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '14',
        name: 'Noir Tuberose',
        category: 'signature',
        description: 'Creamy tuberose, black pepper, and incense create a dramatic floral signature.',
        badge: 'BESTSELLER',
        featured: true,
        stock: 11,
        sizes: [
            { size: '10ml', price: 119.00, originalPrice: 169.00, discountPercentage: 30 },
            { size: '30ml', price: 219.00, originalPrice: 329.00, discountPercentage: 33 },
            { size: '50ml', price: 369.00, originalPrice: 429.00, discountPercentage: 14 }
        ],
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '15',
        name: 'Amber Library',
        category: 'limited',
        description: 'Rich amber, plum, and aged sandalwood with the warmth of polished leather.',
        badge: 'COLLECTOR',
        featured: false,
        stock: 8,
        sizes: [
            { size: '10ml', price: 129.00, originalPrice: 179.00, discountPercentage: 28 },
            { size: '30ml', price: 239.00, originalPrice: 339.00, discountPercentage: 29 },
            { size: '50ml', price: 389.00, originalPrice: 449.00, discountPercentage: 13 }
        ],
        image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '16',
        name: 'Azure Reverie',
        category: 'unisex',
        description: 'Sea minerals, juniper, and driftwood for a crisp scent that lingers softly.',
        badge: 'NEW',
        featured: false,
        stock: 32,
        sizes: [
            { size: '10ml', price: 99.00, originalPrice: 139.00, discountPercentage: 29 },
            { size: '30ml', price: 189.00, originalPrice: 279.00, discountPercentage: 32 },
            { size: '50ml', price: 385.00, originalPrice: 429.00, discountPercentage: 10 }
        ],
        image: 'https://images.unsplash.com/photo-1523293188086-bb5f4b4e1f34?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '17',
        name: 'Rose Imperial',
        category: 'limited',
        description: 'Damask rose, lychee, and vanilla absolute in a luminous modern bouquet.',
        badge: 'NEW',
        featured: true,
        stock: 16,
        sizes: [
            { size: '10ml', price: 109.00, originalPrice: 149.00, discountPercentage: 27 },
            { size: '30ml', price: 209.00, originalPrice: 299.00, discountPercentage: 30 },
            { size: '50ml', price: 390.00, originalPrice: 438.00, discountPercentage: 11 }
        ],
        image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    },
    {
        id: '18',
        name: 'Velvet Ember',
        category: 'seasonal',
        description: 'Toasted tonka, cocoa, and cedar glow together like an evening fire.',
        badge: 'SEASONAL',
        featured: false,
        stock: 21,
        sizes: [
            { size: '10ml', price: 109.00, originalPrice: 149.00, discountPercentage: 27 },
            { size: '30ml', price: 199.00, originalPrice: 299.00, discountPercentage: 33 },
            { size: '50ml', price: 395.00, originalPrice: 439.00, discountPercentage: 10 }
        ],
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    }
];

const defaultProductCatalog = PRODUCTS.map(product => ({ ...product }));
const savedInventory = StorageManager.getInventory();
const savedProductCatalog = StorageManager.getProductCatalog();
if (Array.isArray(savedProductCatalog) && savedProductCatalog.length) {
    const savedIds = new Set(savedProductCatalog.map(product => product.id));
    PRODUCTS.splice(0, PRODUCTS.length, ...savedProductCatalog, ...defaultProductCatalog.filter(product => !savedIds.has(product.id)));
}
PRODUCTS.forEach(product => {
    if (Number.isFinite(savedInventory[product.id])) {
        product.stock = savedInventory[product.id];
    }
});

const normalize50mlPricing = () => {
    PRODUCTS.forEach(product => {
        const fiftyMl = product.sizes?.find(size => size.size === '50ml');
        if (!fiftyMl) return;

        const minPrice = 350;
        const maxPrice = 400;

        fiftyMl.price = Math.min(maxPrice, Math.max(minPrice, Number(fiftyMl.price) || minPrice));

        const originalPrice = Number(fiftyMl.originalPrice) || fiftyMl.price + 20;
        fiftyMl.originalPrice = Math.max(fiftyMl.price + 10, originalPrice);

        const discount = Math.round(((fiftyMl.originalPrice - fiftyMl.price) / fiftyMl.originalPrice) * 100);
        fiftyMl.discountPercentage = Math.max(3, Math.min(20, discount));
    });
};

normalize50mlPricing();

class ProductReviewSystem {
    static resolveOrderProductId(item) {
        if (item.productId) return item.productId;
        return PRODUCTS.find(product => product.name.toLowerCase() === String(item.name || '').toLowerCase())?.id || null;
    }

    static getVerifiedReviews(productId) {
        const orders = StorageManager.getOrders();
        return StorageManager.getProductReviews().filter(review => {
            const order = orders.find(item => item.id === review.orderId);
            const orderEmail = String(order?.customer?.email || '').toLowerCase();
            const reviewEmail = String(review.email || '').toLowerCase();
            const itemWasPurchased = (order?.items || []).some(item => this.resolveOrderProductId(item) === productId);
            return order?.status === 'Delivered'
                && orderEmail
                && orderEmail === reviewEmail
                && itemWasPurchased
                && String(review.productId) === String(productId)
                && Number.isInteger(Number(review.rating))
                && Number(review.rating) >= 1
                && Number(review.rating) <= 5;
        });
    }

    static escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    static renderVerifiedReview(review) {
        const date = new Date(review.createdAt);
        const dateLabel = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
        const comment = String(review.comment || '').trim();
        return `
            <article class="quick-view-review">
                <div class="quick-view-review-meta">
                    <span class="verified-rating-stars" aria-label="${Number(review.rating)} out of 5 stars">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</span>
                    <span><i class="fas fa-circle-check" aria-hidden="true"></i> Verified purchase</span>
                    ${dateLabel ? `<time>${dateLabel}</time>` : ''}
                </div>
                ${comment ? `<p>${this.escapeHTML(comment)}</p>` : '<p class="quick-view-review-no-comment">Rating only</p>'}
            </article>`;
    }

    static getSummary(productId) {
        const reviews = this.getVerifiedReviews(productId);
        const average = reviews.length
            ? reviews.reduce((total, review) => total + Number(review.rating), 0) / reviews.length
            : 0;
        const distribution = [1, 2, 3, 4, 5].reduce((counts, rating) => {
            counts[rating] = reviews.filter(review => Number(review.rating) === rating).length;
            return counts;
        }, {});
        return { count: reviews.length, average, distribution };
    }

    static getReviewableOrders(productId) {
        const user = StorageManager.getUser();
        const email = String(user?.email || '').trim().toLowerCase();
        if (!user?.isLoggedIn || !email) return [];
        return this.getDeliveredOrders(productId, email).filter(order =>
            !this.hasReviewed(order.id, productId, email)
        );
    }

    static getDeliveredOrders(productId, email = '') {
        const userEmail = email || String(StorageManager.getUser()?.email || '').trim().toLowerCase();
        if (!userEmail) return [];
        return StorageManager.getOrders().filter(order =>
            order.status === 'Delivered'
            && String(order.customer?.email || '').toLowerCase() === userEmail
            && (order.items || []).some(item => String(this.resolveOrderProductId(item)) === String(productId))
        );
    }

    static hasReviewed(orderId, productId, email) {
        return StorageManager.getProductReviews().some(review =>
            review.orderId === orderId
            && review.productId === productId
            && String(review.email || '').toLowerCase() === String(email || '').toLowerCase()
        );
    }

    static submit(orderId, productId, rating, comment) {
        const user = StorageManager.getUser();
        const email = String(user?.email || '').trim().toLowerCase();
        const order = StorageManager.getOrders().find(item => item.id === orderId);
        const ownsDeliveredProduct = order?.status === 'Delivered'
            && String(order.customer?.email || '').toLowerCase() === email
            && (order.items || []).some(item => this.resolveOrderProductId(item) === productId);

        if (!user?.isLoggedIn || !email || !ownsDeliveredProduct) {
            return { ok: false, message: 'A delivered purchase on this account is required to leave a verified review.' };
        }
        if (this.hasReviewed(orderId, productId, email)) {
            return { ok: false, message: 'A review has already been submitted for this purchase.' };
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return { ok: false, message: 'Choose a rating from 1 to 5 stars.' };
        }

        const reviews = StorageManager.getProductReviews();
        reviews.push({
            id: `RVR-${Date.now()}`,
            orderId,
            productId,
            email,
            rating: numericRating,
            comment: String(comment || '').trim().slice(0, 400),
            createdAt: new Date().toISOString()
        });
        StorageManager.saveProductReviews(reviews);
        return { ok: true, message: 'Your verified-purchase rating has been saved.' };
    }
}

// ============================================
// 6. UI COMPONENTS
// ============================================
class UIComponents {
    static showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.getElementById('toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const iconColor = type === 'success' ? '#FFD700' : '#dc143c';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${icon}" style="color: ${iconColor};"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    static createProductCard(product) {
        const defaultSize = product.sizes[0];
        const wishlist = StorageManager.getWishlist();
        const isWishlisted = wishlist.includes(product.id);
        const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image];
        const rating = ProductReviewSystem.getSummary(product.id);
        const ratingSummary = rating.count
            ? `<span class="verified-rating-stars" aria-label="${rating.average.toFixed(1)} out of 5 stars">${'★'.repeat(Math.round(rating.average))}${'☆'.repeat(5 - Math.round(rating.average))}</span><strong>${rating.average.toFixed(1)}</strong><span>${rating.count} verified review${rating.count === 1 ? '' : 's'}</span><i class="fas fa-circle-check" aria-hidden="true"></i>`
            : '<span class="rating-empty">No verified ratings yet</span>';
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <button type="button" class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-product-id="${product.id}" aria-label="Add to wishlist" title="Add to wishlist" onclick="toggleWishlist('${product.id}'); return false;">
                    <i class="${isWishlisted ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </button>
                <div class="product-img" data-gallery-count="${gallery.length}">
                    <div class="product-gallery-stage">
                        <img class="product-main-image" src="${gallery[0]}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.closest('.product-img').classList.add('image-unavailable');this.remove()">
                    </div>
                    ${gallery.length > 1 ? `<div class="product-gallery-thumbs" role="group" aria-label="${product.name} product photos">
                        ${gallery.map((image, index) => `<button class="product-gallery-thumb ${index === 0 ? 'active' : ''}" type="button" data-gallery-image="${image}" aria-label="Show product photo ${index + 1}" aria-pressed="${index === 0}"><img src="${image}" alt="" loading="lazy"></button>`).join('')}
                    </div>` : ''}
                </div>
                <div class="product-content">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-category">${product.category} Collection</p>
                    <div class="product-rating" aria-label="Verified purchase rating">${ratingSummary}</div>
                    <p class="product-description">${product.description}</p>
                    <p class="product-stock ${product.stock === 0 ? 'out-of-stock' : ''}">
                        ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>
                    
                    <!-- Size Selector -->
                    <div class="size-selector">
                        <div style="color: #FFD700; margin-bottom: 5px; font-size: 0.9rem;">Select Size:</div>
                        <div class="size-options">
                            ${product.sizes.map(size => `
                                <button class="size-btn ${size.size === '10ml' ? 'active' : ''}" 
                                        data-size="${size.size}" 
                                        data-price="${size.price}" 
                                        data-original="${size.originalPrice}"
                                        data-discount="${size.discountPercentage}">
                                    ${size.size}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Price Display -->
                    <div class="product-size-price">
                        <div class="size-price-display">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="selected-size-price">${CurrencySystem.formatPHP(defaultSize.price)}</span>
                                <span class="selected-size-original">${CurrencySystem.formatPHP(defaultSize.originalPrice)}</span>
                                <span class="size-discount">${defaultSize.discountPercentage}% OFF</span>
                            </div>
                            <div class="size-label">for ${defaultSize.size}</div>
                        </div>
                    </div>
                    
                    <!-- Savings Badge -->
                    <div class="savings-badge">
                        Save ${CurrencySystem.formatPHP(defaultSize.originalPrice - defaultSize.price)}
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button onclick="openQuickView('${product.id}')" class="btn btn-outline-gold add-to-cart" type="button" style="flex: 1;">
                            <i class="fas fa-eye"></i> Quick View
                        </button>
                        <button onclick="addToCart('${product.id}')" class="btn btn-gold add-to-cart" ${product.stock === 0 ? 'disabled' : ''} type="button" style="flex: 1;">
                            <i class="fas fa-shopping-bag"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    static createCartItem(item) {
        const itemTotal = item.price * item.quantity;
        
        return `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    ${item.selectedSize ? `<div class="cart-item-size">${item.selectedSize}</div>` : ''}
                    <div class="cart-item-controls">
                        <button onclick="updateCartItem('${item.id}', '${item.selectedSize || ''}', ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItem('${item.id}', '${item.selectedSize || ''}', ${item.quantity + 1})">+</button>
                        <button onclick="removeFromCart('${item.id}', '${item.selectedSize || ''}')" class="remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cart-item-price">
                    <div class="item-total">${CurrencySystem.formatPHP(itemTotal)}</div>
                    <div class="item-price">${CurrencySystem.formatPHP(item.price)} each</div>
                </div>
            </div>
        `;
    }
}

// ============================================
// 7. CUSTOMER SUPPORT
// ============================================
class CustomerSupport {
    static faqs = [
        { question: 'How can I track my order?', answer: 'Sign in and open your Profile, then choose My Orders. You can also contact support with your order number.' },
        { question: 'How long does shipping take?', answer: 'Orders are prepared within 1-2 business days. Delivery timing depends on your location and will be confirmed after checkout.' },
        { question: 'Can I return a fragrance?', answer: 'Please contact us within 14 days of delivery. Items must be unopened and in their original condition.' },
        { question: 'Which fragrance should I choose?', answer: 'Start with our Collections page for curated scents, or ask me about fresh, floral, woody, or unisex fragrances.' },
        { question: 'How do I update my account?', answer: 'Open Profile after signing in and choose Settings, Address Book, or Notifications to update your details.' },
        { question: 'What payment methods do you accept?', answer: 'Checkout currently offers cash on delivery, GCash, Maya, and bank transfer. For prepaid transfers, contact support@rougevera.com for current transfer details, then enter your transaction reference. The order remains pending until staff manually verifies it. Online card payments are not available yet.', keywords: 'pay payment card checkout cash gcash maya bank transfer verification' },
        { question: 'Who created ROUGE VÈRA?', answer: 'It was created by founder Aaron Abalon, whose vision is to make expressive, luxurious fragrance feel personal and unforgettable.', keywords: 'who created it creator founder' },
        { question: 'Who is the perfumer behind ROUGE VÈRA?', answer: 'The perfumer behind ROUGE VÈRA is Aaron Abalon, who composes the house fragrances with modern structure, rare woods, florals, and warm amber.', keywords: 'who was the perfumer perfumer nose' },
        { question: 'When was ROUGE VÈRA created?', answer: 'It was founded in 2026. The house is building a new generation of timeless fragrances and evolving its collections with every release.', keywords: 'when was it created founded established 2026' },
        { question: 'What bottle sizes are available?', answer: 'Most fragrances are available in 10 ml, 30 ml, and 50 ml sizes. Open a product or its Quick View to see the available sizes and current prices.', keywords: 'size sizes bottle volume ml how big' },
        { question: 'How much is shipping?', answer: 'Standard shipping is ₱100.00. Available delivery options and any applicable charges are shown during checkout.', keywords: 'shipping fee delivery cost courier charge' },
        { question: 'How long does delivery usually take?', answer: 'Orders are processed within 1–2 business days. Standard delivery usually takes 3–5 business days depending on your location; timing can vary during busy periods.', keywords: 'delivery days arrive estimate fast express' },
        { question: 'Which promo codes can I use?', answer: 'The cart currently recognizes WELCOME10 (10%), WELCOME15 (15%), ROUGE15 (15%), VIP20 (20%), and BUNDLE25 (25%). Enter a code in your cart and check that the discount appears before checkout; promotions may have additional terms.', keywords: 'promo voucher coupon code discount codes' },
        { question: 'Can I combine promo codes?', answer: 'The store applies one promo code at a time. Try the code that gives you the best eligible discount and review the total in your cart before checkout.', keywords: 'combine stack multiple promo vouchers coupons' },
        { question: 'How do I add a product to my cart?', answer: 'Choose a size on the product card or in Quick View, then select Add to Cart. Open the cart icon to review quantities, promo codes, shipping, and your total.', keywords: 'add cart buy purchase shopping bag' },
        { question: 'How do I change my cart quantity?', answer: 'Open your Cart to review the items and adjust quantities before checkout. If an item is unavailable or reaches its stock limit, the cart will not allow more than the available quantity.', keywords: 'quantity increase decrease remove cart item' },
        { question: 'How do I place an order?', answer: 'Add your chosen fragrances and sizes to the cart, review your items and any promo code, then continue to checkout and complete the requested delivery and payment details.', keywords: 'place order buy checkout purchase steps' },
        { question: 'How are taxes and totals calculated?', answer: 'The cart shows your subtotal, any applied discount, tax, shipping, and final total before checkout. The current checkout calculation uses 12% tax and ₱100 standard shipping for carts with items.', keywords: 'tax vat total fee calculation amount' },
        { question: 'Can I cancel or change an order?', answer: 'Please contact support at contact@rougevera.com as soon as possible with your order number. Changes may not be possible once an order is being processed or shipped.', keywords: 'cancel edit change order mistake' },
        { question: 'My order has not arrived. What should I do?', answer: 'Check Profile → My Orders for the latest status. If the estimated delivery window has passed, email contact@rougevera.com with your order number so the team can help.', keywords: 'late delayed missing lost parcel package' },
        { question: 'What do order statuses mean?', answer: 'Your order status is shown in Profile → My Orders. Pending means it is awaiting or beginning processing; later updates will appear there as the order progresses. A delivered order can be reviewed from your order history.', keywords: 'pending processing shipped delivered status meaning' },
        { question: 'How do I leave a product review?', answer: 'Sign in and open Profile → My Orders. Once an order is marked Delivered, use its review form to rate the product and optionally leave a comment. Quick View displays verified reviews from delivered purchases.', keywords: 'rating stars write review feedback comment verified' },
        { question: 'Why can’t I submit a verified review?', answer: 'Verified reviews are available only for products in a Delivered order linked to your signed-in account. Open Profile → My Orders and check the order status; you can submit one review per product in each delivered order.', keywords: 'review unavailable cannot rate eligible verified purchase' },
        { question: 'How do product ratings work?', answer: 'Product ratings and review counts are based on verified reviews from delivered purchases. Open Quick View to see the average, star breakdown, and recent customer comments.', keywords: 'stars average rating score number reviews' },
        { question: 'How do I save a product to my wishlist?', answer: 'Select the heart icon on a product card to add or remove it from your wishlist. You can view saved products from the Wishlist section in your Profile.', keywords: 'wishlist favorite save heart saved items' },
        { question: 'How can I find a fragrance I will like?', answer: 'Browse the Collections page or use the fragrance notes and descriptions on each product. Tell me whether you prefer fresh, floral, woody, sweet, or warm scents and I can suggest a direction to explore.', keywords: 'choose scent notes family recommend preference' },
        { question: 'What is the difference between the fragrance sizes?', answer: 'The 10 ml size is the most compact option, while 30 ml and 50 ml provide more fragrance. Exact prices vary by product and size; check the product card or Quick View for current details.', keywords: '10ml 30ml 50ml compare difference small large travel' },
        { question: 'How do I create an account or sign in?', answer: 'Use the Login link in the navigation to sign in or register. After signing in, open Profile to manage your account and view your orders.', keywords: 'register registration create account sign up login' },
        { question: 'How do I update my delivery address?', answer: 'Sign in, open Profile, and choose Address Book to manage your saved delivery details. Review the address carefully during checkout before placing an order.', keywords: 'change shipping address edit delivery location' },
        { question: 'How do I contact customer support?', answer: 'Email contact@rougevera.com and include your order number if your question is about a purchase. You can also use the AI Help chat for quick guidance.', keywords: 'contact email phone human agent support team' },
        { question: 'What should I do if an item arrives damaged or incorrect?', answer: 'Contact support at contact@rougevera.com within 14 days of delivery and include your order number and a description of the issue. Keep the item and its packaging while your request is reviewed.', keywords: 'damaged broken wrong incorrect defective exchange refund' },
        { question: 'How should I store my fragrance?', answer: 'Keep fragrance tightly closed in a cool, dry place away from direct sunlight and heat. This helps protect it from avoidable environmental changes.' , keywords: 'store storage keep preserve sunlight heat' }
    ];

    static getOrderContext() {
        const orders = StorageManager.getOrders();
        const user = StorageManager.getUser();
        if (!user?.email) return orders;
        return orders.filter(order => order.customer?.email === user.email);
    }

    static findReply(message) {
        const text = message.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s-]/g, ' ');
        const intents = [
            { words: ['track', 'where', 'status', 'order', 'delivery'], answer: 0 },
            { words: ['ship', 'shipping', 'arrive', 'long', 'delivery'], answer: 1 },
            { words: ['return', 'refund', 'exchange', 'damaged'], answer: 2 },
            { words: ['scent', 'fragrance', 'perfume', 'smell', 'recommend', 'floral', 'woody', 'fresh'], answer: 3 },
            { words: ['account', 'profile', 'address', 'password', 'login', 'settings'], answer: 4 },
            { words: ['pay', 'payment', 'card', 'checkout', 'price'], answer: 5 },
            { words: ['created', 'creator', 'founded', 'founder', 'history'], answer: 6 },
            { words: ['perfumer', 'nose', 'composed', 'crafted'], answer: 7 },
            { words: ['when', 'year', 'established', '2026'], answer: 8 },
            { words: ['size', 'sizes', 'volume', 'milliliter', 'ml'], answer: 9 },
            { words: ['shipping fee', 'shipping cost', 'delivery cost', 'courier charge', 'fee', 'cost'], answer: 10 },
            { words: ['delivery days', 'delivery time', 'shipping time', 'business days', 'how long', 'arrive', 'arrival', 'express', 'days'], answer: 11 },
            { words: ['promo', 'voucher', 'coupon', 'code', 'discount'], answer: 12 },
            { words: ['combine', 'stack', 'multiple', 'codes'], answer: 13 },
            { words: ['add', 'cart', 'buy', 'purchase'], answer: 14 },
            { words: ['quantity', 'remove', 'cart item'], answer: 15 },
            { words: ['place order', 'checkout steps', 'how to order'], answer: 16 },
            { words: ['tax', 'vat', 'total', 'shipping calculation'], answer: 17 },
            { words: ['cancel', 'change order', 'edit order'], answer: 18 },
            { words: ['late', 'delayed', 'missing', 'lost parcel'], answer: 19 },
            { words: ['status meaning', 'pending', 'processing', 'shipped', 'delivered'], answer: 20 },
            { words: ['leave review', 'write review', 'rate product', 'submit review', 'review'], answer: 21 },
            { words: ['cannot review', 'cant review', 'review unavailable', 'review eligible'], answer: 22 },
            { words: ['rating', 'ratings', 'stars', 'average score', 'reviews'], answer: 23 },
            { words: ['wishlist', 'favorite', 'heart', 'saved products'], answer: 24 },
            { words: ['choose fragrance', 'scent notes', 'recommend', 'fresh floral woody sweet'], answer: 25 },
            { words: ['difference sizes', 'compare sizes', '10ml 30ml 50ml'], answer: 26 },
            { words: ['register', 'sign up', 'create account', 'login'], answer: 27 },
            { words: ['address book', 'delivery address', 'shipping address'], answer: 28 },
            { words: ['contact support', 'contact email', 'human agent', 'contact', 'email'], answer: 29 },
            { words: ['damaged', 'incorrect', 'defective', 'wrong item'], answer: 30 },
            { words: ['store fragrance', 'fragrance storage', 'preserve scent'], answer: 31 }
        ];
        const ranked = intents.map(intent => ({
            ...intent,
            score: intent.words.reduce((score, word) => score + (text.includes(word) ? word.length + (word.includes(' ') ? 4 : 0) : 0), 0)
        })).sort((first, second) => second.score - first.score);
        const bestMatch = ranked[0];
        const orders = this.getOrderContext();

        if (/(cancel|change|edit).*(order)|order.*(cancel|change|edit)/.test(text)) return this.faqs[18].answer;
        if (/(how long|when).*(ship|shipping|deliver|delivery)|(ship|shipping|deliver|delivery).*(how long|delivery time)/.test(text)) return this.faqs[11].answer;
        if (/(ship|shipping|deliver|delivery).*(fee|cost|charge|price)|(fee|cost|charge|price).*(ship|shipping|deliver|delivery)|how much.*(ship|shipping|deliver|delivery)/.test(text)) return this.faqs[10].answer;
        if (/(combine|stack|use).*(promo|voucher|coupon|codes?)|multiple.*(codes?|discounts?)/.test(text)) return this.faqs[13].answer;
        if (/(cannot|cant|unable|why not|not able).*(review|rate)|review.*(cannot|cant|unavailable)/.test(text)) return this.faqs[22].answer;
        if (/(leave|write|submit).*(review|rating)|how.*(review|rate)/.test(text)) return this.faqs[21].answer;
        if (/\b(late|delayed|missing|lost)\b.*\b(order|parcel|package)\b|\border\b.*\b(late|delayed|missing|lost)\b/.test(text)) return this.faqs[19].answer;
        if (/(damaged|broken|defective|incorrect|wrong).*(item|product|order)|item.*(damaged|broken|defective|incorrect|wrong)/.test(text)) return this.faqs[30].answer;

        if (/(my|recent|latest|last).*(order|purchase)|order.*(number|#)/.test(text) && orders.length) {
            const latestOrder = orders[0];
            return `Your latest order is ${latestOrder.id}. It is currently ${latestOrder.status.toLowerCase()} and totals ${CurrencySystem.formatPHP(Number(latestOrder.total) || 0)}. ${latestOrder.status === 'Pending' ? 'It is being prepared now.' : 'We will keep you updated as it moves forward.'}`;
        }
        if (/(my|any).*(order|purchase)/.test(text) && !orders.length) {
            return 'I could not find an order for this account yet. Once you complete checkout, your order history will appear in your Profile.';
        }
        if (/(who|which).*(created|creator|founded|founder)|creator|founder/.test(text)) return this.faqs[6].answer;
        if (/(who|which).*(perfumer|nose)|perfumer/.test(text)) return this.faqs[7].answer;
        if (/(when|what year).*(created|founded|established)|2026/.test(text)) return this.faqs[8].answer;
        if (bestMatch.score > 0) return this.faqs[bestMatch.answer].answer;
        if (/^(hi|hello|hey|help|good morning|good afternoon)/.test(text)) {
            const user = StorageManager.getUser();
            return `Hello${user?.name ? `, ${user.name}` : ''}. I am your ROUGE VÈRA AI concierge. I can help with orders, shipping, returns, fragrance choices, checkout, and your account.`;
        }
        return 'I am still learning that request. I can help with orders, shipping, returns, fragrances, checkout, and account settings. You can also email contact@rougevera.com for personal assistance.';
    }

    static initialize() {
        if (document.querySelector('.support-widget')) return;
        document.body.insertAdjacentHTML('beforeend', `
            <div class="support-widget">
                <button class="support-toggle" aria-label="Open AI customer support" aria-expanded="false"><span class="support-toggle-dot"></span><i class="fas fa-headset"></i><span>AI Help</span></button>
                <section class="support-panel" aria-label="Customer support chat" hidden>
                    <header class="support-header"><div class="support-agent"><span class="support-agent-avatar"><i class="fas fa-sparkles"></i></span><span><strong>ROUGE VÈRA AI</strong><small><i class="support-online-dot"></i> Online concierge</small></span></div><div class="support-header-actions"><button class="support-clear" type="button" aria-label="Clear conversation" title="Clear conversation"><i class="fas fa-rotate-left"></i></button><button class="support-close" aria-label="Close support"><i class="fas fa-times"></i></button></div></header>
                    <div class="support-context"><i class="fas fa-shield-heart"></i><span>Private assistance for your fragrance journey</span></div>
                    <div class="support-messages" aria-live="polite"></div>
                    <div class="support-suggestions-label">Popular questions</div>
                    <div class="support-suggestions"><button type="button"><i class="fas fa-box"></i> Latest order</button><button type="button"><i class="fas fa-truck"></i> Shipping time</button><button type="button"><i class="fas fa-wand-magic-sparkles"></i> Find my scent</button><button type="button"><i class="fas fa-tag"></i> Promo codes</button><button type="button"><i class="fas fa-star"></i> Product reviews</button><button type="button"><i class="fas fa-flask"></i> Bottle sizes</button></div>
                    <form class="support-form"><div class="support-input-wrap"><input type="text" maxlength="280" placeholder="Ask your concierge..." aria-label="Ask customer support" required><span class="support-character-count">0/280</span></div><button type="submit" aria-label="Send message"><i class="fas fa-paper-plane"></i></button></form>
                </section>
            </div>
        `);

        const widget = document.querySelector('.support-widget');
        const toggle = widget.querySelector('.support-toggle');
        const panel = widget.querySelector('.support-panel');
        const messages = widget.querySelector('.support-messages');
        const form = widget.querySelector('.support-form');
        const input = form.querySelector('input');
        const isSupportPage = window.location.pathname.toLowerCase().endsWith('/support.html') || window.location.pathname.toLowerCase().endsWith('support.html');
        const characterCount = widget.querySelector('.support-character-count');
        const storageKey = 'rougeVeraSupportMessages';
        const welcomeMessage = 'Hello. I am your AI concierge. Ask me about orders, shipping, promo codes, product sizes, reviews, returns, or fragrance choices.';
        const formatTime = (date = new Date()) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const appendMessage = (text, role, timestamp = formatTime()) => {
            const message = document.createElement('div');
            message.className = `support-message support-${role}`;
            message.innerHTML = '<span class="support-message-text"></span><time></time>';
            message.querySelector('.support-message-text').textContent = text;
            message.querySelector('time').textContent = timestamp;
            messages.appendChild(message);
        };
        const saveMessages = () => {
            const saved = [...messages.querySelectorAll('.support-message')].map(message => ({
                text: message.querySelector('.support-message-text')?.textContent || '',
                role: message.classList.contains('support-user') ? 'user' : 'bot',
                timestamp: message.querySelector('time')?.textContent || formatTime()
            }));
            localStorage.setItem(storageKey, JSON.stringify(saved.slice(-20)));
        };
        const restoreMessages = () => {
            let saved = [];
            try { saved = JSON.parse(localStorage.getItem(storageKey)) || []; } catch (error) { saved = []; }
            if (saved.length) saved.forEach(message => appendMessage(message.text, message.role, message.timestamp));
            else appendMessage(welcomeMessage, 'bot');
        };
        restoreMessages();
        if (isSupportPage) {
            panel.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
            toggle.classList.add('support-toggle-active');
        }
        const sendMessage = (message) => {
            const cleanMessage = message.trim();
            if (!cleanMessage) return;
            appendMessage(cleanMessage, 'user');
            saveMessages();
            const reply = this.findReply(cleanMessage);
            messages.insertAdjacentHTML('beforeend', '<div class="support-message support-bot support-typing"><span class="typing-dots"><i></i><i></i><i></i></span><span>Concierge is thinking</span></div>');
            input.disabled = true;
            form.querySelector('button[type="submit"]').disabled = true;
            messages.scrollTop = messages.scrollHeight;
            setTimeout(() => {
                messages.querySelector('.support-typing')?.remove();
                appendMessage(reply, 'bot');
                saveMessages();
                input.disabled = false;
                form.querySelector('button[type="submit"]').disabled = false;
                messages.scrollTop = messages.scrollHeight;
                input.focus();
            }, 450);
            messages.scrollTop = messages.scrollHeight;
        };
        toggle.addEventListener('click', () => {
            const isOpen = !panel.hidden;
            panel.hidden = isOpen;
            toggle.setAttribute('aria-expanded', String(!isOpen));
            toggle.classList.toggle('support-toggle-active', !isOpen);
            if (!isOpen) input.focus();
        });
        widget.querySelector('.support-close').addEventListener('click', () => {
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
            toggle.classList.remove('support-toggle-active');
        });
        widget.querySelector('.support-clear').addEventListener('click', () => {
            messages.innerHTML = '';
            appendMessage(welcomeMessage, 'bot');
            saveMessages();
            messages.scrollTop = messages.scrollHeight;
        });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            sendMessage(input.value);
            input.value = '';
            characterCount.textContent = '0/280';
        });
        input.addEventListener('input', () => {
            characterCount.textContent = `${input.value.length}/280`;
        });
        widget.querySelectorAll('.support-suggestions button').forEach(button => button.addEventListener('click', () => sendMessage(button.textContent)));
    }
}

// ============================================
// 7. PROFILE CONTROLLER
// ============================================
class ProfileController {
    static checkUserStatus() {
        const user = StorageManager.getUser();
        return user && user.isLoggedIn === true;
    }

    static updateUserStatusUI() {
        const isLoggedIn = this.checkUserStatus();
        const user = isLoggedIn ? StorageManager.getUser() : null;
        
        // Update desktop user status
        const desktopIndicator = document.getElementById('userStatusIndicator');
        if (desktopIndicator) {
            if (isLoggedIn) {
                desktopIndicator.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #FFD700;">${user.name}</span>
                        <button onclick="logout()" class="nav-icon" style="color: #dc143c;">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                `;
            } else {
                desktopIndicator.innerHTML = `
                    <a href="login.html" class="nav-icon">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                `;
            }
        }
        
        // Update mobile user status
        const mobileIndicator = document.getElementById('mobileUserStatus');
        if (mobileIndicator) {
            if (isLoggedIn) {
                mobileIndicator.innerHTML = `
                    <a href="#" class="mobile-nav-link" onclick="logout(); return false;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                `;
            } else {
                mobileIndicator.innerHTML = `
                    <a href="login.html" class="mobile-nav-link">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </a>
                `;
            }
        }
    }

    static loadProfileContent() {
        const isLoggedIn = this.checkUserStatus();
        const user = isLoggedIn ? StorageManager.getUser() : null;
        const profileContent = document.getElementById('profileContent');
        const profileWelcome = document.getElementById('profileWelcome');
        const profileSubtitle = document.getElementById('profileSubtitle');
        
        if (!profileContent) return;
        
        if (isLoggedIn) {
            // Check if new user (based on memberSince date)
            const memberSince = user.memberSince ? new Date(user.memberSince) : new Date();
            const isNewUser = (Date.now() - memberSince.getTime()) < (7 * 24 * 60 * 60 * 1000); // Within 7 days
            const cartItems = StorageManager.getCart();
            const wishlistItems = user.wishlist || [];
            const userOrders = StorageManager.getOrders().filter(order => !user.email || order.customer?.email === user.email);
            const totalSpent = userOrders.reduce((total, order) => total + (Number(order.total) || 0), 0);
            const hasAddress = Boolean(user.address?.line && user.address?.city && user.address?.postal);
            const completedFields = [user.name, user.email, hasAddress].filter(Boolean).length;
            const profileCompletion = Math.round((completedFields / 3) * 100);
            
            profileWelcome.innerHTML = `Welcome, <span class="text-gold">${user.name}</span>`;
            profileSubtitle.textContent = isNewUser ? 'Welcome to ROUGE VÈRA! Start your fragrance journey.' : 'Manage your account and orders';
            
            profileContent.innerHTML = `
                <div class="profile-overview" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.16), rgba(26, 26, 26, 0.95)); padding: 25px 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.25); margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
                        <div>
                            <p style="color: #FFD700; font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">Your private fragrance space</p>
                            <h2 style="color: #fff; margin-bottom: 8px;">Good to see you, ${user.name}.</h2>
                            <p style="color: #ccc; margin: 0;">Keep your details ready for a smoother checkout.</p>
                        </div>
                        <div style="min-width: 190px;">
                            <div style="display: flex; justify-content: space-between; color: #ccc; font-size: 0.85rem; margin-bottom: 8px;">
                                <span>Profile completion</span><strong style="color: #FFD700;">${profileCompletion}%</strong>
                            </div>
                            <div style="height: 8px; background: #0a0a0a; border-radius: 10px; overflow: hidden;">
                                <div style="height: 100%; width: ${profileCompletion}%; background: #FFD700; border-radius: 10px;"></div>
                            </div>
                            ${profileCompletion < 100 ? '<button class="btn btn-outline-gold btn-sm" style="margin-top: 12px;" onclick="ProfileController.loadAddresses(); return false;"><i class="fas fa-plus"></i> Complete profile</button>' : '<p style="color: #9acd32; font-size: 0.85rem; margin: 12px 0 0;"><i class="fas fa-check-circle"></i> Profile complete</p>'}
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px;">
                        <a href="shop.html" class="btn btn-gold btn-sm"><i class="fas fa-store"></i> Explore fragrances</a>
                        <a href="cart.html" class="btn btn-outline-gold btn-sm"><i class="fas fa-shopping-bag"></i> View cart (${cartItems.length})</a>
                        <button class="btn btn-black btn-sm" onclick="ProfileController.loadSettings(); return false;"><i class="fas fa-user-edit"></i> Edit account</button>
                        <button class="btn btn-black btn-sm" onclick="ProfileController.loadOrders(); return false;"><i class="fas fa-truck"></i> Track orders</button>
                    </div>
                </div>
                <div class="profile-grid">
                    <!-- Sidebar -->
                    <aside class="profile-sidebar">
                        <div class="profile-card">
                            <div class="profile-avatar">
                                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=FFD700&color=000&bold=true" alt="Profile">
                            </div>
                            <h3 class="profile-name">${user.name}</h3>
                            <p class="profile-email">${user.email}</p>
                            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255, 215, 0, 0.1); padding: 5px 15px; border-radius: 20px; margin: 15px 0;">
                                <i class="fas fa-crown text-gold"></i>
                                <span style="color: #FFD700;">${isNewUser ? 'New Member' : 'Gold Member'}</span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
                                <div style="text-align: center;">
                                    <div style="font-size: 1.2rem; color: #FFD700; font-weight: bold;">${userOrders.length}</div>
                                    <div style="font-size: 0.8rem; color: #888;">Orders</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 1.2rem; color: #FFD700; font-weight: bold;">${CurrencySystem.formatPHP(totalSpent)}</div>
                                    <div style="font-size: 0.8rem; color: #888;">Spent</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 1.2rem; color: #FFD700; font-weight: bold;">${wishlistItems.length}</div>
                                    <div style="font-size: 0.8rem; color: #888;">Wishlist</div>
                                </div>
                            </div>
                        </div>

                        <div style="background: #1a1a1a; border-radius: 10px; overflow: hidden; margin-top: 20px;">
                            <a href="#" class="profile-menu-item active" onclick="ProfileController.loadDashboard(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #FFD700; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>Dashboard</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadOrders(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-shopping-bag"></i>
                                <span>My Orders</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadWishlist(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-heart"></i>
                                <span>Wishlist</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadSettings(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-cog"></i>
                                <span>Settings</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadAddresses(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>Address Book</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadNotifications(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-bell"></i>
                                <span>Notifications</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="ProfileController.loadSecurity(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #ccc; text-decoration: none; border-bottom: 1px solid rgba(255, 215, 0, 0.1);">
                                <i class="fas fa-shield-alt"></i>
                                <span>Security</span>
                            </a>
                            <a href="#" class="profile-menu-item" onclick="logout(); return false;" style="display: flex; align-items: center; gap: 15px; padding: 15px 20px; color: #dc143c; text-decoration: none;">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                    </aside>

                    <!-- Main Content -->
                    <main class="profile-main" id="profileMainContent">
                        ${this.loadDashboardContent(isNewUser)}
                    </main>
                </div>
            `;
        } else {
            // Guest user view
            profileWelcome.innerHTML = `My <span class="text-gold">Profile</span>`;
            profileSubtitle.textContent = 'Create an account or login to access your profile';
            
            profileContent.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <div style="background: #1a1a1a; padding: 50px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); margin-bottom: 30px;">
                        <i class="fas fa-user-circle fa-5x text-gold mb-4"></i>
                        <h2 style="color: #FFD700; margin-bottom: 15px;">Welcome to ROUGE VÈRA</h2>
                        <p style="color: #ccc; margin-bottom: 25px; font-size: 1.1rem;">
                            Create an account or login to access your personal profile, track orders, and manage your preferences.
                        </p>
                        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
                            <a href="login.html" class="btn btn-gold btn-lg">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </a>
                            <a href="login.html" class="btn btn-outline-gold btn-lg">
                                <i class="fas fa-user-plus"></i> Register
                            </a>
                        </div>
                        <p style="color: #888; margin-bottom: 30px;">Continue shopping without an account</p>
                        <a href="shop.html" class="btn btn-black">
                            <i class="fas fa-store"></i> Continue Shopping
                        </a>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 40px;">
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-shopping-bag fa-2x text-gold mb-3"></i>
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Track Orders</h4>
                            <p style="color: #888;">Check your order status and history</p>
                        </div>
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-heart fa-2x text-gold mb-3"></i>
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Wishlist</h4>
                            <p style="color: #888;">Save your favorite fragrances</p>
                        </div>
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                            <i class="fas fa-crown fa-2x text-gold mb-3"></i>
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Exclusive Offers</h4>
                            <p style="color: #888;">Get member-only discounts</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    static loadDashboardContent(isNewUser = true) {
        if (isNewUser) {
            return `
                <!-- Welcome Dashboard for New User -->
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 20px;">Welcome to ROUGE VÈRA!</h2>
                    <p style="color: #ccc; margin-bottom: 30px; font-size: 1.1rem;">
                        Your journey into luxury fragrances begins here. Discover exclusive scents and start building your collection.
                    </p>
                    
                    <!-- Welcome Stats -->
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">0</div>
                                <div style="color: #ccc;">Total Orders</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">15%</div>
                                <div style="color: #ccc;">Member Discount</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">0</div>
                                <div style="color: #ccc;">Wishlist Items</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">New</div>
                                <div style="color: #ccc;">Account Status</div>
                            </div>
                        </div>
                    </div>

                    <!-- Welcome Message & Getting Started -->
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); margin: 40px 0;">
                        <h3 style="color: #FFD700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-gift"></i> Getting Started
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                            <div style="text-align: center; padding: 20px;">
                                <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-store text-gold fa-lg"></i>
                                </div>
                                <h4 style="color: #FFD700;">Browse Collection</h4>
                                <p style="color: #888; font-size: 0.9rem;">Discover our luxury fragrances</p>
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-heart text-gold fa-lg"></i>
                                </div>
                                <h4 style="color: #FFD700;">Create Wishlist</h4>
                                <p style="color: #888; font-size: 0.9rem;">Save your favorite scents</p>
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-percent text-gold fa-lg"></i>
                                </div>
                                <h4 style="color: #FFD700;">Get Discounts</h4>
                                <p style="color: #888; font-size: 0.9rem;">Enjoy member-exclusive offers</p>
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <div style="width: 60px; height: 60px; background: rgba(255, 215, 0, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-shipping-fast text-gold fa-lg"></i>
                                </div>
                                <h4 style="color: #FFD700;">Fast Shipping</h4>
                                <p style="color: #888; font-size: 0.9rem;">Free shipping on first order</p>
                            </div>
                        </div>
                    </div>

                    <!-- First Time Offer -->
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); margin-top: 30px;">
                        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 250px;">
                                <h3 style="color: #FFD700; margin-bottom: 10px;">Special Welcome Offer</h3>
                                <p style="color: #ccc; margin-bottom: 15px;">Get 15% off your first purchase with this promo code.</p>
                                <div style="display: inline-flex; align-items: center; gap: 10px; background: rgba(255, 215, 0, 0.1); padding: 8px 15px; border-radius: 20px;">
                                    <i class="fas fa-tag text-gold"></i>
                                    <span style="color: #FFD700; font-weight: bold;">WELCOME15</span>
                                </div>
                            </div>
                            <div>
                                <a href="shop.html" class="btn btn-gold">
                                    <i class="fas fa-store"></i> Shop Now
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="profile-quick-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 40px;">
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Start Shopping</h4>
                            <p style="color: #888; margin-bottom: 20px;">Explore our premium fragrance collection</p>
                            <a href="shop.html" class="btn btn-gold btn-sm">Browse Perfumes</a>
                        </div>
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Take Fragrance Quiz</h4>
                            <p style="color: #888; margin-bottom: 20px;">Find your perfect scent match</p>
                            <button class="btn btn-outline-gold btn-sm" onclick="window.showToast('Fragrance quiz coming soon!')">
                                Start Quiz
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // For returning users
            return `
                <!-- Dashboard for Returning Users -->
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 30px;">Dashboard Overview</h2>
                    
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">0</div>
                                <div style="color: #ccc;">Total Orders</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">0</div>
                                <div style="color: #ccc;">Pending Orders</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">0</div>
                                <div style="color: #ccc;">Reviews</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; color: #FFD700; margin-bottom: 10px;">15%</div>
                                <div style="color: #ccc;">Member Discount</div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty Orders Section -->
                    <div style="margin-top: 50px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3 style="color: #FFD700;">Your Orders</h3>
                        </div>
                        
                        <div style="background: #1a1a1a; padding: 40px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                            <i class="fas fa-shopping-bag fa-4x text-gold mb-3"></i>
                            <h4 style="color: #FFD700; margin-bottom: 10px;">No orders yet</h4>
                            <p style="color: #888; margin-bottom: 20px;">Start shopping to see your orders here</p>
                            <a href="shop.html" class="btn btn-gold">Start Shopping</a>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="profile-quick-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 40px;">
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Continue Shopping</h4>
                            <p style="color: #888; margin-bottom: 20px;">Discover new fragrances</p>
                            <a href="shop.html" class="btn btn-gold btn-sm">Shop Now</a>
                        </div>
                        <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); text-align: center;">
                            <h4 style="color: #FFD700; margin-bottom: 10px;">Track Order</h4>
                            <p style="color: #888; margin-bottom: 20px;">Track your recent orders</p>
                                <button class="btn btn-outline-gold btn-sm" onclick="ProfileController.loadOrders(); return false;">
                                Track Orders
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    static loadDashboard() {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser();
        if (mainContent && user) {
            const memberSince = user.memberSince ? new Date(user.memberSince) : new Date();
            const isNewUser = (Date.now() - memberSince.getTime()) < (7 * 24 * 60 * 60 * 1000);
            mainContent.innerHTML = this.loadDashboardContent(isNewUser);
        }
        this.updateActiveMenu('dashboard');
    }

    static loadOrders() {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser() || {};
        const orders = StorageManager.getOrders().filter(order => !user.email || order.customer?.email === user.email);
        if (mainContent) {
            const ordersHTML = orders.length ? orders.map(order => `
                <article class="profile-order-card">
                    <div class="profile-order-row">
                        <div><strong>${order.id}</strong><small>${new Date(order.createdAt).toLocaleDateString()}</small></div>
                        <span class="profile-order-status">${order.status}</span>
                        <div><strong>${CurrencySystem.formatPHP(Number(order.total) || 0)}</strong><small>${(order.items || []).length} item${(order.items || []).length === 1 ? '' : 's'}</small></div>
                        <button class="btn btn-outline-gold btn-sm" onclick="ProfileController.showOrderTracking('${order.id}'); return false;"><i class="fas fa-location-arrow"></i> Track</button>
                    </div>
                    ${order.payment ? `<p class="profile-payment-status"><i class="fas fa-credit-card" aria-hidden="true"></i> ${({ cod: 'Cash on delivery', gcash: 'GCash', maya: 'Maya', bank: 'Bank transfer' })[order.payment.method] || 'Payment'} · ${order.payment.status}</p>` : ''}
                    ${this.renderDeliveredReviewForms(order, user.email)}
                </article>
            `).join('') : `
                <div style="padding: 45px 20px; text-align: center;"><i class="fas fa-shopping-bag fa-4x text-gold mb-3"></i><h4 style="color: #FFD700; margin-bottom: 10px;">No orders yet</h4><p style="color: #888; margin-bottom: 20px;">Your completed purchases will appear here.</p><a href="shop.html" class="btn btn-gold"><i class="fas fa-store"></i> Start Shopping</a></div>
            `;
            mainContent.innerHTML = `<div><div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 10px; flex-wrap: wrap;"><h2 style="color: #FFD700;">My Orders</h2><span class="text-muted">${orders.length} order${orders.length === 1 ? '' : 's'}</span></div><p style="color: #ccc; margin-bottom: 25px;">Review your purchase history and order status.</p><div class="profile-order-list">${ordersHTML}</div></div>`;

            mainContent.querySelectorAll('.verified-review-form').forEach(form => {
                form.addEventListener('submit', event => {
                    event.preventDefault();
                    const formData = new FormData(form);
                    const result = ProductReviewSystem.submit(
                        form.dataset.orderId,
                        form.dataset.productId,
                        formData.get('rating'),
                        formData.get('comment')
                    );
                    UIComponents.showToast(result.message, result.ok ? 'success' : 'error');
                    if (result.ok) this.loadOrders();
                });
            });
        }
        this.updateActiveMenu('orders');
    }

    static renderDeliveredReviewForms(order, email) {
        if (order.status !== 'Delivered') return '';
        const uniqueProducts = new Map();
        (order.items || []).forEach(item => {
            const productId = ProductReviewSystem.resolveOrderProductId(item);
            if (productId) uniqueProducts.set(productId, PRODUCTS.find(product => product.id === productId));
        });

        const reviewForms = [...uniqueProducts.entries()].map(([productId, product]) => {
            if (ProductReviewSystem.hasReviewed(order.id, productId, email)) {
                return `<p class="review-submitted"><i class="fas fa-circle-check" aria-hidden="true"></i> Your verified rating for ${product.name} is submitted.</p>`;
            }
            return `
                <form class="verified-review-form" data-order-id="${order.id}" data-product-id="${productId}">
                    <label for="rating-${order.id}-${productId}">Rate ${product.name}</label>
                    <div class="verified-review-controls">
                        <select id="rating-${order.id}-${productId}" name="rating" required aria-label="Rating for ${product.name}">
                            <option value="" selected disabled>Choose stars</option>
                            <option value="5">5 stars</option>
                            <option value="4">4 stars</option>
                            <option value="3">3 stars</option>
                            <option value="2">2 stars</option>
                            <option value="1">1 star</option>
                        </select>
                        <input name="comment" type="text" maxlength="400" placeholder="Share a short note (optional)" aria-label="Optional review for ${product.name}">
                        <button class="btn btn-outline-gold btn-sm" type="submit"><i class="fas fa-star" aria-hidden="true"></i> Submit verified rating</button>
                    </div>
                </form>`;
        }).join('');

        return reviewForms ? `<div class="verified-review-list"><p class="verified-review-note"><i class="fas fa-shield-check" aria-hidden="true"></i> Ratings are verified against delivered orders.</p>${reviewForms}</div>` : '';
    }

    static showOrderTracking(orderId) {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser() || {};
        const order = StorageManager.getOrders().find(item => item.id === orderId && (!user.email || item.customer?.email === user.email));
        if (!mainContent || !order) return;

        const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentStep = Math.max(0, steps.indexOf(order.status));
        mainContent.innerHTML = `
            <div>
                <button class="btn btn-outline-gold btn-sm" onclick="ProfileController.loadOrders(); return false;"><i class="fas fa-arrow-left"></i> Back to orders</button>
                <h2 style="color: #FFD700; margin: 25px 0 8px;">Track ${order.id}</h2>
                <p style="color: #b8c4d8; margin-bottom: 30px;">Your order is currently <strong style="color: #FFD700;">${order.status}</strong>.</p>
                <div class="order-tracking-timeline">
                    ${steps.map((step, index) => `<div class="order-tracking-step ${index <= currentStep ? 'complete' : ''}"><span>${index < currentStep ? '<i class="fas fa-check"></i>' : index + 1}</span><strong>${step}</strong><small>${index === currentStep ? 'Current status' : index < currentStep ? 'Completed' : 'Next step'}</small></div>`).join('')}
                </div>
                <div style="background: #1a1a1a; padding: 25px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); margin-top: 25px;">
                    <h3 style="color: #FFD700; margin-bottom: 15px;">Delivery details</h3>
                    <p style="color: #d6deed;">${order.address?.line || 'Address unavailable'}<br>${order.address?.city || ''} ${order.address?.postal || ''} ${order.address?.country || ''}</p>
                    <p style="color: #b8c4d8; margin-top: 12px;">${(order.items || []).map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
                </div>
            </div>`;
        this.updateActiveMenu('orders');
    }

    static loadSecurity() {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser() || {};
        if (mainContent) {
            mainContent.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 10px;">Security & Privacy</h2>
                    <p style="color: #888; margin-bottom: 30px;">Manage your sign-in details and account protection.</p>
                    <div class="profile-security-grid">
                        <div class="profile-security-card"><i class="fas fa-check-circle text-gold"></i><div><strong>Active session</strong><p>Signed in as ${user.email}</p></div><span class="profile-security-badge">Protected</span></div>
                        <div class="profile-security-card"><i class="fas fa-clock text-gold"></i><div><strong>Member since</strong><p>${user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'Recently'}</p></div></div>
                    </div>
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2); margin-top: 20px;">
                        <h3 style="color: #FFD700; margin-bottom: 20px;">Change password</h3>
                        <form id="profilePasswordForm"><div class="form-group"><label for="newProfilePassword">New password</label><input id="newProfilePassword" type="password" minlength="6" required placeholder="At least 6 characters"></div><div class="form-group"><label for="confirmProfilePassword">Confirm new password</label><input id="confirmProfilePassword" type="password" minlength="6" required placeholder="Repeat your new password"></div><button class="btn btn-gold" type="submit"><i class="fas fa-lock"></i> Update password</button></form>
                    </div>
                    <button class="btn btn-outline-gold" style="margin-top: 20px;" onclick="logout(); return false;"><i class="fas fa-sign-out-alt"></i> Sign out of this account</button>
                </div>
            `;
            document.getElementById('profilePasswordForm')?.addEventListener('submit', event => {
                event.preventDefault();
                const password = document.getElementById('newProfilePassword').value;
                const confirmation = document.getElementById('confirmProfilePassword').value;
                if (password !== confirmation) {
                    UIComponents.showToast('Passwords do not match.', 'error');
                    return;
                }
                user.passwordUpdatedAt = new Date().toISOString();
                StorageManager.saveUser(user);
                event.target.reset();
                UIComponents.showToast('Password updated successfully.');
            });
        }
        this.updateActiveMenu('security');
    }

    static loadWishlist() {
        const mainContent = document.getElementById('profileMainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 30px;">My Wishlist</h2>
                    <p style="color: #ccc; margin-bottom: 30px;">Your saved fragrances</p>
                    <div class="text-center" style="padding: 50px; background: #1a1a1a; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                        <i class="fas fa-heart fa-4x text-gold mb-3"></i>
                        <h4 style="color: #FFD700; margin-bottom: 10px;">Your wishlist is empty</h4>
                        <p style="color: #888; margin-bottom: 20px;">Start adding your favorite perfumes</p>
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <a href="shop.html" class="btn btn-gold">Browse Collection</a>
                            <a href="collections.html" class="btn btn-outline-gold">View Collections</a>
                        </div>
                    </div>
                </div>
            `;
        }
        this.updateActiveMenu('wishlist');
    }

    static loadSettings() {
        const mainContent = document.getElementById('profileMainContent');
        if (mainContent) {
            const user = StorageManager.getUser() || { name: '', email: '' };
            
            mainContent.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 30px;">Account Settings</h2>
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                        <form id="settingsForm">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #FFD700;">Full Name</label>
                                <input type="text" id="settingsName" value="${user.name || ''}" required autocomplete="name" style="width: 100%; padding: 12px; background: #0a0a0a; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 4px; color: white;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #FFD700;">Email Address</label>
                                <input type="email" id="settingsEmail" value="${user.email || ''}" required autocomplete="email" style="width: 100%; padding: 12px; background: #0a0a0a; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 4px; color: white;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: #FFD700;">Password</label>
                                <input type="password" id="settingsPassword" minlength="6" autocomplete="new-password" placeholder="Leave blank to keep current password" style="width: 100%; padding: 12px; background: #0a0a0a; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 4px; color: white;">
                            </div>
                            
                            <div style="display: flex; gap: 15px; margin-top: 30px;">
                                <button type="button" class="btn btn-outline-gold" style="flex: 1;" onclick="ProfileController.loadDashboard(); return false;">
                                    Cancel
                                </button>
                                <button type="submit" class="btn btn-gold" style="flex: 2;">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Add form submission handler
            const settingsForm = document.getElementById('settingsForm');
            if (settingsForm) {
                settingsForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const name = document.getElementById('settingsName').value.trim();
                    const email = document.getElementById('settingsEmail').value.trim();
                    const password = document.getElementById('settingsPassword').value;
                    
                    if (name && email) {
                        const user = StorageManager.getUser() || {};
                        user.name = name;
                        user.email = email;
                        user.isLoggedIn = true;
                        if (password) user.passwordUpdatedAt = new Date().toISOString();
                        StorageManager.saveUser(user);
                        
                        UIComponents.showToast('Settings updated successfully!');
                        this.loadProfileContent();
                    } else {
                        UIComponents.showToast('Please enter your name and email.', 'error');
                    }
                });
            }
        }
        this.updateActiveMenu('settings');
    }

    static loadAddresses() {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser() || {};
        const address = user.address || {};

        if (mainContent) {
            mainContent.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 10px;">Address Book</h2>
                    <p style="color: #888; margin-bottom: 30px;">Save your shipping details for faster checkout.</p>
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                        <form id="addressForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="addressName">Recipient Name</label>
                                    <input type="text" id="addressName" value="${address.name || user.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="addressPhone">Phone Number</label>
                                    <input type="tel" id="addressPhone" value="${address.phone || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="addressLine">Street Address</label>
                                <input type="text" id="addressLine" value="${address.line || ''}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="addressCity">City</label>
                                    <input type="text" id="addressCity" value="${address.city || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="addressPostal">Postal Code</label>
                                    <input type="text" id="addressPostal" value="${address.postal || ''}" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-gold"><i class="fas fa-save"></i> Save Address</button>
                        </form>
                    </div>
                </div>
            `;

            document.getElementById('addressForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentUser = StorageManager.getUser() || {};
                currentUser.address = {
                    name: document.getElementById('addressName').value.trim(),
                    phone: document.getElementById('addressPhone').value.trim(),
                    line: document.getElementById('addressLine').value.trim(),
                    city: document.getElementById('addressCity').value.trim(),
                    postal: document.getElementById('addressPostal').value.trim()
                };
                StorageManager.saveUser(currentUser);
                UIComponents.showToast('Shipping address saved successfully!');
            });
        }
        this.updateActiveMenu('address book');
    }

    static loadNotifications() {
        const mainContent = document.getElementById('profileMainContent');
        const user = StorageManager.getUser() || {};
        const preferences = user.preferences || { orderUpdates: true, newArrivals: true, offers: false };

        if (mainContent) {
            mainContent.innerHTML = `
                <div>
                    <h2 style="color: #FFD700; margin-bottom: 10px;">Notifications</h2>
                    <p style="color: #888; margin-bottom: 30px;">Choose which updates you want to receive.</p>
                    <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; border: 1px solid rgba(255, 215, 0, 0.2);">
                        <form id="notificationsForm">
                            <label style="display: flex; align-items: center; gap: 12px; padding: 18px 0; border-bottom: 1px solid rgba(255, 215, 0, 0.1); color: #ccc;">
                                <input type="checkbox" id="orderUpdates" ${preferences.orderUpdates ? 'checked' : ''}>
                                <span><strong style="color: #FFD700;">Order updates</strong><br><small>Shipping and delivery notifications</small></span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 12px; padding: 18px 0; border-bottom: 1px solid rgba(255, 215, 0, 0.1); color: #ccc;">
                                <input type="checkbox" id="newArrivals" ${preferences.newArrivals ? 'checked' : ''}>
                                <span><strong style="color: #FFD700;">New arrivals</strong><br><small>Updates about newly released fragrances</small></span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 12px; padding: 18px 0 25px; color: #ccc;">
                                <input type="checkbox" id="offers" ${preferences.offers ? 'checked' : ''}>
                                <span><strong style="color: #FFD700;">Exclusive offers</strong><br><small>Member discounts and special promotions</small></span>
                            </label>
                            <button type="submit" class="btn btn-gold"><i class="fas fa-bell"></i> Save Preferences</button>
                        </form>
                    </div>
                </div>
            `;

            document.getElementById('notificationsForm')?.addEventListener('submit', (e) => {
                e.preventDefault();
                const currentUser = StorageManager.getUser() || {};
                currentUser.preferences = {
                    orderUpdates: document.getElementById('orderUpdates').checked,
                    newArrivals: document.getElementById('newArrivals').checked,
                    offers: document.getElementById('offers').checked
                };
                StorageManager.saveUser(currentUser);
                UIComponents.showToast('Notification preferences saved!');
            });
        }
        this.updateActiveMenu('notifications');
    }

    static updateActiveMenu(activeItem) {
        const menuItems = document.querySelectorAll('.profile-menu-item');
        menuItems.forEach(item => {
            const text = item.querySelector('span')?.textContent?.toLowerCase();
            if (text === activeItem || (activeItem === 'dashboard' && text === 'dashboard')) {
                item.style.color = '#FFD700';
                item.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
            } else {
                item.style.color = '#ccc';
                item.style.backgroundColor = 'transparent';
            }
        });
    }

    static init() {
        this.updateUserStatusUI();
        this.loadProfileContent();
    }
}

// ============================================
// 8. PAGE CONTROLLERS
// ============================================
class PageController {
    static initialize() {
        this.initializePreloader();
        this.initializeNavigation();
        this.initializeMotion();
        this.initializePromoAd();
        this.initializeProductGalleries();
        this.initializeCart();
        this.initializeTheme();
        this.initializeDeviceSwitcher();
        this.updateAdminAccessLink();
        this.loadPageSpecificScripts();
    }

    static updateAdminAccessLink() {
        const user = StorageManager.getUser();
        const isAdmin = Boolean(user?.isLoggedIn && user?.isAdmin);
        document.querySelectorAll('.admin-access-link').forEach(link => {
            link.href = isAdmin ? 'admin.html' : 'admin-login.html';
            link.innerHTML = isAdmin
                ? '<i class="fas fa-plus-circle"></i> Add Product'
                : '<i class="fas fa-shield-alt"></i> Admin Login';
        });
    }

    static initializePromoAd() {
        if (!document.querySelector('.hero-section') || sessionStorage.getItem('rougeVeraPromoSeen')) return;

        const slides = PRODUCTS
            .filter(product => product.image && !/coming soon/i.test(product.name) && product.image !== '1.jpeg')
            .slice(0, 5);
        if (!slides.length) return;

        const ad = document.createElement('div');
        ad.className = 'promo-ad-overlay';
        ad.innerHTML = `
            <section class="promo-ad" role="dialog" aria-modal="true" aria-labelledby="promoAdTitle" aria-describedby="promoAdDescription" tabindex="-1">
                <button class="promo-ad-close" type="button" aria-label="Close advertisement"><i class="fas fa-times" aria-hidden="true"></i></button>
                <div class="promo-ad-visual">
                    ${slides.map((product, index) => `<img class="promo-ad-slide ${index === 0 ? 'active' : ''}" src="${product.image}" alt="${product.name}" ${index ? 'loading="lazy"' : 'fetchpriority="high"'} onerror="this.onerror=null;this.src='4.jpg'">`).join('')}
                    <span class="promo-ad-frame-label">ROUGE VÈRA · SCENT STORIES</span>
                    <span class="promo-ad-progress" aria-hidden="true"><span></span></span>
                </div>
                <div class="promo-ad-copy">
                    <span class="promo-ad-eyebrow">A moment for discovery</span>
                    <h2 id="promoAdTitle">Find the scent that stays.</h2>
                    <p id="promoAdDescription">Explore expressive fragrances, composed for every version of you.</p>
                    <div class="promo-ad-footer">
                        <a class="promo-ad-shop" href="shop.html">Discover the collection <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                        <button class="promo-ad-skip" type="button" disabled>Skip in <span>5</span></button>
                    </div>
                </div>
            </section>`;
        document.body.appendChild(ad);
        sessionStorage.setItem('rougeVeraPromoSeen', 'true');

        const dialog = ad.querySelector('.promo-ad');
        const skip = ad.querySelector('.promo-ad-skip');
        const close = ad.querySelector('.promo-ad-close');
        const countdown = skip.querySelector('span');
        const progress = ad.querySelector('.promo-ad-progress > span');
        const imageSlides = [...ad.querySelectorAll('.promo-ad-slide')];
        let remaining = 5;
        let activeSlide = 0;

        const dismiss = () => {
            window.clearInterval(countdownTimer);
            window.clearInterval(slideTimer);
            ad.classList.add('is-closing');
            document.body.classList.remove('promo-ad-open');
            window.setTimeout(() => ad.remove(), 260);
        };
        const countdownTimer = window.setInterval(() => {
            remaining -= 1;
            countdown.textContent = String(remaining);
            progress.style.width = `${((5 - remaining) / 5) * 100}%`;
            if (remaining <= 0) {
                window.clearInterval(countdownTimer);
                skip.disabled = false;
                skip.textContent = 'Skip advertisement';
            }
        }, 1000);
        const slideTimer = window.setInterval(() => {
            imageSlides[activeSlide].classList.remove('active');
            activeSlide = (activeSlide + 1) % imageSlides.length;
            imageSlides[activeSlide].classList.add('active');
        }, 1400);

        skip.addEventListener('click', () => {
            if (!skip.disabled) dismiss();
        });
        close.addEventListener('click', dismiss);
        ad.addEventListener('click', event => {
            if (event.target === ad) dismiss();
        });
        document.addEventListener('keydown', function handlePromoKeydown(event) {
            if (!document.body.contains(ad)) {
                document.removeEventListener('keydown', handlePromoKeydown);
                return;
            }
            if (event.key === 'Escape') dismiss();
            if (event.key === 'Tab') {
                const focusable = [...ad.querySelectorAll('a[href], button:not(:disabled)')];
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        });
        document.body.classList.add('promo-ad-open');
        window.setTimeout(() => dialog.focus(), 80);
    }

    static initializeMotion() {
        if (!('IntersectionObserver' in window)) return;

        const motionTargets = document.querySelectorAll(
            '.shop-header-content, .section-header, .section > .container > .checkout-grid, .products-grid, .collections-grid, .newsletter-form, .fragrance-finder-heading, .finder-promises, .support-intro, .support-cta, .faq-list, .profile-order-list, .footer-grid'
        );
        if (!motionTargets.length) return;

        document.body.classList.add('motion-ready');
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.querySelectorAll(':scope > .product-card, :scope > .collection-card, :scope > .faq-item, :scope > .profile-order-card').forEach((item, index) => {
                    item.style.setProperty('--reveal-index', Math.min(index, 8));
                });
                entry.target.classList.add('is-visible');
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

        motionTargets.forEach(target => {
            target.dataset.reveal = '';
            observer.observe(target);
        });
    }

    static initializeProductGalleries() {
        document.addEventListener('click', event => {
            const thumbnail = event.target.closest('.product-gallery-thumb');
            if (!thumbnail) return;

            const gallery = thumbnail.closest('.product-img');
            const mainImage = gallery?.querySelector('.product-main-image');
            if (!mainImage) return;

            mainImage.src = thumbnail.dataset.galleryImage;
            thumbnail.parentElement.querySelectorAll('.product-gallery-thumb').forEach(button => {
                const isActive = button === thumbnail;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });
        });

        document.addEventListener('pointermove', event => {
            if (!event.target.closest('.product-gallery-stage') || event.pointerType !== 'mouse') return;
            const stage = event.target.closest('.product-gallery-stage');
            const bounds = stage.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;
            stage.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`);
            stage.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`);
        });

        document.addEventListener('pointerout', event => {
            const stage = event.target.closest('.product-gallery-stage');
            if (!stage || stage.contains(event.relatedTarget)) return;
            stage.style.setProperty('--tilt-x', '0deg');
            stage.style.setProperty('--tilt-y', '0deg');
        });
    }
    
    static initializePreloader() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 500);
                }, 1000);
            });
            
            if (document.readyState === 'complete') {
                preloader.style.display = 'none';
            }
        }
    }
    
    static initializeNavigation() {
        const addFaqNavigation = (selector, linkClass) => {
            const navigation = document.querySelector(selector);
            if (!navigation || navigation.querySelector('a[href="support.html"]')) return;
            const isSupportPage = window.location.pathname.toLowerCase().endsWith('support.html');
            navigation.insertAdjacentHTML('beforeend', `<a href="support.html" class="${linkClass} ${isSupportPage ? 'active' : ''}" aria-label="Open frequently asked questions"><i class="fas fa-circle-question"></i><span>FAQ</span><b>9</b></a>`);
        };
        addFaqNavigation('.nav-links', 'nav-link faq-nav-link');
        addFaqNavigation('.mobile-nav', 'mobile-nav-link faq-nav-link');

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileMenuBtn && mobileNav) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
                mobileMenuBtn.innerHTML = mobileNav.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
        }
        
        // Mobile nav links
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav) mobileNav.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });
    }
    
    static initializeCart() {
        const cartManager = new CartManager();
        
        // Update cart count
        const updateCartCount = () => {
            const cartCountElements = document.querySelectorAll('.cart-count');
            const totalItems = cartManager.getTotalItems();
            
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
            });
        };
        
        // Initialize cart count
        updateCartCount();
        
        // Cart sidebar functionality
        const cartIcon = document.querySelector('.cart-icon');
        const cartSidebar = document.querySelector('.cart-sidebar');
        const cartOverlay = document.querySelector('.cart-overlay');
        const closeCart = document.querySelector('.close-cart');
        
        const openCart = () => {
            if (cartSidebar) cartSidebar.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
            updateCartSidebar();
        };
        
        const closeCartSidebar = () => {
            if (cartSidebar) cartSidebar.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');
        };
        
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                openCart();
            });
        }
        
        if (closeCart) {
            closeCart.addEventListener('click', closeCartSidebar);
        }
        
        if (cartOverlay) {
            cartOverlay.addEventListener('click', closeCartSidebar);
        }
        
        // Update cart sidebar
        const updateCartSidebar = () => {
            const cartItems = document.querySelector('.cart-items');
            const cartTotalPrice = document.querySelector('.cart-total-price');
            
            if (!cartItems) return;
            
            if (cartManager.cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-bag fa-3x text-gold mb-3"></i>
                        <h4 class="text-gold">Your cart is empty</h4>
                        <p class="text-muted">Add some luxurious perfumes</p>
                        <a href="shop.html" class="btn btn-gold mt-3">Start Shopping</a>
                    </div>
                `;
                if (cartTotalPrice) cartTotalPrice.textContent = CurrencySystem.formatPHP(0);
                return;
            }
            
            let itemsHTML = '';
            cartManager.cart.forEach(item => {
                itemsHTML += UIComponents.createCartItem(item);
            });
            
            cartItems.innerHTML = itemsHTML;
            
            // Update total
            const total = cartManager.getTotalAmount();
            if (cartTotalPrice) {
                cartTotalPrice.textContent = CurrencySystem.formatPHP(total.total);
            }
        };
        
        // Export cart functions to window
        window.openQuickView = (productId) => {
            const product = PRODUCTS.find(item => item.id === productId);
            if (!product) return;

            let modal = document.querySelector('.quick-view-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'quick-view-modal';
                modal.innerHTML = `
                    <div class="quick-view-backdrop" data-quick-view-close></div>
                    <section class="quick-view-panel" role="dialog" aria-modal="true" aria-labelledby="quickViewTitle" tabindex="-1">
                        <button class="quick-view-close" type="button" aria-label="Close quick view" data-quick-view-close><i class="fas fa-times" aria-hidden="true"></i></button>
                        <div class="quick-view-content"></div>
                    </section>`;
                document.body.appendChild(modal);

                const closeModal = () => {
                    modal.classList.remove('active');
                    document.body.classList.remove('quick-view-open');
                    document.removeEventListener('keydown', handleKeydown);
                    modal.returnFocus?.focus();
                };
                const handleKeydown = event => {
                    if (event.key === 'Escape') closeModal();
                };
                modal.closeQuickView = closeModal;
                modal.handleQuickViewKeydown = handleKeydown;
                modal.addEventListener('click', event => {
                    if (event.target.closest('[data-quick-view-close]')) closeModal();
                    const thumbnail = event.target.closest('.quick-view-thumb');
                    if (!thumbnail) return;
                    const image = modal.querySelector('.quick-view-image');
                    image.src = thumbnail.dataset.image;
                    modal.querySelectorAll('.quick-view-thumb').forEach(button => {
                        const active = button === thumbnail;
                        button.classList.toggle('active', active);
                        button.setAttribute('aria-pressed', String(active));
                    });
                });
                modal.addEventListener('change', event => {
                    if (!event.target.matches('.quick-view-size')) return;
                    const size = productForModal()?.sizes.find(item => item.size === event.target.value);
                    if (!size) return;
                    modal.querySelector('.quick-view-price').textContent = CurrencySystem.formatPHP(size.price);
                    modal.querySelector('.quick-view-original').textContent = CurrencySystem.formatPHP(size.originalPrice);
                    modal.querySelector('.quick-view-current-size').textContent = `for ${size.size}`;
                });
                modal.addEventListener('click', event => {
                    const addButton = event.target.closest('.quick-view-add');
                    if (!addButton) return;
                    const added = window.addToCart(addButton.dataset.productId, modal.querySelector('.quick-view-size').value);
                    if (added) closeModal();
                });
                modal.addEventListener('submit', event => {
                    const reviewForm = event.target.closest('.quick-view-review-form');
                    if (!reviewForm) return;
                    event.preventDefault();
                    const formData = new FormData(reviewForm);
                    const productId = modal.productForModal.id;
                    const result = ProductReviewSystem.submit(
                        formData.get('orderId'),
                        productId,
                        formData.get('rating'),
                        formData.get('comment')
                    );
                    UIComponents.showToast(result.message, result.ok ? 'success' : 'error');
                    if (result.ok) window.openQuickView(productId);
                });
                modal.productForModal = null;
                function productForModal() { return modal.productForModal; }
            }

            const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image];
            const selectedCardSize = document.querySelector(`.product-card[data-product-id="${product.id}"] .size-btn.active`)?.dataset.size;
            const firstSize = product.sizes.find(size => size.size === selectedCardSize) || product.sizes[0];
            const summary = ProductReviewSystem.getSummary(product.id);
            const reviews = ProductReviewSystem.getVerifiedReviews(product.id)
                .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
                .slice(0, 5);
            const reviewableOrders = ProductReviewSystem.getReviewableOrders(product.id);
            const deliveredOrders = ProductReviewSystem.getDeliveredOrders(product.id);
            const rating = summary.count
                ? `<span class="verified-rating-stars">${'★'.repeat(Math.round(summary.average))}${'☆'.repeat(5 - Math.round(summary.average))}</span><strong>${summary.average.toFixed(1)}</strong><span>${summary.count} verified review${summary.count === 1 ? '' : 's'}</span><i class="fas fa-circle-check" aria-hidden="true"></i>`
                : '<span class="rating-empty">No verified ratings yet</span>';
            const reviewBreakdown = [5, 4, 3, 2, 1].map(stars => {
                const count = summary.distribution[stars];
                const percentage = summary.count ? Math.round((count / summary.count) * 100) : 0;
                return `<div class="quick-view-rating-row"><span>${stars} <span aria-hidden="true">★</span></span><span class="quick-view-rating-track"><span style="width: ${percentage}%"></span></span><span>${count}</span></div>`;
            }).join('');
            const reviewForm = reviewableOrders.length ? `
                <form class="quick-view-review-form">
                    <h4>Write a verified review</h4>
                    <div class="quick-view-review-form-fields">
                        ${reviewableOrders.length > 1 ? `<label class="visually-hidden" for="quickViewOrder">Choose delivered order</label><select id="quickViewOrder" name="orderId" required>${reviewableOrders.map(order => `<option value="${ProductReviewSystem.escapeHTML(order.id)}">Order ${ProductReviewSystem.escapeHTML(order.id)} · ${new Date(order.createdAt).toLocaleDateString()}</option>`).join('')}</select>` : `<input type="hidden" name="orderId" value="${ProductReviewSystem.escapeHTML(reviewableOrders[0].id)}">`}
                        <label class="visually-hidden" for="quickViewRating">Your rating</label>
                        <select id="quickViewRating" name="rating" required><option value="" selected disabled>Choose a star rating</option><option value="5">★★★★★ · Excellent</option><option value="4">★★★★☆ · Very good</option><option value="3">★★★☆☆ · Good</option><option value="2">★★☆☆☆ · Fair</option><option value="1">★☆☆☆☆ · Poor</option></select>
                        <label class="visually-hidden" for="quickViewComment">Your review</label>
                        <textarea id="quickViewComment" name="comment" maxlength="400" placeholder="Share your experience (optional)"></textarea>
                        <button class="btn btn-outline-gold" type="submit"><i class="fas fa-star" aria-hidden="true"></i> Submit review</button>
                    </div>
                </form>` : `<p class="quick-view-review-note"><i class="fas fa-shield-alt" aria-hidden="true"></i> ${deliveredOrders.length ? 'You have reviewed your delivered purchases for this product.' : 'Verified reviews are available after a delivered purchase.'} <a href="profile.html">View your orders</a></p>`;
            modal.productForModal = product;
            if (!modal.classList.contains('active')) modal.returnFocus = document.activeElement;
            modal.querySelector('.quick-view-content').innerHTML = `
                <div class="quick-view-grid">
                    <div class="quick-view-gallery">
                        <div class="quick-view-image-wrap"><img class="quick-view-image" src="${gallery[0]}" alt="${product.name}" onerror="this.onerror=null;this.src='1.jpeg'"></div>
                        ${gallery.length > 1 ? `<div class="quick-view-thumbs" role="group" aria-label="${product.name} photos">${gallery.map((image, index) => `<button class="quick-view-thumb ${index === 0 ? 'active' : ''}" type="button" data-image="${image}" aria-label="Show photo ${index + 1}" aria-pressed="${index === 0}"><img src="${image}" alt=""></button>`).join('')}</div>` : ''}
                    </div>
                    <div class="quick-view-info">
                        <p class="quick-view-kicker">${product.category} collection</p>
                        <h3 id="quickViewTitle">${product.name}</h3>
                        <div class="product-rating">${rating}</div>
                        <p class="quick-view-description">${product.description}</p>
                        <section class="quick-view-reviews" aria-label="Product ratings and verified reviews">
                            <div class="quick-view-review-summary"><div><strong>${summary.count ? summary.average.toFixed(1) : '—'}</strong><span class="verified-rating-stars" aria-label="${summary.count ? `${summary.average.toFixed(1)} out of 5 stars` : 'No ratings yet'}">${summary.count ? `${'★'.repeat(Math.round(summary.average))}${'☆'.repeat(5 - Math.round(summary.average))}` : '☆☆☆☆☆'}</span><small>${summary.count} verified rating${summary.count === 1 ? '' : 's'}</small></div><div class="quick-view-rating-breakdown" aria-label="Rating distribution">${reviewBreakdown}</div></div>
                            <h4>Customer reviews</h4>
                            ${reviews.length ? reviews.map(review => ProductReviewSystem.renderVerifiedReview(review)).join('') : '<p class="quick-view-review-empty">No reviews yet. Be the first verified customer to share your experience.</p>'}
                            ${reviewForm}
                        </section>
                        <p class="quick-view-stock ${product.stock === 0 ? 'out-of-stock' : ''}">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                        <label class="quick-view-size-label" for="quickViewSize">Choose a size</label>
                        <select class="quick-view-size" id="quickViewSize">${product.sizes.map(size => `<option value="${size.size}" ${size.size === firstSize.size ? 'selected' : ''}>${size.size} · ${CurrencySystem.formatPHP(size.price)}</option>`).join('')}</select>
                        <div class="quick-view-price-row"><strong class="quick-view-price">${CurrencySystem.formatPHP(firstSize.price)}</strong><del class="quick-view-original">${CurrencySystem.formatPHP(firstSize.originalPrice)}</del><span class="quick-view-current-size">for ${firstSize.size}</span></div>
                        <div class="quick-view-actions"><button class="btn btn-gold quick-view-add" type="button" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}><i class="fas fa-shopping-bag" aria-hidden="true"></i> Add to cart</button><a class="btn btn-outline-gold" href="shop.html?collection=${encodeURIComponent(product.category)}">View collection</a></div>
                    </div>
                </div>`;
            modal.classList.add('active');
            document.body.classList.add('quick-view-open');
            document.addEventListener('keydown', modal.handleQuickViewKeydown);
            modal.querySelector('.quick-view-close').focus();
        };

        window.addToCart = (productId, requestedSize = null) => {
            const product = PRODUCTS.find(p => p.id === productId);
            if (!product) return false;
            {
                const existingQuantity = cartManager.cart
                    .filter(item => item.id === productId)
                    .reduce((total, item) => total + item.quantity, 0);
                if (product.stock <= existingQuantity) {
                    UIComponents.showToast(`${product.name} is out of stock`, 'error');
                    return false;
                }

                // Get the selected size and price
                const productCard = document.querySelector(`[data-product-id="${productId}"]`);
                if (!productCard) return false;
                
                const activeSizeBtn = requestedSize
                    ? [...productCard.querySelectorAll('.size-btn')].find(button => button.dataset.size === requestedSize)
                    : productCard.querySelector('.size-btn.active');
                if (!activeSizeBtn) return false;
                
                const selectedSize = activeSizeBtn.dataset.size;
                const selectedPrice = parseFloat(activeSizeBtn.dataset.price);
                const selectedOriginal = parseFloat(activeSizeBtn.dataset.original);
                const discountPercentage = parseInt(activeSizeBtn.dataset.discount);
                
                // Create product with size info
                const productToAdd = {
                    ...product,
                    price: selectedPrice,
                    originalPrice: selectedOriginal,
                    selectedSize: selectedSize,
                    discountPercentage: discountPercentage,
                    // Keep only selected size data
                    sizes: [{
                        size: selectedSize,
                        price: selectedPrice,
                        originalPrice: selectedOriginal,
                        discountPercentage: discountPercentage
                    }]
                };
                
                cartManager.addItem(productToAdd, 1);
                updateCartCount();
                updateCartSidebar();
                UIComponents.showToast(`${product.name} (${selectedSize}) added to cart!`);
                return true;
            }
        };
        
        window.removeFromCart = (productId, selectedSize = null) => {
            cartManager.removeItem(productId, selectedSize);
            updateCartCount();
            updateCartSidebar();
            UIComponents.showToast('Item removed from cart');
        };
        
        window.updateCartItem = (productId, selectedSize, quantity) => {
            cartManager.updateQuantity(productId, selectedSize, quantity);
            updateCartCount();
            updateCartSidebar();
        };
        
        window.clearCart = () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                cartManager.clear();
                updateCartCount();
                updateCartSidebar();
                UIComponents.showToast('Cart cleared');
            }
        };
    }
    
    static initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const themeIcon = themeToggle.querySelector('i');
        const currentTheme = StorageManager.getTheme();
        
        // Apply saved theme
        if (currentTheme === 'light') {
            document.body.classList.add('light-mode');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
        
        // Toggle theme
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            
            if (themeIcon) {
                if (document.body.classList.contains('light-mode')) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                    StorageManager.saveTheme('light');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                    StorageManager.saveTheme('dark');
                }
            }
        });
    }

    static initializeDeviceSwitcher() {
        if (document.querySelector('.device-switcher')) return;

        document.body.insertAdjacentHTML('beforeend', `
            <div class="device-switcher" role="group" aria-label="Preview device size">
                <div class="device-switcher-heading"><span class="device-switcher-label">Preview mode</span><span class="device-switcher-status" aria-live="polite"></span></div>
                <div class="device-switcher-options">
                    <button type="button" data-device="pc" title="PC preview - full desktop width" aria-label="Use PC layout"><i class="fas fa-desktop"></i><span>PC</span><b></b></button>
                    <button type="button" data-device="laptop" title="Laptop preview - 1024 pixel canvas" aria-label="Use laptop layout"><i class="fas fa-laptop"></i><span>Laptop</span><b></b></button>
                    <button type="button" data-device="phone" title="Phone preview - 390 pixel canvas" aria-label="Use phone layout"><i class="fas fa-mobile-screen-button"></i><span>Phone</span><b></b></button>
                </div>
            </div>
        `);

        const switcher = document.querySelector('.device-switcher');
        const buttons = switcher.querySelectorAll('[data-device]');
        const status = switcher.querySelector('.device-switcher-status');
        const modeDetails = {
            pc: 'Full width',
            laptop: '1024px canvas',
            phone: '390px canvas'
        };
        const savedMode = localStorage.getItem('rougeVeraDeviceMode') || 'pc';
        const applyMode = (mode) => {
            if (!modeDetails[mode]) mode = 'pc';
            document.body.classList.remove('device-preview-pc', 'device-preview-laptop', 'device-preview-phone');
            document.body.classList.add(`device-preview-${mode}`);
            buttons.forEach(button => {
                const active = button.dataset.device === mode;
                button.classList.toggle('active', active);
                button.setAttribute('aria-pressed', String(active));
            });
            status.textContent = `${mode[0].toUpperCase()}${mode.slice(1)} · ${modeDetails[mode]}`;
            localStorage.setItem('rougeVeraDeviceMode', mode);
        };

        buttons.forEach(button => button.addEventListener('click', () => applyMode(button.dataset.device)));
        applyMode(savedMode);
    }
    
    static loadPageSpecificScripts() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        switch(currentPage) {
            case 'index.html':
                this.initializeHomePage();
                break;
            case 'shop.html':
                this.initializeShopPage();
                break;
            case 'cart.html':
                this.initializeCartPage();
                break;
            case 'checkout.html':
                this.initializeCheckoutPage();
                break;
            case 'profile.html':
                this.initializeProfilePage();
                break;
            case 'admin.html':
                this.initializeAdminPage();
                break;
            case 'collections.html':
                this.initializeCollectionsPage();
                break;
            case 'login.html':
                this.initializeLoginPage();
                break;
            case 'admin-login.html':
                this.initializeAdminLoginPage();
                break;
            case 'contact.html':
                this.initializeContactPage();
                break;
        }
    }
    
    static initializeContactPage() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('contactName')?.value.trim();
            const email = document.getElementById('contactEmail')?.value.trim();
            const subject = document.getElementById('contactSubject')?.value.trim();
            const message = document.getElementById('contactMessage')?.value.trim();

            if (!name || !email || !subject || !message) {
                UIComponents.showToast('Please complete all fields before sending.', 'error');
                return;
            }

            UIComponents.showToast('Thanks! Your message has been sent to the ROUGE VÈRA team.');
            form.reset();
        });
    }
    
    static initializeHomePage() {
        this.initializeFragranceQuiz();

        // Load featured products
        const featuredContainer = document.getElementById('featuredProducts');
        if (featuredContainer) {
            const featuredProducts = PRODUCTS.filter(p => p.featured);
            featuredContainer.innerHTML = featuredProducts.map(UIComponents.createProductCard).join('');
            
            featuredContainer.addEventListener('click', event => {
                const button = event.target.closest('.size-btn');
                if (!button || !featuredContainer.contains(button)) return;

                const productCard = button.closest('.product-card');
                productCard.querySelectorAll('.size-btn').forEach(sizeButton => sizeButton.classList.remove('active'));
                button.classList.add('active');

                const price = parseFloat(button.dataset.price);
                const originalPrice = parseFloat(button.dataset.original);
                const priceDisplay = productCard.querySelector('.selected-size-price');
                const originalDisplay = productCard.querySelector('.selected-size-original');
                const discountDisplay = productCard.querySelector('.size-discount');
                const sizeLabel = productCard.querySelector('.size-label');
                const savingsBadge = productCard.querySelector('.savings-badge');

                if (priceDisplay) priceDisplay.textContent = CurrencySystem.formatPHP(price);
                if (originalDisplay) originalDisplay.textContent = CurrencySystem.formatPHP(originalPrice);
                if (discountDisplay) discountDisplay.textContent = `${button.dataset.discount}% OFF`;
                if (sizeLabel) sizeLabel.textContent = `for ${button.dataset.size}`;
                if (savingsBadge) savingsBadge.textContent = `Save ${CurrencySystem.formatPHP(originalPrice - price)}`;
            });
        }
        
        // Newsletter form
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                if (email) {
                    UIComponents.showToast('Thank you for subscribing to Prestige Circle!');
                    newsletterForm.reset();
                }
            });
        }
        
        // Update banner to show new pricing
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = 'Feel the Breeze, Live the Prestige';
        }

        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                const query = event.target.value.trim().toLowerCase();
                const matchingProducts = query ? PRODUCTS.filter(product =>
                    product.stock > 0 && !/comm?ing soon/i.test(product.name) && (
                        product.name.toLowerCase().includes(query) ||
                        product.description.toLowerCase().includes(query) ||
                        product.category.toLowerCase().includes(query)
                    )
                ).slice(0, 8) : PRODUCTS.filter(product => product.featured).slice(0, 6);
                const featuredContainer = document.getElementById('featuredProducts');
                if (featuredContainer) {
                    featuredContainer.innerHTML = matchingProducts.length
                        ? matchingProducts.map(UIComponents.createProductCard).join('')
                        : '<div class="home-search-empty" role="status"><i class="fas fa-magnifying-glass" aria-hidden="true"></i><strong>No fragrances found</strong><span>Try another scent note, or browse the full collection.</span><a class="btn btn-outline-gold" href="shop.html">Browse all perfumes</a></div>';
                }
            });
        }
    }

    static initializeFragranceQuiz() {
        const form = document.getElementById('fragranceQuizForm');
        const questionElement = document.getElementById('quizQuestion');
        const nextButton = document.getElementById('quizNext');
        const backButton = document.getElementById('quizBack');
        const progressLabel = document.getElementById('quizProgressLabel');
        const progressBar = document.getElementById('quizProgressBar');
        const resultsElement = document.getElementById('quizResults');
        if (!form || !questionElement || !nextButton || !backButton || !resultsElement) return;

        const questions = [
            {
                title: 'Which scent family draws you in?',
                options: [
                    { label: 'Fresh & luminous', detail: 'Citrus, green notes, and cool air', keywords: ['citrus', 'bergamot', 'mandarin', 'neroli', 'green tea', 'bamboo', 'water', 'sea', 'marine', 'aquatic', 'juniper'] },
                    { label: 'Floral & romantic', detail: 'Petals, soft florals, and elegant bouquets', keywords: ['rose', 'roses', 'jasmine', 'tuberose', 'floral', 'lychee', 'iris'] },
                    { label: 'Warm & sensual', detail: 'Amber, vanilla, spice, and a soft glow', keywords: ['amber', 'vanilla', 'saffron', 'spice', 'tonka', 'cocoa', 'plum', 'suede'] },
                    { label: 'Woods & depth', detail: 'Cedar, sandalwood, oud, and vetiver', keywords: ['cedar', 'sandalwood', 'oud', 'vetiver', 'wood', 'leather', 'patchouli', 'incense', 'musk'] }
                ]
            },
            {
                title: 'When do you want to wear it?',
                options: [
                    { label: 'Everyday moments', detail: 'Easy, polished, and close to the skin', keywords: ['clean', 'fresh', 'soft', 'citrus', 'green', 'water', 'mineral', 'musk'] },
                    { label: 'Evenings out', detail: 'A little more warmth and presence', keywords: ['amber', 'oud', 'incense', 'leather', 'suede', 'tuberose', 'spice', 'plum', 'cocoa', 'tonka'] },
                    { label: 'A signature, anytime', detail: 'Distinctive notes you will come back to', keywords: ['cedar', 'vetiver', 'musk', 'rose', 'jasmine', 'saffron', 'sandalwood', 'bergamot'] }
                ]
            },
            {
                title: 'How should it feel in the air?',
                options: [
                    { label: 'Light & refreshing', detail: 'A bright, breezy impression', keywords: ['citrus', 'bergamot', 'mandarin', 'green tea', 'bamboo', 'water', 'sea', 'marine', 'mineral', 'fresh'] },
                    { label: 'Soft & graceful', detail: 'An intimate, elegant trail', keywords: ['musk', 'iris', 'cashmere', 'rose', 'jasmine', 'vanilla', 'soft', 'velvety'] },
                    { label: 'Rich & memorable', detail: 'A confident scent that lingers', keywords: ['oud', 'amber', 'leather', 'saffron', 'incense', 'tuberose', 'tonka', 'cocoa', 'sandalwood'] }
                ]
            }
        ];
        const answers = Array(questions.length).fill(null);
        let currentStep = 0;

        const renderQuestion = () => {
            const question = questions[currentStep];
            questionElement.innerHTML = `
                <legend>${question.title}</legend>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <label class="quiz-option">
                            <input type="radio" name="quizAnswer" value="${index}" ${answers[currentStep] === index ? 'checked' : ''}>
                            <span class="quiz-option-copy"><strong>${option.label}</strong><small>${option.detail}</small></span>
                            <i class="fas fa-check" aria-hidden="true"></i>
                        </label>
                    `).join('')}
                </div>
            `;
            questionElement.classList.remove('quiz-enter');
            void questionElement.offsetWidth;
            questionElement.classList.add('quiz-enter');
            progressLabel.textContent = `${String(currentStep + 1).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
            progressBar.style.width = `${((currentStep + 1) / questions.length) * 100}%`;
            backButton.hidden = currentStep === 0;
            nextButton.disabled = answers[currentStep] === null;
            nextButton.innerHTML = currentStep === questions.length - 1
                ? 'See my matches <i class="fas fa-arrow-right"></i>'
                : 'Continue <i class="fas fa-arrow-right"></i>';
        };

        const showResults = () => {
            const selectedOptions = answers.map((answer, index) => questions[index].options[answer]);
            const matches = PRODUCTS
                .filter(product => product.stock > 0 && !/comm?ing soon/i.test(product.name))
                .map(product => {
                    const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
                    const score = selectedOptions.reduce((total, option) => total + option.keywords.reduce(
                        (optionScore, keyword) => optionScore + (searchableText.includes(keyword) ? 1 : 0), 0
                    ), 0);
                    return { product, score };
                })
                .sort((a, b) => b.score - a.score || Number(b.product.featured) - Number(a.product.featured))
                .slice(0, 3);

            form.hidden = true;
            resultsElement.hidden = false;
            resultsElement.innerHTML = `
                <div class="quiz-result-heading">
                    <p class="finder-eyebrow">Your scent shortlist</p>
                    <h3>A few notes we think you’ll love.</h3>
                </div>
                <div class="quiz-match-list">
                    ${matches.map(({ product }, index) => `
                        <article class="quiz-match">
                            <span class="quiz-match-number">0${index + 1}</span>
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                            <div class="quiz-match-copy">
                                <p>${product.category} collection</p>
                                <h4>${product.name}</h4>
                                <span>${product.description}</span>
                            </div>
                            <a class="btn btn-outline-gold" href="shop.html?collection=${encodeURIComponent(product.category)}">Explore <i class="fas fa-arrow-right"></i></a>
                        </article>
                    `).join('')}
                </div>
                <button class="quiz-retake" type="button"><i class="fas fa-rotate-left"></i> Retake the quiz</button>
            `;
            resultsElement.querySelector('.quiz-retake').addEventListener('click', () => {
                answers.fill(null);
                currentStep = 0;
                resultsElement.hidden = true;
                form.hidden = false;
                renderQuestion();
            });
        };

        questionElement.addEventListener('change', event => {
            if (event.target.matches('input[name="quizAnswer"]')) {
                answers[currentStep] = Number(event.target.value);
                nextButton.disabled = false;
            }
        });
        nextButton.addEventListener('click', () => {
            if (answers[currentStep] === null) return;
            if (currentStep < questions.length - 1) {
                currentStep += 1;
                renderQuestion();
            } else {
                showResults();
            }
        });
        backButton.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep -= 1;
                renderQuestion();
            }
        });
        form.addEventListener('submit', event => event.preventDefault());
        renderQuestion();
    }
    
    static initializeShopPage() {
        const productsContainer = document.getElementById('productsContainer');
        if (!productsContainer) return;
        
        // Get collection from URL
        const urlParams = new URLSearchParams(window.location.search);
        const collection = urlParams.get('collection');
        
        // Filter products
        let filteredProducts = PRODUCTS;
        if (collection) {
            filteredProducts = PRODUCTS.filter(p => p.category === collection);
        }
        
        // Render products in three-page groups of six.
        let currentPage = 1;
        const productsPerPage = 6;
        let currentProducts = filteredProducts;
        const pagination = document.querySelector('.pagination');
        const sortSelect = document.getElementById('sortSelect');
        const searchInput = document.getElementById('shopSearch');
        const applySearchAndSort = (products) => {
            const query = (searchInput?.value || '').trim().toLowerCase();
            let result = products.filter(product => {
                if (!query) return true;
                return product.name.toLowerCase().includes(query)
                    || product.description.toLowerCase().includes(query)
                    || product.category.toLowerCase().includes(query);
            });

            if (sortSelect) {
                const sortValue = sortSelect.value;
                result = [...result];
                if (sortValue === 'price-asc') {
                    result.sort((a, b) => Math.min(...a.sizes.map(s => s.price)) - Math.min(...b.sizes.map(s => s.price)));
                } else if (sortValue === 'price-desc') {
                    result.sort((a, b) => Math.max(...b.sizes.map(s => s.price)) - Math.max(...a.sizes.map(s => s.price)));
                } else if (sortValue === 'name-asc') {
                    result.sort((a, b) => a.name.localeCompare(b.name));
                } else if (sortValue === 'featured') {
                    result.sort((a, b) => Number(b.featured) - Number(a.featured));
                }
            }
            return result;
        };
        const updatePagination = (totalProducts) => {
            if (!pagination) return;
            const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));
            currentPage = Math.min(currentPage, totalPages);
            pagination.innerHTML = `
                <button class="page-btn" data-page="prev" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
                ${Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return `<button class="page-btn ${page === currentPage ? 'active' : ''}" data-page="${page}" aria-label="Page ${page}" aria-current="${page === currentPage ? 'page' : 'false'}">${page}</button>`;
                }).join('')}
                <button class="page-btn" data-page="next" aria-label="Next page" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
            pagination.querySelectorAll('.page-btn:not([disabled])').forEach(button => {
                button.addEventListener('click', () => {
                    const requestedPage = button.dataset.page;
                    if (requestedPage === 'prev') currentPage -= 1;
                    else if (requestedPage === 'next') currentPage += 1;
                    else currentPage = Number(requestedPage);
                    renderProducts(currentProducts);
                    productsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });
        };

        const renderProducts = (products) => {
            currentProducts = products;
            const start = (currentPage - 1) * productsPerPage;
            const visibleProducts = products.slice(start, start + productsPerPage);
            productsContainer.innerHTML = visibleProducts.map(UIComponents.createProductCard).join('');
            
            // Update product count
            const productCount = document.getElementById('productCount');
            if (productCount) {
                const minPrice = Math.min(...products.flatMap(p => p.sizes.map(s => s.price)));
                const maxPrice = Math.max(...products.flatMap(p => p.sizes.map(s => s.price)));
                productCount.textContent = `${products.length} Products (₱${minPrice} - ₱${maxPrice}) · Page ${currentPage}`;
            }

            updatePagination(products.length);
            
            // Add size selection event listeners
            const sizeButtons = productsContainer.querySelectorAll('.size-btn');
            sizeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons in this product card
                    const productCard = this.closest('.product-card');
                    const allSizeButtons = productCard.querySelectorAll('.size-btn');
                    allSizeButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Update price display
                    const price = parseFloat(this.dataset.price);
                    const originalPrice = parseFloat(this.dataset.original);
                    const discount = this.dataset.discount;
                    const size = this.dataset.size;
                    
                    const priceDisplay = productCard.querySelector('.selected-size-price');
                    const originalDisplay = productCard.querySelector('.selected-size-original');
                    const discountDisplay = productCard.querySelector('.size-discount');
                    const sizeLabel = productCard.querySelector('.size-label');
                    const savingsBadge = productCard.querySelector('.savings-badge');
                    
                    if (priceDisplay) priceDisplay.textContent = CurrencySystem.formatPHP(price);
                    if (originalDisplay) originalDisplay.textContent = CurrencySystem.formatPHP(originalPrice);
                    if (discountDisplay) discountDisplay.textContent = `${discount}% OFF`;
                    if (sizeLabel) sizeLabel.textContent = `for ${size}`;
                    if (savingsBadge) {
                        savingsBadge.textContent = `Save ${CurrencySystem.formatPHP(originalPrice - price)}`;
                    }
                });
            });
        };
        
        renderProducts(applySearchAndSort(filteredProducts));
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentPage = 1;
                renderProducts(applySearchAndSort(filteredProducts));
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentPage = 1;
                renderProducts(applySearchAndSort(filteredProducts));
            });
        }
        
        // Update shop header
        const shopHeader = document.querySelector('.shop-header-content p.text-muted');
        if (shopHeader) {
            shopHeader.textContent = 'Premium fragrances starting from ₱99 for 10ml to ₱400 for 50ml!';
        }
        
        // Filter functionality
        const filterItems = document.querySelectorAll('.filter-item');
        filterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                filterItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                const category = item.dataset.category;
                filteredProducts = category === 'all' 
                    ? PRODUCTS 
                    : PRODUCTS.filter(p => p.category === category);
                currentPage = 1;
                renderProducts(filteredProducts);
            });
        });
        
        // Price filter - 50ml fragrances are priced between ₱350 and ₱400
        const priceSlider = document.getElementById('priceRange');
        const currentPrice = document.getElementById('currentPrice');
        if (priceSlider && currentPrice) {
            priceSlider.min = 99;
            priceSlider.max = 400;
            priceSlider.value = 400;
            currentPrice.textContent = `Up to ${CurrencySystem.formatPHP(400)}`;
            
            priceSlider.addEventListener('input', function() {
                const maxPrice = parseInt(this.value);
                currentPrice.textContent = `Up to ${CurrencySystem.formatPHP(maxPrice)}`;
                
                // Filter by price (check if any size is within price range)
                const filtered = filteredProducts.filter(p => 
                    p.sizes.some(size => size.price <= maxPrice)
                );
                filteredProducts = filtered;
                currentPage = 1;
                renderProducts(applySearchAndSort(filtered));
            });
        }
        
        // Apply filters button
        const applyFiltersBtn = document.querySelector('.btn-gold.btn-block');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                UIComponents.showToast('Filters applied!');
            });
        }

        if (!document.getElementById('sortSelect')) {
            const toolbar = document.querySelector('.shop-toolbar');
            if (toolbar) {
                toolbar.insertAdjacentHTML('beforeend', `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <label for="sortSelect" style="color: #FFD700; font-size: 0.85rem;">Sort:</label>
                        <select id="sortSelect" style="padding: 10px 12px; border-radius: 6px; background: #0a0a0a; color: #fff; border: 1px solid rgba(255,215,0,0.3);">
                            <option value="featured">Featured</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A to Z</option>
                        </select>
                    </div>
                `);
            }
        }
    }
    
    static initializeCartPage() {
        const cartManager = new CartManager();
        const cartContainer = document.getElementById('cartItemsContainer');
        const emptyMsg = document.getElementById('emptyCartMessage');
        
        const updateCartDisplay = () => {
            if (cartManager.cart.length === 0) {
                if (cartContainer) cartContainer.innerHTML = '';
                if (emptyMsg) emptyMsg.style.display = 'block';
            } else {
                if (emptyMsg) emptyMsg.style.display = 'none';
                if (cartContainer) {
                    cartContainer.innerHTML = cartManager.cart.map(UIComponents.createCartItem).join('');
                }
            }
            
            // Update summary
            const totals = cartManager.getTotalAmount();
            const promoCodeEl = document.getElementById('promoCode');
            if (promoCodeEl) {
                promoCodeEl.value = StorageManager.getPromoCode();
            }
            
            const subtotalEl = document.getElementById('cartSubtotal');
            const shippingEl = document.getElementById('cartShipping');
            const taxEl = document.getElementById('cartTax');
            const totalEl = document.getElementById('cartTotal');
            const discountEl = document.getElementById('cartDiscount');
            
            if (subtotalEl) subtotalEl.textContent = CurrencySystem.formatPHP(totals.subtotal);
            if (shippingEl) shippingEl.textContent = CurrencySystem.formatPHP(totals.shipping);
            if (taxEl) taxEl.textContent = CurrencySystem.formatPHP(totals.tax);
            if (discountEl) discountEl.textContent = CurrencySystem.formatPHP(totals.discountAmount);
            if (totalEl) totalEl.textContent = CurrencySystem.formatPHP(totals.total);
        };
        
        // Initialize cart display
        updateCartDisplay();
        
        // Clear cart function
        window.clearCart = () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                cartManager.clear();
                updateCartDisplay();
                UIComponents.showToast('Cart cleared');
            }
        };
        
        // Promo code and voucher handling
        window.applyPromoCode = () => {
            const codeInput = document.getElementById('promoCode');
            if (!codeInput) return;

            const code = String(codeInput.value).trim().toUpperCase();
            const validCode = Object.keys(CONFIG.PROMO_CODES).find(key => key === code);

            if (!code) {
                UIComponents.showToast('Enter a promo code to continue.', 'error');
                return;
            }

            if (validCode) {
                StorageManager.savePromoCode(validCode);
                updateCartDisplay();
                UIComponents.showToast(`Promo code applied: ${validCode} (${(CONFIG.PROMO_CODES[validCode] * 100).toFixed(0)}% OFF)`);
            } else {
                StorageManager.savePromoCode('');
                updateCartDisplay();
                UIComponents.showToast('Invalid promo code', 'error');
            }
        };

        const promoList = document.getElementById('promoList');
        if (promoList) {
            promoList.innerHTML = Object.entries(CONFIG.PROMO_CODES)
                .map(([code, rate]) => `<li><strong>${code}</strong> - ${(rate * 100).toFixed(0)}% OFF</li>`)
                .join('');
        }
    }
    
    static initializeCheckoutPage() {
        const cartManager = new CartManager();
        
        const loadCheckoutItems = () => {
            const container = document.getElementById('checkoutItems');
            if (!container) return;
            
            if (cartManager.cart.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">Your cart is empty</p>';
                return;
            }
            
            let html = '';
            cartManager.cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                html += `
                    <div class="checkout-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div>${item.name} ${item.selectedSize ? `(${item.selectedSize})` : ''}</div>
                            <div>Qty: ${item.quantity}</div>
                        </div>
                        <div>${CurrencySystem.formatPHP(itemTotal)}</div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
            
            // Update totals
            const totals = cartManager.getTotalAmount();
            
            const subtotalEl = document.getElementById('checkoutSubtotal');
            const shippingEl = document.getElementById('checkoutShipping');
            const taxEl = document.getElementById('checkoutTax');
            const totalEl = document.getElementById('checkoutTotal');
            
            if (subtotalEl) subtotalEl.textContent = CurrencySystem.formatPHP(totals.subtotal);
            if (shippingEl) shippingEl.textContent = CurrencySystem.formatPHP(totals.shipping);
            if (taxEl) taxEl.textContent = CurrencySystem.formatPHP(totals.tax);
            if (totalEl) totalEl.textContent = CurrencySystem.formatPHP(totals.total);
        };
        
        // Initialize checkout items
        loadCheckoutItems();

        const paymentMethod = document.getElementById('paymentMethod');
        const paymentReference = document.getElementById('paymentReference');
        const paymentReferenceGroup = document.getElementById('paymentReferenceGroup');
        const paymentVerificationNote = document.getElementById('paymentVerificationNote');
        const paymentLabels = { cod: 'Cash on delivery', gcash: 'GCash', maya: 'Maya', bank: 'Bank transfer' };
        const updatePaymentInstructions = () => {
            const isPrepaid = ['gcash', 'maya', 'bank'].includes(paymentMethod?.value);
            if (paymentReferenceGroup) paymentReferenceGroup.style.display = isPrepaid ? 'block' : 'none';
            if (paymentReference) {
                paymentReference.required = isPrepaid;
                if (!isPrepaid) paymentReference.value = '';
            }
            if (!paymentVerificationNote) return;
            if (paymentMethod?.value === 'cod') {
                paymentVerificationNote.textContent = 'Pay cash when your order is delivered. No transfer reference is needed.';
            } else if (isPrepaid) {
                paymentVerificationNote.textContent = `Contact contact@rougevera.com for current ${paymentLabels[paymentMethod.value]} payment instructions. Enter the transaction reference after payment; staff will verify it before fulfillment. Never share your PIN or one-time password.`;
            } else if (paymentMethod?.value === 'card') {
                paymentVerificationNote.textContent = 'Online card payments are not available yet. Choose another payment method.';
            } else {
                paymentVerificationNote.textContent = 'Choose a payment method to see its payment and verification instructions.';
            }
        };
        paymentMethod?.addEventListener('change', updatePaymentInstructions);
        updatePaymentInstructions();

        const promoInput = document.getElementById('promoCode');
        if (promoInput) {
            promoInput.value = StorageManager.getPromoCode();
        }
        
        // Form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (cartManager.cart.length === 0) {
                    UIComponents.showToast('Your cart is empty!', 'error');
                    return;
                }

                const selectedPaymentMethod = paymentMethod?.value || '';
                const prepaidMethod = ['gcash', 'maya', 'bank'].includes(selectedPaymentMethod);
                const transactionReference = String(paymentReference?.value || '').trim();
                if (!paymentLabels[selectedPaymentMethod]) {
                    UIComponents.showToast('Choose an available payment method.', 'error');
                    return;
                }
                if (prepaidMethod && transactionReference.length < 4) {
                    UIComponents.showToast('Enter a valid payment transaction reference.', 'error');
                    paymentReference?.focus();
                    return;
                }

                const requestedStock = cartManager.cart.reduce((quantities, item) => {
                    quantities[item.id] = (quantities[item.id] || 0) + item.quantity;
                    return quantities;
                }, {});
                const unavailableProduct = Object.entries(requestedStock).find(([productId, quantity]) => {
                    const product = PRODUCTS.find(item => item.id === productId);
                    return !product || product.stock < quantity;
                });
                if (unavailableProduct) {
                    const product = PRODUCTS.find(item => item.id === unavailableProduct[0]);
                    UIComponents.showToast(`${product?.name || 'An item'} no longer has enough stock. Please update your cart.`, 'error');
                    return;
                }

                Object.entries(requestedStock).forEach(([productId, quantity]) => {
                    const product = PRODUCTS.find(item => item.id === productId);
                    product.stock -= quantity;
                });
                StorageManager.saveInventory(PRODUCTS);

                const totals = cartManager.getTotalAmount();
                const getFieldValue = selector => checkoutForm.querySelector(selector)?.value || '';
                const signedInUser = StorageManager.getUser();
                const orders = StorageManager.getOrders();
                orders.unshift({
                    id: `RV-${Date.now().toString().slice(-8)}`,
                    customer: {
                        name: `${getFieldValue('#checkoutFirstName')} ${getFieldValue('#checkoutLastName')}`.trim() || signedInUser?.name || 'Guest customer',
                        email: getFieldValue('#checkoutEmail') || signedInUser?.email || 'Not provided',
                        phone: getFieldValue('#checkoutPhone') || 'Not provided'
                    },
                    address: {
                        line: getFieldValue('#checkoutAddress'),
                        city: getFieldValue('#checkoutCity'),
                        postal: getFieldValue('#checkoutPostal'),
                        country: getFieldValue('#checkoutCountry')
                    },
                    items: cartManager.cart.map(item => ({
                        productId: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.selectedSize || ''
                    })),
                    subtotal: totals.subtotal,
                    tax: totals.tax,
                    shipping: totals.shipping,
                    total: totals.total,
                    payment: {
                        method: selectedPaymentMethod,
                        reference: prepaidMethod ? transactionReference : '',
                        status: prepaidMethod ? 'Pending verification' : 'Pay on delivery',
                        verifiedAt: null
                    },
                    status: 'Pending',
                    createdAt: new Date().toISOString()
                });
                StorageManager.saveOrders(orders);
                
                // Process order
                UIComponents.showToast('Order placed successfully!');
                window.checkoutHandled = true;
                cartManager.clear();
                
                // Redirect to profile
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            });
        }
    }
    
    static initializeAdminPage() {
        const user = StorageManager.getUser();
        if (!user || !user.isLoggedIn || !user.isAdmin) {
            UIComponents.showToast('Admin access required. Please use the admin login.', 'error');
            setTimeout(() => window.location.href = 'admin-login.html', 1500);
            return;
        }
        
        // Initialize admin functionality
        this.initializeAdminForms();
        this.initializeAdminTabs();
        const orderCount = document.querySelector('.order-count');
        if (orderCount) orderCount.textContent = StorageManager.getOrders().length;
    }
    
    static initializeAdminForms() {
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(addProductForm);
                const price10ml = parseFloat(formData.get('price10ml'));
                const price30ml = parseFloat(formData.get('price30ml'));
                const price50ml = parseFloat(formData.get('price50ml'));
                
                const newProduct = {
                    id: Date.now().toString(),
                    name: formData.get('name'),
                    category: formData.get('category'),
                    description: formData.get('description'),
                    image: formData.get('image') || 'https://images.unsplash.com/photo-1541643600914-78b084683601',
                    featured: formData.get('featured') === 'on',
                    bestSeller: formData.get('bestSeller') === 'on',
                    badge: 'NEW',
                    stock: parseInt(formData.get('stock'), 10) || 0,
                    sizes: [
                        {
                            size: '10ml',
                            price: price10ml,
                            originalPrice: price10ml * 1.5,
                            discountPercentage: Math.round(((price10ml * 1.5 - price10ml) / (price10ml * 1.5)) * 100)
                        },
                        {
                            size: '30ml',
                            price: price30ml,
                            originalPrice: price30ml * 1.5,
                            discountPercentage: Math.round(((price30ml * 1.5 - price30ml) / (price30ml * 1.5)) * 100)
                        },
                        {
                            size: '50ml',
                            price: price50ml,
                            originalPrice: price50ml * 1.1,
                            discountPercentage: Math.round(((price50ml * 1.1 - price50ml) / (price50ml * 1.1)) * 100)
                        }
                    ]
                };
                
                PRODUCTS.push(newProduct);
                StorageManager.saveProductCatalog(PRODUCTS);
                StorageManager.saveInventory(PRODUCTS);
                UIComponents.showToast(`${newProduct.name} added successfully!`);
                addProductForm.reset();
            });
        }
    }
    
    static initializeAdminTabs() {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const isManage = tab.textContent.includes('Manage');
                if (isManage) {
                    this.showManageProducts();
                } else {
                    this.showAddProduct();
                }
            });
        });
    }
    
    static showManageProducts() {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;
        
        const manageHTML = `
            <div class="manage-products">
                <h2>Product Inventory</h2>
                <p class="text-muted">${PRODUCTS.length} Products (All with 10ml, 30ml, 50ml sizes)</p>
                <div class="products-list">
                    ${PRODUCTS.map((product, index) => `
                        <div class="manage-product-item">
                            <img src="${product.image}" alt="${product.name}">
                            <div>
                                <h4>${product.name}</h4>
                                <p class="product-category">${product.category}</p>
                                <p class="product-description">${product.description.substring(0, 60)}...</p>
                                <p class="product-stock">Stock: ${product.stock}</p>
                                <div style="display: flex; gap: 10px; margin-top: 10px;">
                                    ${product.sizes.map(size => `
                                        <div style="background: rgba(255, 215, 0, 0.1); padding: 5px 10px; border-radius: 4px; font-size: 0.8rem;">
                                            <div>${size.size}</div>
                                            <div style="font-weight: bold;">${CurrencySystem.formatPHP(size.price)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="product-pricing">
                                <div class="current-price">${CurrencySystem.formatPHP(product.sizes[0].price)}</div>
                                <div class="original-price">${CurrencySystem.formatPHP(product.sizes[0].originalPrice)}</div>
                                <div class="discount-badge">${product.sizes[0].discountPercentage}% OFF</div>
                            </div>
                            <div class="product-actions">
                                <button class="btn btn-outline-gold" onclick="editProduct(${index})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-black" onclick="deleteProduct(${index})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const existingForm = mainContent.querySelector('.product-form');
        if (existingForm) existingForm.style.display = 'none';
        
        const manageContainer = document.getElementById('manageProductsContainer');
        if (manageContainer) {
            manageContainer.innerHTML = manageHTML;
        } else {
            const newContainer = document.createElement('div');
            newContainer.id = 'manageProductsContainer';
            newContainer.innerHTML = manageHTML;
            mainContent.appendChild(newContainer);
        }
    }
    
    static showAddProduct() {
        const mainContent = document.querySelector('main');
        const productForm = mainContent?.querySelector('.product-form');
        const manageContainer = document.getElementById('manageProductsContainer');
        
        if (productForm) productForm.style.display = 'block';
        if (manageContainer) manageContainer.style.display = 'none';
    }

    static showAdminOrders() {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;

        const orders = StorageManager.getOrders();
        const renderOrders = (query = '') => {
            const normalizedQuery = query.trim().toLowerCase();
            const filteredOrders = orders.filter(order => {
                const customer = order.customer || {};
                return !normalizedQuery || [order.id, customer.name, customer.email, order.status, order.payment?.method, order.payment?.reference, order.payment?.status]
                    .some(value => String(value || '').toLowerCase().includes(normalizedQuery));
            });
            const ordersContainer = document.getElementById('adminOrdersList');
            if (!ordersContainer) return;

            if (!filteredOrders.length) {
                ordersContainer.innerHTML = `
                    <div style="padding: 50px 20px; text-align: center; background: #1a1a1a; border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px;">
                        <i class="fas fa-receipt fa-3x text-gold" style="margin-bottom: 20px;"></i>
                        <h3 style="color: #FFD700; margin-bottom: 10px;">No orders found</h3>
                        <p style="color: #888;">Completed customer orders will appear here.</p>
                    </div>`;
                return;
            }

            ordersContainer.innerHTML = filteredOrders.map(order => {
                const customer = order.customer || {};
                const address = order.address || {};
                const items = order.items || [];
                const statusColor = order.status === 'Delivered' ? '#9acd32' : order.status === 'Shipped' ? '#58a6ff' : '#FFD700';
                return `
                    <article class="admin-order-card" style="background: #1a1a1a; border: 1px solid rgba(255, 215, 0, 0.2); border-radius: 10px; padding: 22px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; flex-wrap: wrap; margin-bottom: 18px;">
                            <div>
                                <h3 style="color: #FFD700; margin-bottom: 6px;">${order.id}</h3>
                                <p style="color: #888; margin: 0;">${new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <select class="admin-order-status" data-order-id="${order.id}" style="min-width: 145px; color: ${statusColor}; border-color: ${statusColor};">
                                ${['Pending', 'Processing', 'Shipped', 'Delivered'].map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
                            </select>
                        </div>
                        <div class="admin-order-details" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px;">
                            <div><small style="color: #888;">Customer</small><p style="color: #fff; margin: 5px 0;">${customer.name || 'Guest customer'}<br><span style="color: #aaa;">${customer.email || 'No email'}</span></p></div>
                            <div><small style="color: #888;">Items</small><p style="color: #fff; margin: 5px 0;">${items.map(item => `${item.name} x${item.quantity}`).join('<br>') || 'No items'}</p></div>
                            <div><small style="color: #888;">Delivery</small><p style="color: #fff; margin: 5px 0;">${address.line || 'Address unavailable'}<br><span style="color: #aaa;">${address.city || ''} ${address.postal || ''}</span></p></div>
                        </div>
                        ${order.payment ? `<div class="admin-payment-verification"><div><small>Payment</small><p>${({ cod: 'Cash on delivery', gcash: 'GCash', maya: 'Maya', bank: 'Bank transfer' })[order.payment.method] || 'Payment'} · ${order.payment.status}</p>${order.payment.reference ? `<small>Transaction reference: <strong>${ProductReviewSystem.escapeHTML(order.payment.reference)}</strong></small>` : ''}${order.payment.verifiedAt ? `<small>Verified ${new Date(order.payment.verifiedAt).toLocaleString()}${order.payment.verifiedBy ? ` by ${ProductReviewSystem.escapeHTML(order.payment.verifiedBy)}` : ''}</small>` : ''}</div>${order.payment.status === 'Pending verification' && order.payment.reference ? `<button type="button" class="btn btn-outline-gold btn-sm admin-payment-verify" data-order-id="${ProductReviewSystem.escapeHTML(order.id)}"><i class="fas fa-circle-check" aria-hidden="true"></i> Mark verified</button>` : ''}</div>` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; border-top: 1px solid rgba(255, 215, 0, 0.12); padding-top: 15px; margin-top: 15px;">
                            <span style="color: #888;">${items.length} line item${items.length === 1 ? '' : 's'}</span>
                            <strong style="color: #FFD700; font-size: 1.1rem;">${CurrencySystem.formatPHP(Number(order.total) || 0)}</strong>
                        </div>
                    </article>`;
            }).join('');

            ordersContainer.querySelectorAll('.admin-order-status').forEach(select => {
                select.addEventListener('change', () => {
                    const order = orders.find(item => item.id === select.dataset.orderId);
                    if (!order) return;
                    if (order.payment?.status === 'Pending verification' && select.value !== 'Pending') {
                        select.value = order.status;
                        UIComponents.showToast('Verify this payment before advancing fulfillment.', 'error');
                        return;
                    }
                    order.status = select.value;
                    StorageManager.saveOrders(orders);
                    UIComponents.showToast(`Order ${order.id} updated to ${order.status}.`);
                    renderOrders(document.getElementById('adminOrderSearch')?.value || '');
                });
            });
            ordersContainer.querySelectorAll('.admin-payment-verify').forEach(button => {
                button.addEventListener('click', () => {
                    const order = orders.find(item => item.id === button.dataset.orderId);
                    if (!order?.payment || order.payment.status !== 'Pending verification' || !order.payment.reference) return;
                    const user = StorageManager.getUser();
                    order.payment.status = 'Verified';
                    order.payment.verifiedAt = new Date().toISOString();
                    order.payment.verifiedBy = user?.email || 'Admin';
                    StorageManager.saveOrders(orders);
                    UIComponents.showToast(`Payment for order ${order.id} marked verified.`);
                    renderOrders(document.getElementById('adminOrderSearch')?.value || '');
                });
            });
        };

        mainContent.innerHTML = `
            <div class="admin-orders-view">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: 25px;">
                    <div><h2 style="color: #FFD700; margin-bottom: 6px;">All Orders</h2><p style="color: #888; margin: 0;">Review customer purchases and update fulfillment status.</p></div>
                    <strong style="color: #FFD700;">${orders.length} total</strong>
                </div>
                <input id="adminOrderSearch" type="search" placeholder="Search by order number, customer, email, or status..." style="width: 100%; margin-bottom: 20px;">
                <div id="adminOrdersList"></div>
            </div>`;

        document.getElementById('adminOrderSearch')?.addEventListener('input', event => renderOrders(event.target.value));
        renderOrders();
        document.querySelectorAll('.admin-menu-item').forEach(item => item.classList.remove('active'));
        document.querySelector('.admin-orders-link')?.classList.add('active');
    }
    
    static initializeCollectionsPage() {
        // Update collections page text
        const collectionsSubtitle = document.querySelector('.shop-header-content p.text-muted');
        if (collectionsSubtitle) {
            collectionsSubtitle.textContent = 'Premium collections, all fragrances starting from ₱99!';
        }
    }
    
    static initializeProfilePage() {
        // Initialize profile controller
        ProfileController.init();
        
        // Also update cart count
        const cartManager = new CartManager();
        const updateCartCount = () => {
            const cartCountElements = document.querySelectorAll('.cart-count');
            const totalItems = cartManager.getTotalItems();
            
            cartCountElements.forEach(element => {
                element.textContent = totalItems;
            });
        };
        updateCartCount();
    }
    
    static initializeLoginPage() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleLink = document.getElementById('toggleLoginLink');
        const toggleText = document.getElementById('toggleLoginText');
        
        let showingLogin = true;
        
        if (toggleLink) {
            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (showingLogin) {
                    if (loginForm) loginForm.style.display = 'none';
                    if (registerForm) registerForm.style.display = 'block';
                    toggleLink.textContent = 'Sign In';
                    toggleText.textContent = 'Already have an account?';
                } else {
                    if (registerForm) registerForm.style.display = 'none';
                    if (loginForm) loginForm.style.display = 'block';
                    toggleLink.textContent = 'Sign Up';
                    toggleText.textContent = 'Don\'t have an account?';
                }
                
                showingLogin = !showingLogin;
            });
        }
        
        // Login form
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('loginEmail')?.value;
                const password = document.getElementById('loginPassword')?.value;
                
                if (email && password) {
                    const user = {
                        name: email.split('@')[0],
                        email: email,
                        isLoggedIn: true,
                        isAdmin: false,
                        memberSince: new Date().toISOString()
                    };
                    
                    StorageManager.saveUser(user);
                    UIComponents.showToast('Login successful!');
                    
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1500);
                }
            });
        }
        
        // Register form
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.getElementById('registerName')?.value;
                const email = document.getElementById('registerEmail')?.value;
                const password = document.getElementById('registerPassword')?.value;
                const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
                
                if (password !== confirmPassword) {
                    UIComponents.showToast('Passwords do not match!', 'error');
                    return;
                }
                
                if (name && email && password) {
                    const user = {
                        name: name,
                        email: email,
                        isLoggedIn: true,
                        isAdmin: false,
                        memberSince: new Date().toISOString()
                    };
                    
                    StorageManager.saveUser(user);
                    UIComponents.showToast('Account created successfully!');
                    
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1500);
                }
            });
        }
    }

    static initializeAdminLoginPage() {
        const adminLoginForm = document.getElementById('adminLoginForm');
        if (!adminLoginForm) return;

        // Change these demo credentials before using this site in production.
        const adminCredentials = {
            email: 'admin@rougevera.com',
            password: 'Admin@123'
        };

        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('adminEmail')?.value.trim();
            const password = document.getElementById('adminPassword')?.value;

            if (email !== adminCredentials.email || password !== adminCredentials.password) {
                UIComponents.showToast('Invalid admin credentials.', 'error');
                return;
            }

            StorageManager.saveUser({
                name: 'Administrator',
                email,
                isLoggedIn: true,
                isAdmin: true,
                memberSince: new Date().toISOString()
            });

            UIComponents.showToast('Admin login successful!');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
        });
    }
}

// ============================================
// 9. GLOBAL FUNCTIONS
// ============================================
window.switchProfileTab = (tab) => {
    const mainContent = document.querySelector('.profile-main');
    if (!mainContent) return;
    
    // Update menu items
    const menuItems = document.querySelectorAll('.profile-menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[onclick*="${tab}"]`);
    if (activeItem) activeItem.classList.add('active');
    
    // Update content based on tab
    switch(tab) {
        case 'dashboard':
            mainContent.innerHTML = PageController.createProfileDashboard();
            break;
        case 'orders':
            mainContent.innerHTML = `
                <div class="profile-section">
                    <h2>My Orders</h2>
                    <div class="orders-container">
                        <p class="text-muted">No orders yet</p>
                    </div>
                </div>
            `;
            break;
        case 'wishlist':
            mainContent.innerHTML = `
                <div class="profile-section">
                    <h2>My Wishlist</h2>
                    <div class="empty-wishlist">
                        <i class="fas fa-heart"></i>
                        <h4>Your wishlist is empty</h4>
                        <p>Start adding your favorite perfumes</p>
                        <a href="shop.html" class="btn btn-gold">Browse Collection</a>
                    </div>
                </div>
            `;
            break;
        case 'settings':
            const user = StorageManager.getUser();
            mainContent.innerHTML = `
                <div class="profile-section">
                    <h2>Account Settings</h2>
                    <form class="settings-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" value="${user?.name || ''}">
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" value="${user?.email || ''}">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="••••••••">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-outline-gold">Cancel</button>
                            <button type="submit" class="btn btn-gold">Save Changes</button>
                        </div>
                    </form>
                </div>
            `;
            break;
    }
};

window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('prestigeBlissUser');
        
        UIComponents.showToast('Logged out successfully');
        setTimeout(() => location.reload(), 1000);
    }
};

window.editProduct = (index) => {
    const product = PRODUCTS[index];
    if (!product) return;
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    const prices = product.sizes || [];
    const getPrice = size => prices.find(item => item.size === size)?.price || 0;
    const existingEditor = document.getElementById('editProductPanel');
    if (existingEditor) existingEditor.remove();

    const editor = document.createElement('div');
    editor.id = 'editProductPanel';
    editor.className = 'admin-edit-panel';
    editor.innerHTML = `
        <div class="admin-edit-header"><div><h2>Edit Product</h2><p>Update product details, prices, and available stock.</p></div><button type="button" class="btn btn-black" id="closeProductEditor" aria-label="Close editor"><i class="fas fa-times"></i></button></div>
        <form id="editProductForm">
            <div class="form-row"><div class="form-group"><label for="editProductName">Product Name</label><input id="editProductName" value="${product.name}" required></div><div class="form-group"><label for="editProductCategory">Category</label><select id="editProductCategory" required>${['signature', 'limited', 'seasonal', 'unisex'].map(category => `<option value="${category}" ${product.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></div></div>
            <div class="form-row"><div class="form-group"><label for="editProductStock">Stock Quantity</label><input id="editProductStock" type="number" min="0" step="1" value="${product.stock}" required></div><div class="form-group"><label for="editProductImage">Image URL</label><input id="editProductImage" value="${product.image || ''}"></div></div>
            <div class="form-row"><div class="form-group"><label for="editPrice10">10ml Price</label><input id="editPrice10" type="number" min="0" step="0.01" value="${getPrice('10ml')}" required></div><div class="form-group"><label for="editPrice30">30ml Price</label><input id="editPrice30" type="number" min="0" step="0.01" value="${getPrice('30ml')}" required></div><div class="form-group"><label for="editPrice50">50ml Price</label><input id="editPrice50" type="number" min="0" step="0.01" value="${getPrice('50ml')}" required></div></div>
            <div class="form-group"><label for="editProductDescription">Description</label><textarea id="editProductDescription" rows="4" required>${product.description || ''}</textarea></div>
            <div class="form-actions"><button type="button" class="btn btn-outline-gold" id="cancelProductEditor">Cancel</button><button type="submit" class="btn btn-gold"><i class="fas fa-save"></i> Save Product</button></div>
        </form>`;
    mainContent.prepend(editor);

    const closeEditor = () => editor.remove();
    document.getElementById('closeProductEditor').addEventListener('click', closeEditor);
    document.getElementById('cancelProductEditor').addEventListener('click', closeEditor);
    document.getElementById('editProductForm').addEventListener('submit', event => {
        event.preventDefault();
        const editedPrices = [
            { size: '10ml', price: Number(document.getElementById('editPrice10').value) },
            { size: '30ml', price: Number(document.getElementById('editPrice30').value) },
            { size: '50ml', price: Number(document.getElementById('editPrice50').value) }
        ];
        product.name = document.getElementById('editProductName').value.trim();
        product.category = document.getElementById('editProductCategory').value;
        product.stock = Math.max(0, Number.parseInt(document.getElementById('editProductStock').value, 10) || 0);
        product.image = document.getElementById('editProductImage').value.trim() || '1.jpeg';
        product.description = document.getElementById('editProductDescription').value.trim();
        product.sizes = editedPrices.map(size => ({ ...size, originalPrice: size.price * 1.5, discountPercentage: 33 }));
        StorageManager.saveProductCatalog(PRODUCTS);
        StorageManager.saveInventory(PRODUCTS);
        closeEditor();
        PageController.showManageProducts();
        UIComponents.showToast(`${product.name} updated successfully!`);
    });
};

window.deleteProduct = (index) => {
    if (confirm('Are you sure you want to delete this product?')) {
        PRODUCTS.splice(index, 1);
        StorageManager.saveProductCatalog(PRODUCTS);
        StorageManager.saveInventory(PRODUCTS);
        PageController.showManageProducts();
        UIComponents.showToast('Product deleted successfully');
    }
};

// ============================================
// 10. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    PageController.initialize();
    CustomerSupport.initialize();
});

// Export to window for HTML access
window.UIComponents = UIComponents;
window.CurrencySystem = CurrencySystem;
window.PageController = PageController;
window.ProfileController = ProfileController;
window.CustomerSupport = CustomerSupport;