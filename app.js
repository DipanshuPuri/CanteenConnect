/**
 * CanteenConnect Frontend Functionality
 * Handles menu display, cart management, order placement, and order tracking.
 */

(() => {
  const menuItems = [
    {
      id: 1,
      name: "Veg Burger",
      description: "Delicious veggie burger with fresh lettuce and tomato.",
      price: 50,
      category: "Snacks",
      image: "vegburger.jpg",
      veg: true,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 2,
      name: "Chicken Burger",
      description: "Grilled chicken burger with tangy sauce.",
      price: 75,
      category: "Snacks",
      image: "chickenburger.jpg",
      veg: false,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 3,
      name: "French Fries",
      description: "Crispy golden french fries.",
      price: 30,
      category: "Snacks",
      image: "frenchfries.jpg",
      veg: true,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 4,
      name: "Paneer Butter Masala",
      description: "Creamy paneer curry with aromatic spices.",
      price: 95,
      category: "Main Course",
      image: "paneerbuttermasala.jpg",
      veg: true,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 5,
      name: "Chicken Curry",
      description: "Spicy chicken curry served with steamed rice.",
      price: 120,
      category: "Main Course",
      image: "chickencurry.jpg",
      veg: false,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 6,
      name: "Veg Biryani",
      description: "Fragrant basmati rice cooked with vegetables and spices.",
      price: 90,
      category: "Main Course",
      image: "vegbiryani.jpg",
      veg: true,
      spiceLevel: ["Mild", "Medium", "Hot"]
    },
    {
      id: 7,
      name: "Cold Coffee",
      description: "Refreshing iced coffee with a hint of chocolate.",
      price: 40,
      category: "Beverages",
      image: "coldcoffee.jpg",
      veg: true,
      spiceLevel: []
    },
    {
      id: 8,
      name: "Masala Chai",
      description: "Classic Indian spiced tea brewed with fresh milk.",
      price: 25,
      category: "Beverages",
      image: "masalachai.jpg",
      veg: true,
      spiceLevel: []
    },
    {
      id: 9,
      name: "Lassi",
      description: "Sweet yogurt-based traditional drink.",
      price: 35,
      category: "Beverages",
      image: "lassi.jpg",
      veg: true,
      spiceLevel: []
    }
  ];

  // Select elements
  const menuSection = document.getElementById("menu");
  const cartIcon = document.getElementById("cart-icon");
  const cartCountElem = document.getElementById("cart-count");
  const cartSidebar = document.getElementById("cart-sidebar");
  const cartItemsContainer = cartSidebar.querySelector(".cart-items");
  const cartTotalElem = document.getElementById("cart-total");
  const placeOrderBtn = document.getElementById("place-order-btn");

  const searchBar = document.getElementById("search-bar");
  const filterCategory = document.getElementById("filter-category");
  const filterVeg = document.getElementById("filter-veg");
  const filterPrice = document.getElementById("filter-price");

  const toastElem = document.getElementById("toast");
  const modalElem = document.getElementById("modal");
  const modalCloseBtn = document.getElementById("close-modal");

  const ordersPage = document.getElementById("orders-page");
  const ordersList = document.getElementById("orders-list");
  const noOrdersMessage = ordersPage.querySelector(".no-orders-msg");

  const menuViewBtn = document.getElementById("menu-view-btn");
  const ordersViewBtn = document.getElementById("orders-view-btn");

  // Cart state: [{ id, qty, spiceLevel }]
  let cart = [];

  // LocalStorage keys
  const STORAGE_CART_KEY = "canteenConnect_cart";
  const STORAGE_ORDERS_KEY = "canteenConnect_orders";

  // Format price as "$xx.xx"
  const formatPrice = price => "$" + price.toFixed(2);

  // Show toast notification message for 2.5 seconds
  function showToast(message) {
    toastElem.textContent = message;
    toastElem.classList.add("show");
    setTimeout(() => toastElem.classList.remove("show"), 2500);
  }

  // Save cart state to localStorage
  function saveCart() {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
  }

  // Load cart state from localStorage
  function loadCart() {
    const stored = localStorage.getItem(STORAGE_CART_KEY);
    cart = stored ? JSON.parse(stored) : [];
  }

  // Save orders to localStorage
  function saveOrders(orders) {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  }

  // Load orders from localStorage
  function loadOrders() {
    const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Find menu item by id
  function findMenuItemById(id) {
    return menuItems.find(item => item.id === id);
  }

  // Calculate total cart value
  function calculateCartTotal() {
    return cart.reduce((total, ci) => {
      const item = findMenuItemById(ci.id);
      return item ? total + item.price * ci.qty : total;
    }, 0);
  }

  // Render menu section with filters and search
  function renderMenu() {
    menuSection.innerHTML = "";

    // Filter items by inputs
    const filteredItems = menuItems.filter(item => {
      if (filterCategory.value !== "all" && item.category !== filterCategory.value) return false;
      if (filterVeg.value === "veg" && !item.veg) return false;
      if (filterVeg.value === "nonveg" && item.veg) return false;
      if (filterPrice.value === "low" && item.price >= 50) return false;
      if (filterPrice.value === "mid" && (item.price < 50 || item.price > 100)) return false;
      if (filterPrice.value === "high" && item.price <= 100) return false;
      if (searchBar.value.trim() && !item.name.toLowerCase().includes(searchBar.value.trim().toLowerCase())) return false;
      return true;
    });

    // Group by category
    const grouped = {};
    filteredItems.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    // Render each category and items
    Object.keys(grouped).forEach(category => {
      const categorySection = document.createElement("section");
      categorySection.className = "category-section";
      categorySection.setAttribute("aria-label", category + " category");

      const heading = document.createElement("h2");
      heading.textContent = category;
      categorySection.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "items-grid";

      grouped[category].forEach(item => {
        const el = document.createElement("article");
        el.className = "menu-item";
        el.tabIndex = 0;
        el.innerHTML = `
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="menu-content">
            <h3>${item.name} <span>${item.veg ? "🌿" : "🍗"}</span></h3>
            <p class="description">${item.description}</p>
            <label for="spice-${item.id}">Spice Level:</label>
            <select id="spice-${item.id}" aria-label="Select spice level for ${item.name}">
              ${
                item.spiceLevel.length > 0
                  ? item.spiceLevel.map(lvl => `<option value="${lvl}">${lvl}</option>`).join("")
                  : `<option value="N/A">N/A</option>`
              }
            </select>
            <div class="price-and-actions">
              <span class="price">${formatPrice(item.price)}</span>
              <button class="add-btn" data-id="${item.id}" aria-label="Add ${item.name} to cart">Add</button>
            </div>
          </div>
        `;

        grid.appendChild(el);
      });

      categorySection.appendChild(grid);
      menuSection.appendChild(categorySection);
    });

    if (filteredItems.length === 0) {
      const noItems = document.createElement("p");
      noItems.textContent = "No items found matching your search or filters.";
      noItems.className = "no-items-message";
      menuSection.appendChild(noItems);
    }
  }

  // Render cart sidebar content
  function renderCart() {
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      cartItemsContainer.textContent = "Your cart is empty.";
      placeOrderBtn.disabled = true;
      placeOrderBtn.setAttribute("aria-disabled", "true");
      cartTotalElem.textContent = formatPrice(0);
      cartCountElem.textContent = "0";
      return;
    }

    cart.forEach(ci => {
      const item = findMenuItemById(ci.id);
      if (!item) return;
      const div = document.createElement("div");
      div.className = "cart-item";

      const spiceText = ci.spiceLevel && ci.spiceLevel !== "N/A" ? `, Spice: ${ci.spiceLevel}` : "";

      div.innerHTML = `
        <div class="cart-item-info">
          <h4 title="${item.name}">${item.name}</h4>
          <small>${formatPrice(item.price)} × ${ci.qty}${spiceText}</small>
        </div>
        <div class="cart-item-actions">
          <button class="decrease" data-id="${ci.id}" data-spice="${ci.spiceLevel}" aria-label="Decrease quantity for ${item.name}">−</button>
          <div class="cart-item-qty" aria-live="polite" aria-atomic="true">${ci.qty}</div>
          <button class="increase" data-id="${ci.id}" data-spice="${ci.spiceLevel}" aria-label="Increase quantity for ${item.name}">+</button>
          <button class="remove" data-id="${ci.id}" data-spice="${ci.spiceLevel}" aria-label="Remove ${item.name} from cart">×</button>
        </div>
      `;
      cartItemsContainer.appendChild(div);
    });

    const total = calculateCartTotal();
    cartTotalElem.textContent = formatPrice(total);
    cartCountElem.textContent = cart.reduce((acc, i) => acc + i.qty, 0);
    placeOrderBtn.disabled = false;
    placeOrderBtn.removeAttribute("aria-disabled");
  }

  // Add item to cart (or increment qty) with spiceLevel
  function addToCart(id) {
    const item = findMenuItemById(id);
    if (!item) return;

    const spiceSelect = document.getElementById(`spice-${id}`);
    const spiceLevel = spiceSelect ? spiceSelect.value : "N/A";

    // Check existing with same spiceLevel
    const idx = cart.findIndex(ci => ci.id === id && ci.spiceLevel === spiceLevel);
    if (idx >= 0) {
      cart[idx].qty++;
    } else {
      cart.push({ id, qty: 1, spiceLevel });
    }
    saveCart();
    renderCart();
    showToast(`${item.name} added to cart.`);
  }

  // Increase qty of cart item
  function increaseQty(id, spiceLevel) {
    const idx = cart.findIndex(ci => ci.id === id && ci.spiceLevel === spiceLevel);
    if (idx < 0) return;
    cart[idx].qty++;
    saveCart();
    renderCart();
  }

  // Decrease qty or remove if qty = 1
  function decreaseQty(id, spiceLevel) {
    const idx = cart.findIndex(ci => ci.id === id && ci.spiceLevel === spiceLevel);
    if (idx < 0) return;
    if (cart[idx].qty > 1) {
      cart[idx].qty--;
    } else {
      cart.splice(idx, 1);
    }
    saveCart();
    renderCart();
  }

  // Remove item from cart
  function removeItem(id, spiceLevel) {
    const idx = cart.findIndex(ci => ci.id === id && ci.spiceLevel === spiceLevel);
    if (idx < 0) return;
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  }

  // Toggle cart sidebar visibility
  function toggleCartSidebar() {
    cartSidebar.classList.toggle("active");
  }

  // Place order: save to localStorage, clear cart, show modal, switch to orders
  function placeOrder() {
    if (cart.length === 0) return;

    const orders = loadOrders();

    const orderItems = cart.map(ci => {
      const item = findMenuItemById(ci.id);
      return {
        id: ci.id,
        name: item.name,
        price: item.price,
        qty: ci.qty,
        spiceLevel: ci.spiceLevel
      };
    });

    const timestamp = Date.now();
    const newOrder = {
      id: "ORD" + timestamp,
      items: orderItems,
      totalPrice: calculateCartTotal(),
      status: "Preparing",
      placedAt: timestamp
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    // Clear cart
    cart = [];
    saveCart();
    renderCart();

    // Show modal confirmation
    modalElem.hidden = false;
    modalCloseBtn.focus();

    // Hide cart sidebar
    cartSidebar.classList.remove("active");

    renderOrdersPage();
    switchToOrdersPage();
  }

  // Render orders page content
  function renderOrdersPage() {
    ordersList.innerHTML = "";
    const orders = loadOrders();

    if (orders.length === 0) {
      noOrdersMessage.hidden = false;
      return;
    } else {
      noOrdersMessage.hidden = true;
    }

    orders.forEach(order => {
      const card = document.createElement("article");
      card.className = "order-card";

      const orderDate = new Date(order.placedAt).toLocaleString();

      const itemsHtml = order.items.map(i => {
        const spiceText = i.spiceLevel && i.spiceLevel !== "N/A" ? `, Spice: ${i.spiceLevel}` : "";
        return `<li>${i.name} (x${i.qty})${spiceText} - ${formatPrice(i.price * i.qty)}</li>`;
      }).join("");

      card.innerHTML = `
        <header class="order-header">
          <span><strong>Order ID:</strong> ${order.id}</span>
          <span><strong>Date:</strong> ${orderDate}</span>
          <span class="order-status">${order.status}</span>
        </header>
        <ul class="order-items-list">${itemsHtml}</ul>
        <div class="order-total">Total Paid: ${formatPrice(order.totalPrice)}</div>
      `;

      ordersList.appendChild(card);
    });
  }

  // View switching: menu or orders
  function switchToOrdersPage() {
    ordersPage.hidden = false;
    menuSection.style.display = "none";
    document.getElementById("search-filter").style.display = "none";

    ordersViewBtn.classList.add("active");
    ordersViewBtn.setAttribute("aria-pressed", "true");
    menuViewBtn.classList.remove("active");
    menuViewBtn.setAttribute("aria-pressed", "false");
  }
  function switchToMenuPage() {
    ordersPage.hidden = true;
    menuSection.style.display = "";
    document.getElementById("search-filter").style.display = "";

    menuViewBtn.classList.add("active");
    menuViewBtn.setAttribute("aria-pressed", "true");
    ordersViewBtn.classList.remove("active");
    ordersViewBtn.setAttribute("aria-pressed", "false");
  }

  // Attach all event listeners
  function addEventListeners() {
    // Add to cart buttons (delegation)
    menuSection.addEventListener("click", e => {
      if (e.target.classList.contains("add-btn")) {
        const id = Number(e.target.dataset.id);
        addToCart(id);
      }
    });

    // Cart icon click toggles sidebar
    cartIcon.addEventListener("click", toggleCartSidebar);
    cartIcon.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCartSidebar();
      }
    });

    // Cart increase, decrease, remove buttons (delegation)
    cartItemsContainer.addEventListener("click", e => {
      const target = e.target;
      if (!target.dataset.id) return;
      const id = Number(target.dataset.id);
      const spiceLevel = target.dataset.spice || "N/A";

      switch (true) {
        case target.classList.contains("increase"):
          increaseQty(id, spiceLevel);
          break;
        case target.classList.contains("decrease"):
          decreaseQty(id, spiceLevel);
          break;
        case target.classList.contains("remove"):
          removeItem(id, spiceLevel);
          break;
      }
    });

    // Place order button
    placeOrderBtn.addEventListener("click", placeOrder);

    // Modal close button
    modalCloseBtn.addEventListener("click", () => {
      modalElem.hidden = true;
      menuViewBtn.focus();
    });

    // Search and filters input
    [searchBar, filterCategory, filterVeg, filterPrice].forEach(el => {
      el.addEventListener("input", () => {
        if (ordersPage.hidden) {
          renderMenu();
        }
      });
    });

    // Menu and Orders nav buttons
    menuViewBtn.addEventListener("click", switchToMenuPage);
    ordersViewBtn.addEventListener("click", switchToOrdersPage);

    // Close modal on ESC key
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modalElem.hidden) {
        modalElem.hidden = true;
        menuViewBtn.focus();
      }
    });
  }

  // Initialization
  function init() {
    loadCart();
    renderMenu();
    renderCart();
    renderOrdersPage();
    addEventListeners();
  }

  window.addEventListener("DOMContentLoaded", init);
})();
