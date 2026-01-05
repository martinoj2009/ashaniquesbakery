// Main application state
let productsData = [];
let currentProducts = [];
let recipesData = [];
let currentRecipes = [];
let currentSection = 'recipes'; // Default section

// DOM elements
const elements = {
    productList: null,
    searchBar: null,
    sortDropdown: null,
    loading: null,
    recipeList: null,
    recipeSearchBar: null,
    recipeCategoryFilter: null,
    recipeLoading: null,
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    elements.productList = document.getElementById('product-list');
    elements.searchBar = document.getElementById('searchBar');
    elements.sortDropdown = document.getElementById('sortDropdown');
    elements.loading = document.getElementById('loading');
    elements.recipeList = document.getElementById('recipe-list');
    elements.recipeSearchBar = document.getElementById('recipeSearchBar');
    elements.recipeCategoryFilter = document.getElementById('recipeCategoryFilter');
    elements.recipeLoading = document.getElementById('recipe-loading');

    try {
        // Load products from fetch, recipes from cache
        const [productsResponse, recipes] = await Promise.all([
            fetch('data.json'),
            RecipeCache.getRecipes()
        ]);

        if (!productsResponse.ok) {
            throw new Error('Failed to load data');
        }

        const productsJson = await productsResponse.json();

        productsData = productsJson.products;
        currentProducts = [...productsData];

        recipesData = recipes;
        currentRecipes = [...recipesData];

        // Render recipes first (default section)
        renderRecipes(currentRecipes);

        setupEventListeners();

        // Add fade-in animation
        requestAnimationFrame(() => {
            elements.recipeList.classList.add('fade-in');
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load content. Please try again later.', 'recipe');
    }
});

// Setup all event listeners
function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => switchSection(e.target.dataset.section));
    });

    // Recipe search functionality with debouncing
    let recipeSearchTimeout;
    elements.recipeSearchBar.addEventListener('input', (event) => {
        clearTimeout(recipeSearchTimeout);
        recipeSearchTimeout = setTimeout(() => filterRecipes(event), 300);
    });

    // Recipe category filter
    elements.recipeCategoryFilter.addEventListener('change', filterRecipes);

    // Product search functionality with debouncing
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
        if (card && !card.classList.contains('recipe-card')) {
            const productId = parseInt(card.dataset.productId);
            const product = productsData.find(p => p.id === productId);
            if (product) {
                openProductModal(product);
            }
        }
    });

    // Event delegation for recipe cards
    elements.recipeList.addEventListener('click', (event) => {
        const card = event.target.closest('.recipe-card');
        if (card) {
            const recipeId = parseInt(card.dataset.recipeId);
            if (recipeId) {
                window.location.href = `recipe.html?id=${recipeId}`;
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

    // Keyboard navigation for recipe cards
    elements.recipeList.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            const card = event.target.closest('.recipe-card');
            if (card) {
                event.preventDefault();
                const recipeId = parseInt(card.dataset.recipeId);
                if (recipeId) {
                    window.location.href = `recipe.html?id=${recipeId}`;
                }
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

// Convert decimal to fraction string for display
function decimalToFraction(decimal) {
    // Handle whole numbers
    if (decimal % 1 === 0) {
        return decimal.toString();
    }

    const tolerance = 1.0e-6;
    const whole = Math.floor(decimal);
    const fractional = decimal - whole;

    // Common denominators for baking (prioritize simple fractions)
    const commonDenominators = [2, 3, 4, 8, 16];

    for (let denominator of commonDenominators) {
        const numerator = Math.round(fractional * denominator);
        const calculatedValue = numerator / denominator;

        // Check if this fraction is close enough to the original value
        if (Math.abs(calculatedValue - fractional) < tolerance) {
            // Simplify the fraction
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(numerator, denominator);
            const simplifiedNum = numerator / divisor;
            const simplifiedDen = denominator / divisor;

            if (simplifiedNum === 0) {
                return whole.toString();
            }

            const fractionStr = `${simplifiedNum}/${simplifiedDen}`;
            return whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
        }
    }

    // Fallback: return decimal rounded to 2 places
    return decimal.toFixed(2).replace(/\.?0+$/, '');
}

// Show/hide loading state
function showLoading(show) {
    if (elements.loading) {
        elements.loading.hidden = !show;
    }
}

// Show error message
function showError(message, section = 'product') {
    const targetList = section === 'recipe' ? elements.recipeList : elements.productList;
    targetList.innerHTML = `
        <div class="error-message">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
                <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z"/>
            </svg>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

// Switch between sections
function switchSection(section) {
    currentSection = section;

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.section === section) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach(contentSection => {
        if (contentSection.id === `${section}-section`) {
            contentSection.classList.add('active');
        } else {
            contentSection.classList.remove('active');
        }
    });

    // Load products if switching to store and not yet loaded
    if (section === 'store' && elements.productList.innerHTML === '') {
        renderProducts(currentProducts);
        requestAnimationFrame(() => {
            elements.productList.classList.add('fade-in');
        });
    }
}

// Render recipes to the DOM
function renderRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
        elements.recipeList.innerHTML = `
            <div class="no-results">
                <p>No recipes found.</p>
            </div>
        `;
        return;
    }

    elements.recipeList.innerHTML = recipes.map(recipe => {
        return `
            <article
                class="recipe-card product-card"
                data-recipe-id="${recipe.id}"
                role="listitem"
                tabindex="0"
                aria-label="${recipe.name}, ${recipe.category}">
                <div class="product-image-container">
                    <img
                        class="product-image"
                        src="${escapeHtml(recipe.image)}"
                        alt="${escapeHtml(recipe.name)}"
                        loading="lazy">
                    <span class="recipe-badge ${recipe.difficulty.toLowerCase()}">${escapeHtml(recipe.difficulty)}</span>
                </div>
                <div class="product-info">
                    <h3>${escapeHtml(recipe.name)}</h3>
                    <p class="recipe-category">${escapeHtml(recipe.category)}</p>
                    <div class="recipe-meta">
                        <span class="recipe-time">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                <path d="M7 0a7 7 0 1 0 0 14A7 7 0 0 0 7 0zm0 1a6 6 0 1 1 0 12A6 6 0 0 1 7 1zm-.5 2v4.5l3 1.5.5-1-2.5-1.25V3h-1z"/>
                            </svg>
                            ${escapeHtml(recipe.totalTime)}
                        </span>
                        <span class="recipe-servings">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                                <path d="M7 3a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1zm-4 .5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zm8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5zM2 10h10v2H2v-2z"/>
                            </svg>
                            ${escapeHtml(recipe.servings)}
                        </span>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Filter recipes based on search term and category
function filterRecipes(event) {
    const searchTerm = elements.recipeSearchBar.value.toLowerCase().trim();
    const selectedCategory = elements.recipeCategoryFilter.value;

    currentRecipes = recipesData.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                            recipe.description.toLowerCase().includes(searchTerm) ||
                            recipe.category.toLowerCase().includes(searchTerm);

        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    renderRecipes(currentRecipes);
}

