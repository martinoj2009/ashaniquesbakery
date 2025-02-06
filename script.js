document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productList = document.getElementById('product-list');
    const modal = document.getElementById('product-modal');
    const modalContent = document.querySelector('.modal-content');
    
    // Initialize Material UI components
    const button = document.createElement('button');
    button.className = 'mui-btn mui-btn--primary';
    
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
        const socialLinksContainer = document.querySelector('.social-links-container');
        if (!socialLinksContainer || !bakeryInfo?.social) return;

        Object.entries(bakeryInfo.social).forEach(([platform, url]) => {
            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.textContent = platform;
                link.target = '_blank';
                link.className = 'mui-btn mui-btn--flat';
                socialLinksContainer.appendChild(link);
            }
        });
    }

    // Product Rendering
    function renderProducts(products) {
        productList.innerHTML = '';
        
        if (products.length === 0) {
            productList.innerHTML = `
                <p class="mui--text-center mui--text-hint">No products available at this time.</p>
            `;
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'mui-card';
            card.innerHTML = `
                <div class="mui-card-header">
                    <img src="${product.image}" alt="${product.name}" class="mui-card-media">
                </div>
                <div class="mui-card-content">
                    <h3>${product.name}</h3>
                    <p class="mui--text-caption">${product.description}</p>
                    <p class="price mui--text-caption">${product.variations[0].price}</p>
                </div>
                <div class="mui-card-actions">
                    <button class="mui-btn mui-btn--primary" onclick="openProductModal('${product.id}')">
                        View Details
                    </button>
                </div>
            `;
            productList.appendChild(card);
        });
    }

    // Modal Handling
    function openProductModal(productId) {
        const product = data.products.find(p => p.id == productId);
        
        if (!product) return;

        const dialog = document.createElement('div');
        dialog.className = 'mui-dialog';
        dialog.innerHTML = `
            <div class="mui-dialog-title">${product.name}</div>
            <div class="mui-dialog-content">
                <p>${product.description}</p>
                <div class="mui-select">
                    <select id="variation-dropdown">
                        ${product.variations.map(variation => `
                            <option value="${variation.orderLink}" data-price="${variation.price}">
                                ${variation.name} - ${variation.price}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <button class="mui-btn mui-btn--primary order-button" disabled>
                    Pay Deposit
                </button>
            </div>
        `;

        modal.appendChild(dialog);

        // Initialize dialog
        const options = {
            mode: 'fixed',
            position: ['center', 'center']
        };
        const dialogInstance = new mui.Dialog(dialog, options);
        dialogInstance.show();

        // Handle variation selection
        const dropdown = document.getElementById('variation-dropdown');
        const button = document.querySelector('.order-button');
        
        dropdown.addEventListener('change', () => {
            button.disabled = false;
            button.addEventListener('click', () => handleOrder(dropdown.value));
        });

        // Close dialog when clicking outside
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialogInstance.close();
            }
        });
    }

    // Order Handling
    function handleOrder(orderLink) {
        window.open(orderLink, '_blank');
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

    // Run initialization
    init();
});