// DOM Elements
const productList = document.getElementById('product-list');
const socialLinksContainer = document.getElementById('social-links-container');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const loadingSpinner = document.querySelector('.loading-spinner');

// Data Loading
async function loadData() {
    try {
        loadingSpinner.style.display = 'block';
        // First try loading from GitHub URL
        const githubResponse = await fetch('https://raw.githubusercontent.com/martinoj2009/ashaniquesbakery/refs/heads/main/data.json');
        
        if (!githubResponse.ok) throw new Error('Failed to fetch GitHub data');
        
        const githubData = await githubResponse.json();
        return githubData;
    } catch (error) {
        console.log('Failed to load data from GitHub:', error);
        // Fall back to local data.json
        try {
            const localResponse = await fetch('data.json');
            const localData = await localResponse.json();
            console.log('Successfully loaded data from local file');
            return localData;
        } catch (localError) {
            console.error('Failed to load data from local file:', localError);
            displayErrorMessage('Failed to load products. Please refresh the page.');
            return {};
        }
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Display Error Message
function displayErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    productList.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 5000);
}

// Function to add social media links
function addSocialLinks(bakeryInfo) {
    if (!bakeryInfo?.social) return;
    
    socialLinksContainer.innerHTML = '';
    
    Object.entries(bakeryInfo.social).forEach(([platform, url]) => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.textContent = platform;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'social-link';
            socialLinksContainer.appendChild(link);
        }
    });
}

// Product Rendering
function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-price">${product.variations[0].price}</p>
        </div>
    `;
    
    card.addEventListener('click', () => openProductModal(product));
    return card;
}

function renderProducts(products) {
    productList.innerHTML = '';
    
    if (products.length === 0) {
        const noProductsMessage = document.createElement('p');
        noProductsMessage.textContent = 'No products available at this time.';
        noProductsMessage.style.textAlign = 'center';
        noProductsMessage.style.color = '#64748b';
        productList.appendChild(noProductsMessage);
        return;
    }
    
    products.forEach(product => {
        productList.appendChild(createProductCard(product));
    });
}

// Modal Handling
function openProductModal(product) {
    modalContent.innerHTML = `
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="variation-selector">
            <select id="variation-dropdown">
                ${product.variations.map(variation => `
                    <option value="${variation.orderLink}" data-price="${variation.price}">
                        ${variation.name} - ${variation.price}
                    </option>
                `).join('')}
            </select>
        </div>
        <button class="order-button" disabled>
            Pay Deposit
        </button>
    `;
    
    const dropdown = document.getElementById('variation-dropdown');
    const button = document.querySelector('.order-button');
    
    dropdown.addEventListener('change', () => {
        button.disabled = false;
        button.addEventListener('click', () => handleOrder(dropdown.value));
    });
    
    modal.style.display = 'block';
}

// Close Modal
function closeModal() {
    modal.style.display = 'none';
}

// Order Handling
function handleOrder(orderLink) {
    window.open(orderLink, '_blank');
    closeModal();
}

// Initialize
async function init() {
    try {
        const data = await loadData();
        addSocialLinks(data.bakeryInfo);
        const products = data.products || [];
        renderProducts(products);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal when ESC key is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});