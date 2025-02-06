// DOM Elements
const productList = document.getElementById('product-list');
const socialLinksContainer = document.getElementById('social-links-container');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');
const orderLink = document.querySelector('.order-button');
const variationDropdown = document.getElementById('variationDropdown');

// Data Loading
async function loadData() {
    try {
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
            return {};
        }
    }
}

// Function to add social media links
function addSocialLinks(bakeryInfo) {
    if (!socialLinksContainer || !bakeryInfo?.social) return;

    // Clear existing links
    socialLinksContainer.innerHTML = '';
    
    // Add each social media link
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
function renderProducts(products) {
    productList.innerHTML = '';
    
    if (products.length === 0) {
        productList.innerHTML = `
            <p class="text-center text-gray-500">
                No products available at this time.
            </p>
        `;
        return;
    }
    products.forEach(product => {
        const tile = document.createElement('div');
        tile.className = 'product-tile';
        
        tile.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="text-lg font-bold text-primary">
                    From ${product.variations[0].price}
                </p>
            </div>
        `;
        tile.addEventListener('click', () => openProductModal(product));
        productList.appendChild(tile);
    });
}

// Modal Handling
function openProductModal(product) {
    modalContent.innerHTML = `
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <div class="variation-selector">
            <label for="variationDropdown">Choose a variation:</label>
            <select id="variationDropdown">
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
    const dropdown = document.getElementById('variationDropdown');
    const button = document.querySelector('.order-button');
    dropdown.addEventListener('change', () => {
        button.disabled = false;
        button.addEventListener('click', () => handleOrder(dropdown.value));
    });
    modal.style.display = 'block';
}

// Order Handling
function handleOrder(orderLink) {
    window.open(orderLink, '_blank');
}

// Initialize
async function init() {
    const data = await loadData();
    // Add social links if available
    addSocialLinks(data.bakeryInfo);
    // Render products
    const products = data.products || [];
    renderProducts(products);
}

// Run initialization
init();