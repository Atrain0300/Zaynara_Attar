(() => {
  const SHIPPING_COST = 12;

  const buildLineItems = () => {
    if (!window.ZaynaraStore) {
      return [];
    }

    return window.ZaynaraStore
      .getCart()
      .map((line) => {
        const product = window.ZaynaraStore.getProductById(line.id);
        if (!product) {
          return null;
        }
        return { product, quantity: line.quantity };
      })
      .filter(Boolean);
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.ZaynaraStore) {
      return;
    }

    const cartRoot = document.getElementById("cartItems");
    const emptyState = document.getElementById("cartEmptyState");
    const subtotalNode = document.getElementById("subtotalAmount");
    const shippingNode = document.getElementById("shippingAmount");
    const totalNode = document.getElementById("totalAmount");
    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutFeedback = document.getElementById("checkoutFeedback");

    if (!cartRoot || !emptyState || !subtotalNode || !shippingNode || !totalNode || !checkoutForm || !checkoutFeedback) {
      return;
    }

    const calculateTotals = (lines) => {
      const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
      const shipping = subtotal > 0 ? SHIPPING_COST : 0;
      const total = subtotal + shipping;
      return { subtotal, shipping, total };
    };

    const renderCart = () => {
      const lines = buildLineItems();

      if (!lines.length) {
        emptyState.hidden = false;
        cartRoot.innerHTML = "";
      } else {
        emptyState.hidden = true;
        cartRoot.innerHTML = lines
          .map(
            (line) => `
              <article class="cart-item">
                <img src="${line.product.image}" alt="${line.product.name}">
                <div>
                  <h3>${line.product.name}</h3>
                  <p>${window.ZaynaraStore.formatCurrency(line.product.price)} each</p>
                </div>
                <div class="cart-item-controls">
                  <div class="qty-controls">
                    <button type="button" data-action="decrease" data-id="${line.product.id}" aria-label="Decrease quantity">−</button>
                    <span>${line.quantity}</span>
                    <button type="button" data-action="increase" data-id="${line.product.id}" aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" class="remove-link" data-action="remove" data-id="${line.product.id}">Remove</button>
                </div>
              </article>
            `
          )
          .join("");
      }

      const totals = calculateTotals(lines);
      subtotalNode.textContent = window.ZaynaraStore.formatCurrency(totals.subtotal);
      shippingNode.textContent = window.ZaynaraStore.formatCurrency(totals.shipping);
      totalNode.textContent = window.ZaynaraStore.formatCurrency(totals.total);
      window.ZaynaraStore.updateCartCount();
    };

    cartRoot.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) {
        return;
      }

      const action = button.dataset.action;
      const productId = button.dataset.id;
      if (!action || !productId) {
        return;
      }

      const current = window.ZaynaraStore.getCart().find((line) => line.id === productId);

      if (action === "increase" && current) {
        window.ZaynaraStore.updateQuantity(productId, current.quantity + 1);
      } else if (action === "decrease" && current) {
        window.ZaynaraStore.updateQuantity(productId, current.quantity - 1);
      } else if (action === "remove") {
        window.ZaynaraStore.removeFromCart(productId);
      }

      renderCart();
    });

    checkoutForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const lines = buildLineItems();

      if (!lines.length) {
        checkoutFeedback.textContent = "Add at least one attar before placing your order.";
        return;
      }

      checkoutFeedback.textContent = "Thank you. Your order request has been received and will be confirmed by email.";
      checkoutForm.reset();
      window.ZaynaraStore.setCart([]);
      renderCart();
    });

    renderCart();
  });
})();
