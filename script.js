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
          console.log("Tile clicked:", product.name);
          modalTitle.textContent = product.name;
          modalDescription.textContent = product.description;
          orderLink.href = product.orderLink;
          orderLink.textContent = "Order Now"; // Ensure link text is consistent
          modalImage.src = product.image; // Set the modal image
          modalImage.alt = product.name; // Set image alt attribute for accessibility
          modal.classList.remove("hidden");
          console.log("Modal opened for:", product.name);
        });
        productList.appendChild(tile);
      });
  
      // Close modal when "X" is clicked
      closeButton.addEventListener("click", () => {
        console.log("Closing modal via close button");
        modal.classList.add("hidden");
      });
  
      // Close modal when clicking outside the modal content
      modal.addEventListener("click", (event) => {
        if (event.target === modal) {
          console.log("Closing modal by clicking outside content");
          modal.classList.add("hidden");
        }
      });
  
    } catch (error) {
      console.error("Error loading JSON or initializing site:", error);
    }
  });
  