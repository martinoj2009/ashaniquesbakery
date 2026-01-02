// Main application state
let productsData = [];
let currentProducts = [];

// DOM elements
const elements = {
    productList: null,
    searchBar: null,
    sortDropdown: null,
    loading: null,
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    elements.productList = document.getElementById('product-list');
    elements.searchBar = document.getElementById('searchBar');
    elements.sortDropdown = document.getElementById('sortDropdown');
    elements.loading = document.getElementById('loading');

    try {
        showLoading(true);
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        productsData = data.products;
        currentProducts = [...productsData];

        renderProducts(currentProducts);
        setupEventListeners();
        showLoading(false);

        // Add fade-in animation
        requestAnimationFrame(() => {
            elements.productList.classList.add('fade-in');
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.');
        showLoading(false);
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Search functionality with debouncing
    let searchTimeout;
    elements.searchBar.addEventListener('input', (event) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => filterProducts(event), 300);
    });

    // Sort functionality
    elements.sortDropdown.addEventListener('change', sortProducts);

    // Event delegation for product cards
    elements.productList.addEventListener('click', (event) => {
        const card = event.target.closest('.product-card');
        if (card) {
            const productId = parseInt(card.dataset.productId);
            const product = productsData.find(p => p.id === productId);
            if (product) {
                openProductModal(product);
            }
        }
    });

    // Keyboard navigation for product cards
    elements.productList.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            const card = event.target.closest('.product-card');
            if (card) {
                event.preventDefault();
                card.click();
            }
        }
    });
}

// Render products to the DOM
function renderProducts(products) {
    if (!products || products.length === 0) {
        elements.productList.innerHTML = `
            <div class="no-results">
                <p>No products found.</p>
            </div>
        `;
        return;
    }

    elements.productList.innerHTML = products.map(product => {
        const isPlaceholder = product.image.includes('placeholder');
        return `
            <article
                class="product-card ${isPlaceholder ? 'placeholder' : ''}"
                data-product-id="${product.id}"
                role="listitem"
                tabindex="0"
                aria-label="${product.name}, from ${product.variations[0].price}">
                <div class="product-image-container">
                    <img
                        class="product-image"
                        src="${escapeHtml(product.image)}"
                        alt="${escapeHtml(product.name)}"
                        loading="lazy">
                    ${isPlaceholder ? '<span class="coming-soon-badge">Coming Soon</span>' : ''}
                </div>
                <div class="product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="product-price">From ${escapeHtml(product.variations[0].price)}</p>
                    ${product.variations.length > 1 ? `<p class="product-variations">${product.variations.length} options available</p>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

// Open product modal
function openProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.setAttribute('aria-modal', 'true');

    const isPlaceholder = product.image.includes('placeholder');

    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button" aria-label="Close modal">×</button>
            <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
            <h2 id="modal-title">${escapeHtml(product.name)}</h2>
            <p class="product-description">${escapeHtml(product.description)}</p>

            ${!isPlaceholder ? `
                <label for="variation-select" class="variation-label">Select option:</label>
                <select id="variation-select" class="variation-select" aria-label="Select product variation">
                    ${product.variations.map((v, index) => `
                        <option value="${index}">${escapeHtml(v.name)} - ${escapeHtml(v.price)}</option>
                    `).join('')}
                </select>

                <p class="deposit-note">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 4v1h2V4H7zm0 2v6h2V6H7z"/>
                    </svg>
                    This is a $10 deposit. The full price will be invoiced.
                </p>

                <div class="modal-actions">
                    <button class="cancel-button">Cancel</button>
                    <a href="${escapeHtml(product.variations[0].orderLink)}"
                       class="order-button"
                       target="_blank"
                       rel="noopener noreferrer">
                        Pay Deposit
                    </a>
                </div>
            ` : `
                <p class="coming-soon-message">This product is coming soon! Check back later.</p>
                <div class="modal-actions">
                    <button class="cancel-button">Close</button>
                </div>
            `}
        </div>
    `;

    // Show modal with animation
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        modal.classList.add('modal-open');
    });

    // Focus trap and close handlers
    const modalContent = modal.querySelector('.modal-content');
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.cancel-button');
    const variationSelect = modal.querySelector('#variation-select');
    const orderButton = modal.querySelector('.order-button');

    // Update order link when variation changes
    if (variationSelect && orderButton) {
        variationSelect.addEventListener('change', (e) => {
            const selectedIndex = parseInt(e.target.value);
            orderButton.href = product.variations[selectedIndex].orderLink;
        });
    }

    // Close modal function
    const closeModal = () => {
        modal.classList.add('modal-closing');
        setTimeout(() => {
            modal.remove();
            // Return focus to the product card
            const card = document.querySelector(`[data-product-id="${product.id}"]`);
            if (card) card.focus();
        }, 300);
    };

    // Event listeners for closing
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);

    // Escape key to close
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Focus the close button
    setTimeout(() => closeButton.focus(), 100);
}

// Filter products based on search term
function filterProducts(event) {
    const searchTerm = event.target.value.toLowerCase().trim();

    currentProducts = productsData.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });

    // Re-apply current sort
    const sortValue = elements.sortDropdown.value;
    currentProducts = sortProductsArray(currentProducts, sortValue);

    renderProducts(currentProducts);
}

// Sort products
function sortProducts(event) {
    const sortValue = event.target.value;
    currentProducts = sortProductsArray(currentProducts, sortValue);
    renderProducts(currentProducts);
}

// Sort products array
function sortProductsArray(products, sortValue) {
    const sorted = [...products];

    sorted.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'price-asc':
                return parsePrice(a.variations[0].price) - parsePrice(b.variations[0].price);
            case 'price-desc':
                return parsePrice(b.variations[0].price) - parsePrice(a.variations[0].price);
            default:
                return 0;
        }
    });

    return sorted;
}

// Parse price string to number
function parsePrice(priceString) {
    return parseFloat(priceString.replace(/[^0-9.]/g, ''));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show/hide loading state
function showLoading(show) {
    if (elements.loading) {
        elements.loading.hidden = !show;
    }
}

// Show error message
function showError(message) {
    elements.productList.innerHTML = `
        <div class="error-message">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z"/>
            </svg>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}