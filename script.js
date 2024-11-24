document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const modal = document.getElementById("product-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDescription = document.getElementById("modal-description");
    const orderLink = document.getElementById("order-link");
    const closeButton = document.querySelector(".close-button");
  
    // Fetch data from JSON
    const response = await fetch("data.json");
    const data = await response.json();
  
    // Set bakery info
    document.getElementById("bakery-name").textContent = data.bakeryInfo.name;
    document.getElementById("contact-info").textContent = `
      📞 ${data.bakeryInfo.contact.phone} | ✉️ ${data.bakeryInfo.contact.email}
    `;
  
    // Populate products
    data.products.forEach((product) => {
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
        modalTitle.textContent = product.name;
        modalDescription.textContent = product.description;
        orderLink.href = product.orderLink;
        modal.classList.remove("hidden");
      });
      productList.appendChild(tile);
    });
  
    // Close modal
    closeButton.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  });
  