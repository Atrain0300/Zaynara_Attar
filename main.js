(() => {
  const STORAGE_KEY = "zaynara_attar_cart_v1";
  const catalog = Array.isArray(window.ZaynaraProducts) ? window.ZaynaraProducts : [];
  let toastTimerId = null;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

  const sanitizeCart = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter((entry) => typeof entry === "object" && entry !== null)
      .map((entry) => ({
        id: String(entry.id || ""),
        quantity: Number(entry.quantity) > 0 ? Math.floor(Number(entry.quantity)) : 0
      }))
      .filter((entry) => entry.id && entry.quantity > 0);
  };

  const getCart = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? sanitizeCart(JSON.parse(raw)) : [];
    } catch (error) {
      return [];
    }
  };

  const setCart = (items) => {
    const safeItems = sanitizeCart(items);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeItems));
    } catch (error) {
      return;
    }
    updateCartCount();
  };

  const getProductById = (id) => catalog.find((product) => product.id === id);

  const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

  const showToast = (message) => {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimerId);
    toastTimerId = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  };

  const addToCart = (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    const nextQuantity = Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1;
    const cart = getCart();
    const existing = cart.find((entry) => entry.id === productId);

    if (existing) {
      existing.quantity += nextQuantity;
    } else {
      cart.push({ id: productId, quantity: nextQuantity });
    }

    setCart(cart);
    showToast(`${product.name} added to cart`);
  };

  const removeFromCart = (productId) => {
    const remaining = getCart().filter((item) => item.id !== productId);
    setCart(remaining);
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity);
    if (nextQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const cart = getCart();
    const target = cart.find((item) => item.id === productId);
    if (!target) {
      return;
    }

    target.quantity = Math.floor(nextQuantity);
    setCart(cart);
  };

  const updateCartCount = () => {
    const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((node) => {
      node.textContent = String(totalItems);
    });
  };

  const buildProductCard = (product, options = {}) => {
    const { showDescription = true, showType = true, showAddButton = true } = options;

    return `
      <article class="product-card reveal">
        <a href="product.html?id=${product.id}" class="product-image-wrap" aria-label="View ${product.name}">
          <img src="${product.image}" alt="${product.name} attar bottle">
        </a>
        <div class="product-meta">
          ${showType ? `<p class="product-type">${capitalize(product.type)}</p>` : ""}
          <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
          <p class="price">${formatCurrency(product.price)}</p>
          ${showDescription ? `<p class="product-description">${product.description}</p>` : ""}
          <div class="product-actions">
            <a class="text-link" href="product.html?id=${product.id}">View Details</a>
            ${showAddButton ? `<button class="btn btn-small btn-secondary quick-add" data-product="${product.id}" type="button">Add to Cart</button>` : ""}
          </div>
        </div>
      </article>
    `;
  };

  const bindQuickAdd = (scope = document) => {
    scope.querySelectorAll(".quick-add").forEach((button) => {
      if (button.dataset.bound === "true") {
        return;
      }

      button.dataset.bound = "true";
      button.addEventListener("click", () => {
        const productId = button.dataset.product;
        if (productId) {
          addToCart(productId, 1);
        }
      });
    });
  };

  const animateScope = (scope) => {
    const base = scope || document;
    const nodes = [];

    if (base.classList && base.classList.contains("reveal") && !base.classList.contains("in-view")) {
      nodes.push(base);
    }

    base.querySelectorAll?.(".reveal:not(.in-view)").forEach((node) => {
      nodes.push(node);
    });

    nodes.forEach((node, index) => {
      window.setTimeout(() => {
        node.classList.add("in-view");
      }, index * 65);
    });
  };

  const setActiveNav = () => {
    const currentPage = document.body.dataset.page;
    if (!currentPage) {
      return;
    }

    document.querySelectorAll("[data-page-link]").forEach((link) => {
      link.classList.toggle("active", link.dataset.pageLink === currentPage);
    });
  };

  const setFooterYear = () => {
    const yearNode = document.getElementById("year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  };

  const initMobileNav = () => {
    const button = document.querySelector(".nav-toggle");
    const nav = document.getElementById("mainNav");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      });
    });
  };

  const initRevealObserver = () => {
    const revealNodes = document.querySelectorAll(".reveal");
    if (!revealNodes.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealNodes.forEach((node) => observer.observe(node));
  };

  const initFormFeedback = (formId, feedbackId, successText) => {
    const form = document.getElementById(formId);
    const feedback = document.getElementById(feedbackId);
    if (!form || !feedback) {
      return;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      feedback.textContent = successText;
      form.reset();
    });
  };

  const renderHomepageSections = () => {
    if (document.body.dataset.page !== "home") {
      return;
    }

    const bestSellersNode = document.getElementById("bestSellersGrid");
    const featuredNode = document.getElementById("featuredGrid");

    if (bestSellersNode) {
      const bestSellers = catalog.filter((product) => product.bestSeller).slice(0, 3);
      bestSellersNode.innerHTML = bestSellers
        .map((product) =>
          buildProductCard(product, {
            showDescription: false,
            showType: true,
            showAddButton: true
          })
        )
        .join("");
      bindQuickAdd(bestSellersNode);
      animateScope(bestSellersNode);
    }

    if (featuredNode) {
      const featured = catalog.filter((product) => product.featured).slice(0, 6);
      featuredNode.innerHTML = featured
        .map((product) =>
          buildProductCard(product, {
            showDescription: true,
            showType: true,
            showAddButton: true
          })
        )
        .join("");
      bindQuickAdd(featuredNode);
      animateScope(featuredNode);
    }
  };

  window.ZaynaraStore = {
    getProducts: () => [...catalog],
    getProductById,
    getCart,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartCount,
    formatCurrency,
    buildProductCard,
    bindQuickAdd,
    animateScope,
    showToast
  };

  document.addEventListener("DOMContentLoaded", () => {
    setFooterYear();
    setActiveNav();
    initMobileNav();
    initRevealObserver();
    updateCartCount();
    initFormFeedback("newsletterForm", "newsletterFeedback", "Welcome to the Zaynara private circle.");
    initFormFeedback("contactForm", "contactFeedback", "Thank you. Your message has been received.");
    renderHomepageSections();
  });
})();
