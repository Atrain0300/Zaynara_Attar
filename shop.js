(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("shopGrid");
    const filterBar = document.getElementById("shopFilters");

    if (!grid || !filterBar || !window.ZaynaraStore) {
      return;
    }

    const filterButtons = [...filterBar.querySelectorAll("button[data-filter]")];
    let activeFilter = "all";

    const render = () => {
      const products = window.ZaynaraStore.getProducts();
      const visibleProducts =
        activeFilter === "all"
          ? products
          : products.filter((product) => product.type === activeFilter);

      if (!visibleProducts.length) {
        grid.innerHTML = `<p class="empty-copy">No products are currently available for this fragrance type.</p>`;
        return;
      }

      grid.innerHTML = visibleProducts
        .map((product) =>
          window.ZaynaraStore.buildProductCard(product, {
            showDescription: true,
            showType: true,
            showAddButton: true
          })
        )
        .join("");

      window.ZaynaraStore.bindQuickAdd(grid);
      window.ZaynaraStore.animateScope(grid);
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter || "all";
        filterButtons.forEach((filterButton) => {
          filterButton.classList.toggle("active", filterButton === button);
        });
        render();
      });
    });

    render();
  });
})();
