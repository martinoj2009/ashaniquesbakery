document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const orderLink = document.getElementById("order-link");
    const modalImage = document.getElementById("modal-image"); // Reference to the modal image
    const closeButton = document.querySelector(".close-button");

    try {
        console.log("Initializing site...");

        // Fetch data from JSON
        const response = await fetch("data.json");
        if (!response.ok) throw new Error("Failed to load data.json");
        const data = await response.json();
        console.log("Data loaded successfully:", data);

        // Set bakery info
        document.getElementById("bakery-name").textContent = data.bakeryInfo.name;
        document.getElementById("contact-info").textContent = `
        📞 ${data.bakeryInfo.contact.phone} | ✉️ ${data.bakeryInfo.contact.email}
      `;

        // Populate products
        data.products.forEach((product) => {
            console.log("Adding product:", product.name);
            const tile = document.createElement("div");
            tile.classList.add("product-tile");
            tile.innerHTML = `
          <img src="${product.image}" alt="${product.name}">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.price}</p>
          </div>
        `;

            tile.addEventListener("click", () => {
                console.log(`Opening modal for product: ${product.name}`);
                document.getElementById("modalTitle").textContent = product.name;
                document.getElementById("modalDescription").textContent = product.description;
                document.getElementById("modalImage").src = product.image;
                document.getElementById("orderLink").href = product.orderLink;

                // Show modal
                document.getElementById("productModal").classList.remove("hidden");
            });

            productList.appendChild(tile);
        });

        // Close modal
        document.getElementById("closeModal").addEventListener("click", () => {
            document.getElementById("productModal").classList.add("hidden");
        });

    } catch (error) {
        console.error("Error loading JSON or initializing site:", error);
    }
});
