document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const orderLink = document.getElementById("orderLink");
    const modalImage = document.getElementById("modalImage");
    const closeButton = document.getElementById("closeModal");
    const searchBar = document.getElementById("searchBar");
    const sortDropdown = document.getElementById("sortDropdown");

    let products = []; // Will hold the product data
    let filteredProducts = []; // Products after search/sort filtering

    try {
        console.log("Initializing site...");

        // Fetch data from JSON
        const response = await fetch("data.json");
        if (!response.ok) throw new Error("Failed to load data.json");
        products = await response.json();
        filteredProducts = [...products]; // Initialize filtered products
        console.log("Data loaded successfully:", products);

        // Render products initially
        renderProducts(filteredProducts);

        // Search functionality
        searchBar.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            console.log(`Searching for: ${query}`);
            filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            );
            renderProducts(filteredProducts);
        });

        // Sorting functionality
        sortDropdown.addEventListener("change", (e) => {
            const sortValue = e.target.value;
            console.log(`Sorting by: ${sortValue}`);
            if (sortValue === "name-asc") {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortValue === "name-desc") {
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            } else if (sortValue === "price-asc") {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortValue === "price-desc") {
                filteredProducts.sort((a, b) => b.price - a.price);
            }
            renderProducts(filteredProducts);
        });

        // Close modal
        closeButton.addEventListener("click", () => {
            console.log("Close button clicked.");
            modal.classList.add("hidden");
        });

        // Close modal on clicking outside modal content
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                console.log("Clicked outside modal content.");
                modal.classList.add("hidden");
            }
        });
    } catch (error) {
        console.error("Error loading JSON or initializing site:", error);
    }

    // Function to render products
    function renderProducts(productArray) {
        productList.innerHTML = ""; // Clear current products
        if (productArray.length === 0) {
            productList.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
            return;
        }

        productArray.forEach((product) => {
            const tile = document.createElement("div");
            tile.classList.add("product-tile", "bg-white", "rounded-lg", "shadow-lg", "hover:shadow-xl", "transition-shadow", "p-4");
            tile.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-t-lg">
                <div class="product-info text-center mt-4">
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <p class="text-pink-500 font-bold">$${product.price}</p>
                </div>
            `;

            // Open modal on click
            tile.addEventListener("click", () => {
                console.log(`Opening modal for product: ${product.name}`);
                modalTitle.textContent = product.name;
                modalDescription.textContent = product.description;
                modalImage.src = product.image;
                orderLink.href = product.orderLink;
                modal.classList.remove("hidden");
            });

            productList.appendChild(tile);
        });
    }
});
