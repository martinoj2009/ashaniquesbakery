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
            const depositAmount = 10; // Fixed deposit amount
            const orderUrl = orderLink.href;
            console.log(`User is placing a deposit for: $${depositAmount}`);
            alert("You are paying a $10 deposit. The full price will be invoiced.");
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
            if (!product.variations || product.variations.length === 0) {
                console.error(`Product "${product.name}" does not have any variations.`);
                return;
            }
    
            const tile = document.createElement("div");
            tile.classList.add("product-tile", "bg-white", "rounded-lg", "shadow-lg", "hover:shadow-xl", "transition-shadow", "p-4");
            tile.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-t-lg">
                <div class="product-info text-center mt-4">
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <p class="text-pink-500 font-bold">From ${product.variations[0].price}</p>
                </div>
            `;
    
            tile.addEventListener("click", () => {
                openProductModal(product);
            });
    
            productList.appendChild(tile);
        });
    }

    function openProductModal(product) {
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;
    
        // Populate variations dropdown
        const variationDropdown = document.getElementById("variationDropdown");
        variationDropdown.innerHTML = product.variations
            .map(
                (variation) =>
                    `<option value="${variation.orderLink}" data-price="${variation.price}">${variation.name} - ${variation.price}</option>`
            )
            .join("");
    
        // Update order link based on selection
        variationDropdown.addEventListener("change", (event) => {
            const selectedOption = event.target.selectedOptions[0];
            const orderLinkHref = selectedOption.value;
            const selectedPrice = selectedOption.dataset.price;
    
            // Update the order link and inform user about the deposit
            orderLink.href = orderLinkHref;
            console.log(`Selected SKU deposit: $10 for variation priced at ${selectedPrice}`);
        });
    
        // Initialize modal with the first variation selected
        variationDropdown.dispatchEvent(new Event("change"));
        modal.classList.remove("hidden");
    }

    async function populateGallery(productId) {
        gallery.innerHTML = `<div class="w-full h-64 flex items-center justify-center text-gray-500">
            <div class="loader border-t-4 border-pink-500 rounded-full w-8 h-8 animate-spin"></div>
            <p class="ml-4">Loading images...</p>
        </div>`;
    
        const folderPath = `images/${productId}/`;
        galleryImages = [];
        currentImageIndex = 0;
    
        for (let i = 1; i <= 100; i++) {
            const imagePath = `${folderPath}${String(i).padStart(2, '0')}.jpg?v=1`; // Append query string for caching
            const exists = await checkImageExists(imagePath);
            if (exists) {
                galleryImages.push(imagePath);
            } else {
                console.log(`Image not found: ${imagePath}, stopping further checks.`);
                break; // Stop fetching more images
            }
        }
    
        if (galleryImages.length > 0) {
            updateGallery();
        } else {
            gallery.innerHTML = `<p class="text-gray-500 text-center">No additional images available.</p>`;
        }
    }
    

    function updateGallery() {
        gallery.innerHTML = `
            <div class="relative flex items-center justify-center">
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

    document.getElementById("open-chatgpt").addEventListener("click", () => {
        const chatGPTUrl = "https://chatgpt.com/g/g-6743e463e6208191bc7ef1b844696ea3-ashanique-s-bakery";
        window.open(chatGPTUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
    });
    
    
});
