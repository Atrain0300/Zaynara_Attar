(() => {
  const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

  const renderRelatedProducts = (currentProduct, relatedGrid) => {
    if (!relatedGrid || !window.ZaynaraStore) {
      return;
    }

    const allProducts = window.ZaynaraStore.getProducts().filter((product) => product.id !== currentProduct.id);
    const sameType = allProducts.filter((product) => product.type === currentProduct.type);
    const mixed = allProducts.filter((product) => product.type !== currentProduct.type);
    const related = [...sameType, ...mixed].slice(0, 3);

    if (!related.length) {
      relatedGrid.innerHTML = `<p class="empty-copy">Related products will be available soon.</p>`;
      return;
    }

    relatedGrid.innerHTML = related
      .map((product) =>
        window.ZaynaraStore.buildProductCard(product, {
          showDescription: false,
          showType: true,
          showAddButton: true
        })
      )
      .join("");

    window.ZaynaraStore.bindQuickAdd(relatedGrid);
    window.ZaynaraStore.animateScope(relatedGrid);
  };

  document.addEventListener("DOMContentLoaded", () => {
    const detailRoot = document.getElementById("productDetail");
    const relatedRoot = document.getElementById("relatedGrid");
    if (!detailRoot || !window.ZaynaraStore) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    const products = window.ZaynaraStore.getProducts();

    let product = requestedId ? window.ZaynaraStore.getProductById(requestedId) : null;
    if (!product) {
      product = products[0];
    }

    if (!product) {
      detailRoot.innerHTML = `<p class="empty-copy">This product could not be found.</p>`;
      return;
    }

    const topNotes = product.notes?.top?.join(", ") || "—";
    const middleNotes = product.notes?.middle?.join(", ") || "—";
    const baseNotes = product.notes?.base?.join(", ") || "—";

    detailRoot.innerHTML = `
      <article class="product-detail panel reveal in-view">
        <div class="detail-image">
          <img src="${product.image}" alt="${product.name} product image">
        </div>
        <div class="detail-content">
          <p class="eyebrow">${capitalize(product.type)} Collection</p>
          <h1>${product.name}</h1>
          <p class="detail-price">${window.ZaynaraStore.formatCurrency(product.price)}</p>
          <p class="detail-description">${product.description}</p>
          <div class="notes-grid">
            <div class="note-card">
              <h4>Top</h4>
              <p>${topNotes}</p>
            </div>
            <div class="note-card">
              <h4>Middle</h4>
              <p>${middleNotes}</p>
            </div>
            <div class="note-card">
              <h4>Base</h4>
              <p>${baseNotes}</p>
            </div>
          </div>
          <div class="detail-actions">
            <label for="detailQuantity">Quantity</label>
            <input id="detailQuantity" type="number" min="1" value="1">
            <button type="button" id="detailAddToCart" class="btn btn-primary">Add to Cart</button>
          </div>
        </div>
      </article>
    `;

    const addButton = document.getElementById("detailAddToCart");
    const quantityInput = document.getElementById("detailQuantity");

    addButton?.addEventListener("click", () => {
      const quantity = Math.max(1, Number(quantityInput?.value) || 1);
      window.ZaynaraStore.addToCart(product.id, quantity);
    });

    renderRelatedProducts(product, relatedRoot);
  });
})();
