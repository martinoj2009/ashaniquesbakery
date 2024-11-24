document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const modal = document.getElementById("productModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDescription = document.getElementById("modalDescription");
    const orderLink = document.getElementById("orderLink");
    const modalImage = document.getElementById("modalImage"); // Modal image
    const closeButton = document.getElementById("closeModal");

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
                modalTitle.textContent = product.name;
                modalDescription.textContent = product.description;
                modalImage.src = product.image;
                orderLink.href = product.orderLink;

                // Show modal
                modal.classList.remove("hidden");
            });

            productList.appendChild(tile);
        });

        // Close modal on "X" button
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
});
