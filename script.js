document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const orderLink = document.getElementById("orderLink");
    const gallery = document.getElementById("gallery");
    const closeButton = document.getElementById("closeModal");
    const searchBar = document.getElementById("searchBar");
    const sortDropdown = document.getElementById("sortDropdown");
    const socialLinksContainer = document.getElementById("social-links");

    let products = [];
    let filteredProducts = [];
    let galleryImages = [];
    let currentImageIndex = 0;

    try {
        console.log("Initializing site...");

        const response = await fetch("data.json");
        if (!response.ok) throw new Error(`Failed to load data.json: ${response.statusText}`);
        const data = await response.json();
        console.log("Fetched data:", data);

        if (!data.products || !Array.isArray(data.products)) {
            throw new Error("Invalid products data in JSON.");
        }
        products = data.products;
        filteredProducts = [...products];

        const bakeryInfo = data.bakeryInfo;
        if (bakeryInfo) {
            document.getElementById("bakery-name").textContent = bakeryInfo.name || "Ashanique's Bakery";
            const social = bakeryInfo.social || {};
            if (social.instagram) addSocialLink(social.instagram, "Instagram");
            if (social.facebook) addSocialLink(social.facebook, "Facebook");
        }

        console.log("Data loaded successfully:", products);

        renderProducts(filteredProducts);

        searchBar.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            console.log(`Searching for: ${query}`);
            filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
            );
            renderProducts(filteredProducts);
        });

        sortDropdown.addEventListener("change", (e) => {
            const sortValue = e.target.value;
            console.log(`Sorting by: ${sortValue}`);
            if (sortValue === "name-asc") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            else if (sortValue === "name-desc") filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            else if (sortValue === "price-asc") filteredProducts.sort((a, b) => parseFloat(a.price.replace('$', '')) - parseFloat(b.price.replace('$', '')));
            else if (sortValue === "price-desc") filteredProducts.sort((a, b) => parseFloat(b.price.replace('$', '')) - parseFloat(a.price.replace('$', '')));
            renderProducts(filteredProducts);
        });

        closeButton.addEventListener("click", () => {
            console.log("Close button clicked.");
            modal.classList.add("hidden");
        });

        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                console.log("Clicked outside modal content.");
                modal.classList.add("hidden");
            }
        });

        orderLink.addEventListener("click", (event) => {
            event.preventDefault();
            const orderUrl = orderLink.href;
            console.log(`Opening order link: ${orderUrl}`);
            window.open(orderUrl, '_blank');
        });
    } catch (error) {
        console.error("Error loading JSON or initializing site:", error);
    }

    function addSocialLink(url, platform) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "text-pink-300 hover:text-white text-lg";
        link.innerHTML = `<span>${platform}</span>`;
        socialLinksContainer.appendChild(link);
    }

    function renderProducts(productArray) {
        productList.innerHTML = "";
        if (productArray.length === 0) {
            productList.innerHTML = `<p class="col-span-full text-center text-gray-500">No products found.</p>`;
            return;
        }

        productArray.forEach((product) => {
            const imagePath = `images/${product.id}/01.jpg`; // Use 01.jpg for index
            const tile = document.createElement("div");
            tile.classList.add("product-tile", "bg-white", "rounded-lg", "shadow-lg", "hover:shadow-xl", "transition-shadow", "p-4");
            tile.innerHTML = `
                <img src="${imagePath}" alt="${product.name}" class="w-full h-48 object-cover rounded-t-lg">
                <div class="product-info text-center mt-4">
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <p class="text-pink-500 font-bold">${product.price}</p>
                </div>
            `;

            tile.addEventListener("click", () => {
                console.log(`Opening modal for product: ${product.name}`);
                modalTitle.textContent = product.name;
                modalDescription.textContent = product.description;
                orderLink.href = product.orderLink;

                populateGallery(product.id); // Load gallery images
                modal.classList.remove("hidden");
            });

            productList.appendChild(tile);
        });
    }

    async function populateGallery(productId) {
        gallery.innerHTML = ""; // Clear current gallery images
        const folderPath = `images/${productId}/`;
        galleryImages = []; // Reset gallery images
        currentImageIndex = 0;

        for (let i = 1; i <= 100; i++) {
            const imagePath = `${folderPath}${String(i).padStart(2, '0')}.jpg`;
            const exists = await checkImageExists(imagePath);
            if (exists) {
                galleryImages.push(imagePath);
            }
        }

        if (galleryImages.length > 0) {
            updateGallery();
        } else {
            gallery.innerHTML = `<p class="text-gray-500">No additional images available.</p>`;
        }
    }

    function updateGallery() {
        gallery.innerHTML = `
            <div class="relative">
                <button id="prevImage" class="absolute left-0 bg-gray-500 text-white px-2 py-1 rounded-lg">←</button>
                <img src="${galleryImages[currentImageIndex]}" alt="Gallery Image" class="w-full h-64 object-cover rounded-lg">
                <button id="nextImage" class="absolute right-0 bg-gray-500 text-white px-2 py-1 rounded-lg">→</button>
            </div>
        `;

        document.getElementById("prevImage").addEventListener("click", () => {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateGallery();
        });

        document.getElementById("nextImage").addEventListener("click", () => {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateGallery();
        });
    }

    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
});
