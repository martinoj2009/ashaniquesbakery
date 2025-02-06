const { 
    AppBar, Button, Card, CardContent, CardMedia, Dialog, 
    Select, MenuItem, Typography, TextField
} = MaterialUI;

// Initialize the app
document.addEventListener("DOMContentLoaded", async () => {
    // Render App Bar
    renderAppBar();
    
    // Render Controls
    renderControls();
    
    // Load and render products
    try {
        const response = await fetch("data.json");
        const data = await response.json();
        renderProducts(data.products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
});

function renderAppBar() {
    const appBar = document.getElementById('app-bar');
    appBar.innerHTML = `
        <div style="background-color: #f8b400; padding: 16px; color: white;">
            <h1 style="margin: 0; text-align: center;">Ashanique's Bakery</h1>
        </div>
    `;
}

function renderControls() {
    const controls = document.getElementById('controls');
    controls.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <div style="margin-bottom: 16px;">
                <input type="text" 
                    placeholder="Search products..." 
                    style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                >
            </div>
            <div>
                <select style="width: 200px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-asc">Price (Low to High)</option>
                    <option value="price-desc">Price (High to Low)</option>
                </select>
            </div>
        </div>
    `;
}

function renderProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = products.map(product => `
        <div class="mui-card" style="cursor: pointer;" onclick="openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
            <div style="padding: 16px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;"
                >
                <div style="padding-top: 16px; text-align: center;">
                    <h3 style="margin: 0;">${product.name}</h3>
                    <p style="color: #f8b400; font-weight: bold;">From ${product.variations[0].price}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function openProductModal(product) {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 24px; border-radius: 8px; max-width: 500px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0;">${product.name}</h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" 
                            style="background: none; border: none; cursor: pointer; font-size: 24px;">
                        ×
                    </button>
                </div>
                <img src="${product.image}" 
                     alt="${product.name}" 
                     style="width: 100%; border-radius: 4px; margin: 16px 0;"
                >
                <p>${product.description}</p>
                <select style="width: 100%; padding: 8px; margin: 16px 0; border: 1px solid #ccc; border-radius: 4px;">
                    ${product.variations.map(v => `
                        <option value="${v.orderLink}">${v.name} - ${v.price}</option>
                    `).join('')}
                </select>
                <p style="color: #666;">Note: This is a $10 deposit. The full price will be invoiced.</p>
                <a href="${product.variations[0].orderLink}" 
                   style="display: inline-block; background: #f8b400; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">
                    Pay Deposit
                </a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}