document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        renderProducts(data.products);
        setupSearchAndSort();
    } catch (error) {
        console.error('Error loading products:', error);
    }
});

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = products.map(product => `
        <div class="product-card" onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p style="color: var(--primary-color)">From ${product.variations[0].price}</p>
            </div>
        </div>
    `).join('');
}

function openProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-button" aria-label="Close">×</button>
            <img class="product-image" src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <select class="sort-select" style="width: 100%; margin: 1rem 0;">
                ${product.variations.map(v => `
                    <option value="${v.orderLink}">${v.name} - ${v.price}</option>
                `).join('')}
            </select>
            <p style="color: #666;">Note: This is a $10 deposit. The full price will be invoiced.</p>
            <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
                <button class="cancel-button">Cancel</button>
                <a href="${product.variations[0].orderLink}" class="order-button" target="_blank">
                    Pay Deposit
                </a>
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    // Close modal with X button or Cancel button
    const closeButton = modal.querySelector('.close-button');
    const cancelButton = modal.querySelector('.cancel-button');
    
    closeButton.addEventListener('click', () => modal.remove());
    cancelButton.addEventListener('click', () => modal.remove());
    
    document.body.appendChild(modal);
}

function setupSearchAndSort() {
    const searchBar = document.getElementById('searchBar');
    const sortDropdown = document.getElementById('sortDropdown');
    
    searchBar.addEventListener('input', filterProducts);
    sortDropdown.addEventListener('change', sortProducts);
}

function filterProducts(event) {
    const searchTerm = event.target.value.toLowerCase();
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const name = product.querySelector('h3').textContent.toLowerCase();
        product.style.display = name.includes(searchTerm) ? '' : 'none';
    });
}

function sortProducts(event) {
    const sortValue = event.target.value;
    const productList = document.getElementById('product-list');
    const products = Array.from(productList.children);
    
    products.sort((a, b) => {
        const nameA = a.querySelector('h3').textContent;
        const nameB = b.querySelector('h3').textContent;
        
        if (sortValue === 'name-asc') return nameA.localeCompare(nameB);
        if (sortValue === 'name-desc') return nameB.localeCompare(nameA);
        // Add price sorting logic if needed
    });
    
    productList.innerHTML = '';
    products.forEach(product => productList.appendChild(product));
}