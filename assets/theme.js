/**
 * VAUNT ATELIER - THEME ENGINE
 * Central store coordinator, Cart Drawer, Wishlist, Quick View, Toasts, Header
 */

(function () {
  'use strict';

  // State Configuration
  const FREE_SHIPPING_THRESHOLD = 10000; // LKR 10,000
  let catalog = [];

  // LocalStorage Keys
  const STORAGE_CART_KEY = 'vaunt_cart_items_v1';
  const STORAGE_WISHLIST_KEY = 'vaunt_wishlist_items_v1';

  // Global Store Object
  window.Vaunt = {
    cart: [],
    wishlist: [],
    catalog: [],

    init: async function () {
      this.loadCatalog();
      this.initCart();
      this.initWishlist();
      this.bindGlobalEvents();
      this.initHeader();
      this.initQuickView();
      this.initSearch();
      this.initAccordions();
    },

    // ----------------------------------------------------
    // CATALOG LOADER
    // ----------------------------------------------------
    loadCatalog: async function () {
      // First check if catalog data is already embedded in memory
      if (window.VAUNT_CATALOG_DATA && window.VAUNT_CATALOG_DATA.length > 0) {
        this.catalog = [...window.VAUNT_CATALOG_DATA];
        catalog = this.catalog;
        document.dispatchEvent(new CustomEvent('vaunt:catalog-loaded', { detail: this.catalog }));
        return;
      }

      try {
        const res = await fetch('data/products.json');
        if (res.ok) {
          this.catalog = await res.json();
          catalog = this.catalog;
          document.dispatchEvent(new CustomEvent('vaunt:catalog-loaded', { detail: this.catalog }));
        }
      } catch (err) {
        console.warn('Could not load products.json directly, fallback available:', err);
      }
    },

    getProductById: function (id) {
      return this.catalog.find(p => p.id === id || p.handle === id);
    },

    // ----------------------------------------------------
    // FORMATTING HELPERS
    // ----------------------------------------------------
    formatMoney: function (centsOrAmount) {
      const num = Number(centsOrAmount);
      return 'LKR ' + num.toLocaleString('en-US');
    },

    // ----------------------------------------------------
    // CART ENGINE
    // ----------------------------------------------------
    initCart: function () {
      try {
        const stored = localStorage.getItem(STORAGE_CART_KEY);
        this.cart = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.cart = [];
      }
      this.updateCartUI();
    },

    saveCart: function () {
      try {
        localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(this.cart));
      } catch (e) {
        console.error('Storage error', e);
      }
      this.updateCartUI();
    },

    addToCart: function (productId, size, color, quantity = 1) {
      const product = this.getProductById(productId);
      if (!product) return;

      const selectedSize = size || (product.sizes && product.sizes[0]) || 'M';
      const selectedColor = color || (product.colors && product.colors[0].name) || 'Default';

      const existingIndex = this.cart.findIndex(
        item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existingIndex > -1) {
        this.cart[existingIndex].quantity += quantity;
      } else {
        this.cart.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          price: product.price,
          compare_at_price: product.compare_at_price,
          image: product.primary_image,
          size: selectedSize,
          color: selectedColor,
          quantity: quantity
        });
      }

      this.saveCart();
      this.openCartDrawer();
      this.showToast(`Added "${product.title}" (${selectedSize}) to cart`);
    },

    updateQuantity: function (index, delta) {
      if (this.cart[index]) {
        this.cart[index].quantity += delta;
        if (this.cart[index].quantity <= 0) {
          this.cart.splice(index, 1);
        }
        this.saveCart();
      }
    },

    removeFromCart: function (index) {
      if (this.cart[index]) {
        const title = this.cart[index].title;
        this.cart.splice(index, 1);
        this.saveCart();
        this.showToast(`Removed "${title}" from cart`);
      }
    },

    getCartSubtotal: function () {
      return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getCartCount: function () {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },

    updateCartUI: function () {
      const count = this.getCartCount();
      const subtotal = this.getCartSubtotal();

      // Header Badges
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(badge => {
        badge.textContent = count;
        if (count > 0) {
          badge.classList.remove('is-empty');
        } else {
          badge.classList.add('is-empty');
        }
      });

      // Free Shipping Progress
      const shippingBar = document.querySelector('.shipping-progress-fill');
      const shippingText = document.querySelector('.shipping-progress-text');
      if (shippingBar && shippingText) {
        const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingBar.style.width = pct + '%';

        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
          shippingBar.classList.add('is-qualified');
          shippingText.innerHTML = `🎉 <strong>Congratulations!</strong> You have unlocked <strong>FREE SHIPPING</strong>!`;
        } else {
          shippingBar.classList.remove('is-qualified');
          const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
          shippingText.innerHTML = `You are <strong>${this.formatMoney(remaining)}</strong> away from <strong>FREE SHIPPING</strong>`;
        }
      }

      // Render Items in Drawer
      const itemsContainer = document.querySelector('.cart-items-list');
      const emptyState = document.querySelector('.cart-empty');
      const subtotalDisplay = document.querySelector('.cart-subtotal-amount');

      if (subtotalDisplay) {
        subtotalDisplay.textContent = this.formatMoney(subtotal);
      }

      if (itemsContainer && emptyState) {
        if (this.cart.length === 0) {
          itemsContainer.innerHTML = '';
          emptyState.style.display = 'flex';
          itemsContainer.style.display = 'none';
        } else {
          emptyState.style.display = 'none';
          itemsContainer.style.display = 'flex';
          itemsContainer.innerHTML = this.cart.map((item, idx) => `
            <div class="cart-item" data-index="${idx}">
              <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
              </div>
              <div class="cart-item-info">
                <div>
                  <h4 class="cart-item-title">${item.title}</h4>
                  <div class="cart-item-variant">${item.color} / ${item.size}</div>
                  <div class="cart-item-price">${this.formatMoney(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                  <div class="quantity-control">
                    <button type="button" class="qty-btn" onclick="Vaunt.updateQuantity(${idx}, -1)" aria-label="Decrease quantity">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                    <input type="text" class="qty-input" value="${item.quantity}" readonly>
                    <button type="button" class="qty-btn" onclick="Vaunt.updateQuantity(${idx}, 1)" aria-label="Increase quantity">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                  <button type="button" class="cart-item-remove" onclick="Vaunt.removeFromCart(${idx})">Remove</button>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    },

    openCartDrawer: function () {
      const drawer = document.getElementById('cartDrawer');
      if (drawer) {
        drawer.classList.add('is-open');
        document.body.classList.add('drawer-open');
      }
    },

    closeCartDrawer: function () {
      const drawer = document.getElementById('cartDrawer');
      if (drawer) {
        drawer.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      }
    },

    // ----------------------------------------------------
    // WISHLIST ENGINE
    // ----------------------------------------------------
    initWishlist: function () {
      try {
        const stored = localStorage.getItem(STORAGE_WISHLIST_KEY);
        this.wishlist = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.wishlist = [];
      }
      this.updateWishlistUI();
    },

    saveWishlist: function () {
      try {
        localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(this.wishlist));
      } catch (e) {}
      this.updateWishlistUI();
    },

    toggleWishlist: function (productId) {
      const index = this.wishlist.indexOf(productId);
      const product = this.getProductById(productId);
      const title = product ? product.title : 'Item';

      if (index > -1) {
        this.wishlist.splice(index, 1);
        this.showToast(`Removed "${title}" from wishlist`);
      } else {
        this.wishlist.push(productId);
        this.showToast(`Saved "${title}" to wishlist`, 'accent');
      }
      this.saveWishlist();
    },

    isWishlisted: function (productId) {
      return this.wishlist.includes(productId);
    },

    updateWishlistUI: function () {
      const count = this.wishlist.length;
      const badges = document.querySelectorAll('.wishlist-badge');
      badges.forEach(b => {
        b.textContent = count;
        if (count > 0) b.classList.remove('is-empty');
        else b.classList.add('is-empty');
      });

      // Update any heart icons on the page
      document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
        const id = btn.getAttribute('data-wishlist-id');
        if (this.isWishlisted(id)) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
    },

    // ----------------------------------------------------
    // HEADER & MOBILE DRAWER
    // ----------------------------------------------------
    initHeader: function () {
      const headerWrapper = document.querySelector('.site-header-wrapper');
      const announcementBar = document.querySelector('.announcement-bar');
      const announcementClose = document.querySelector('.announcement-bar-close');

      // Scroll listener for sticky header styling
      window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
          headerWrapper?.classList.add('is-scrolled');
        } else {
          headerWrapper?.classList.remove('is-scrolled');
        }
      }, { passive: true });

      // Dismiss announcement bar
      if (announcementClose && announcementBar) {
        announcementClose.addEventListener('click', () => {
          announcementBar.classList.add('is-hidden');
        });
      }

      // Mobile Menu Drawer
      const mobileTrigger = document.querySelector('.mobile-menu-trigger');
      const mobileDrawer = document.getElementById('mobileNavDrawer');
      const mobileClose = document.querySelector('.mobile-nav-close');
      const mobileBackdrop = document.querySelector('.mobile-nav-backdrop');

      const openMobile = () => {
        mobileDrawer?.classList.add('is-open');
        document.body.classList.add('drawer-open');
      };

      const closeMobile = () => {
        mobileDrawer?.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      };

      mobileTrigger?.addEventListener('click', openMobile);
      mobileClose?.addEventListener('click', closeMobile);
      mobileBackdrop?.addEventListener('click', closeMobile);

      // Accordion in Mobile Drawer
      document.querySelectorAll('.mobile-nav-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const item = btn.closest('.mobile-nav-item');
          if (item) {
            item.classList.toggle('is-expanded');
          }
        });
      });
    },

    // ----------------------------------------------------
    // TOAST NOTIFICATIONS
    // ----------------------------------------------------
    showToast: function (message, type = 'normal') {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type === 'accent' ? 'toast-accent' : ''}`;
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3200);
    },

    // ----------------------------------------------------
    // QUICK VIEW MODAL
    // ----------------------------------------------------
    initQuickView: function () {
      const modal = document.getElementById('quickViewModal');
      const closeBtn = modal?.querySelector('.modal-close-btn');
      const backdrop = modal?.querySelector('.modal-backdrop');

      const closeModal = () => {
        modal?.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      };

      closeBtn?.addEventListener('click', closeModal);
      backdrop?.addEventListener('click', closeModal);

      // Listen for quickview clicks
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-quickview-id]');
        if (trigger) {
          e.preventDefault();
          const prodId = trigger.getAttribute('data-quickview-id');
          this.openQuickView(prodId);
        }
      });
    },

    openQuickView: function (productId) {
      const product = this.getProductById(productId);
      if (!product) return;

      const modal = document.getElementById('quickViewModal');
      const body = modal?.querySelector('.quickview-info');
      const gallery = modal?.querySelector('.quickview-gallery');

      if (gallery) {
        gallery.innerHTML = `
          <img src="${product.primary_image}" alt="${product.title}" id="quickViewImg">
        `;
      }

      if (body) {
        body.innerHTML = `
          <div class="product-card-rating">
            <span class="rating-stars">★★★★★</span>
            <span>(${product.reviews_count} reviews)</span>
          </div>
          <h2 class="editorial-title" style="font-size: 1.5rem; margin-bottom: 4px;">${product.title}</h2>
          <div class="product-card-pricing" style="margin-bottom: 12px;">
            <span class="product-price" style="font-size: 1.25rem;">${this.formatMoney(product.price)}</span>
            ${product.compare_at_price ? `<span class="product-price-compare">${this.formatMoney(product.compare_at_price)}</span>` : ''}
          </div>
          <p style="font-size: 0.875rem; color: var(--color-foreground-muted); line-height: 1.6;">${product.description}</p>
          
          <div class="variant-option-group" style="margin-top: 12px;">
            <div class="variant-label">
              <span>COLOR: <strong id="qvSelectedColor">${product.colors[0].name}</strong></span>
            </div>
            <div class="color-swatches">
              ${product.colors.map((c, i) => `
                <button type="button" class="color-swatch-btn ${i === 0 ? 'is-active' : ''}" data-color="${c.name}" onclick="Vaunt.setQVColor(this, '${c.name}')" title="${c.name}">
                  <span style="background-color: ${c.hex}"></span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="variant-option-group" style="margin-top: 12px;">
            <div class="variant-label">
              <span>SELECT SIZE</span>
              <button type="button" onclick="Vaunt.openSizeGuide()" style="text-decoration: underline; font-size: 11px; text-transform: uppercase;">Size Guide</button>
            </div>
            <div class="size-options">
              ${product.sizes.map((s, i) => `
                <button type="button" class="size-btn ${i === 1 || i === 0 ? 'is-active' : ''}" data-size="${s}" onclick="Vaunt.setQVSize(this, '${s}')">
                  ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-primary btn-block" onclick="Vaunt.addQVToCart('${product.id}')">
              ADD TO CART
            </button>
          </div>

          <a href="product.html?id=${product.handle}" style="display: block; text-align: center; font-size: 12px; text-decoration: underline; text-transform: uppercase; font-weight: 600; margin-top: 8px;">
            View Full Product Details →
          </a>
        `;
      }

      modal?.classList.add('is-open');
      document.body.classList.add('drawer-open');
    },

    setQVColor: function (btn, color) {
      btn.closest('.color-swatches').querySelectorAll('.color-swatch-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById('qvSelectedColor').textContent = color;
    },

    setQVSize: function (btn, size) {
      btn.closest('.size-options').querySelectorAll('.size-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    },

    addQVToCart: function (productId) {
      const activeSizeBtn = document.querySelector('.quickview-info .size-btn.is-active');
      const activeColorBtn = document.querySelector('.quickview-info .color-swatch-btn.is-active');

      const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'M';
      const color = activeColorBtn ? activeColorBtn.getAttribute('data-color') : 'Default';

      this.addToCart(productId, size, color, 1);
      document.getElementById('quickViewModal')?.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
    },

    // ----------------------------------------------------
    // FULLSCREEN SEARCH OVERLAY
    // ----------------------------------------------------
    initSearch: function () {
      const overlay = document.getElementById('searchOverlay');
      const openTriggers = document.querySelectorAll('.search-trigger');
      const closeBtn = document.querySelector('.search-close-btn');
      const searchInput = document.getElementById('mainSearchInput');
      const resultsContainer = document.getElementById('searchResultsGrid');
      const clearBtn = document.querySelector('.search-clear-btn');

      const openSearch = (e) => {
        e?.preventDefault();
        overlay?.classList.add('is-open');
        document.body.classList.add('drawer-open');
        setTimeout(() => searchInput?.focus(), 100);
      };

      const closeSearch = () => {
        overlay?.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      };

      openTriggers.forEach(t => t.addEventListener('click', openSearch));
      closeBtn?.addEventListener('click', closeSearch);
      clearBtn?.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          renderResults('');
        }
      });

      // Keystroke live search
      searchInput?.addEventListener('input', (e) => {
        renderResults(e.target.value.trim());
      });

      const renderResults = (query) => {
        if (!resultsContainer) return;

        if (!query) {
          resultsContainer.innerHTML = '';
          return;
        }

        const q = query.toLowerCase();
        const matches = this.catalog.filter(p => 
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q) ||
          (p.gender && p.gender.toLowerCase().includes(q))
        );

        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0; color: var(--color-foreground-muted);">
              <p>No pieces found matching "<strong>${query}</strong>".</p>
              <p style="font-size: 13px; margin-top: 6px;">Try searching for "hoodie", "cargo", "wool", or "blazer".</p>
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = matches.map(p => `
          <div class="product-card">
            <div class="product-card-media">
              <a href="product.html?id=${p.handle}">
                <img src="${p.primary_image}" alt="${p.title}" class="product-card-image primary" loading="lazy">
              </a>
            </div>
            <div class="product-card-content">
              <h4 class="product-card-title"><a href="product.html?id=${p.handle}">${p.title}</a></h4>
              <div class="product-card-pricing">
                <span class="product-price">${this.formatMoney(p.price)}</span>
              </div>
            </div>
          </div>
        `).join('');
      };

      // Search tags quick fill
      document.querySelectorAll('.search-tag').forEach(tag => {
        tag.addEventListener('click', () => {
          const val = tag.getAttribute('data-tag');
          if (searchInput) {
            searchInput.value = val;
            searchInput.dispatchEvent(new Event('input'));
          }
        });
      });
    },

    // ----------------------------------------------------
    // SIZE GUIDE MODAL
    // ----------------------------------------------------
    openSizeGuide: function () {
      const modal = document.getElementById('sizeGuideModal');
      if (modal) {
        modal.classList.add('is-open');
        document.body.classList.add('drawer-open');
      }
    },

    closeSizeGuide: function () {
      const modal = document.getElementById('sizeGuideModal');
      if (modal) {
        modal.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
      }
    },

    // ----------------------------------------------------
    // ACCORDIONS
    // ----------------------------------------------------
    initAccordions: function () {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.accordion-trigger');
        if (trigger) {
          const item = trigger.closest('.accordion-item');
          if (item) {
            item.classList.toggle('is-open');
          }
        }
      });
    },

    // ----------------------------------------------------
    // GLOBAL EVENTS
    // ----------------------------------------------------
    bindGlobalEvents: function () {
      // Cart drawer triggers
      document.querySelectorAll('.cart-drawer-trigger').forEach(b => {
        b.addEventListener('click', (e) => {
          e.preventDefault();
          this.openCartDrawer();
        });
      });

      const cartCloseBtn = document.querySelector('.cart-close-btn');
      const cartBackdrop = document.querySelector('.cart-backdrop');
      cartCloseBtn?.addEventListener('click', () => this.closeCartDrawer());
      cartBackdrop?.addEventListener('click', () => this.closeCartDrawer());

      // Newsletter forms
      document.querySelectorAll('.newsletter-form').forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = form.querySelector('.newsletter-input');
          if (input && input.value) {
            this.showToast(`Thank you for subscribing! Check ${input.value} for your welcome offer.`, 'accent');
            input.value = '';
          }
        });
      });

      // Quick Add Button Click (toggles in-card sizes or adds standard)
      document.addEventListener('click', (e) => {
        const quickAddBtn = e.target.closest('.btn-quickadd');
        if (quickAddBtn) {
          e.preventDefault();
          const card = quickAddBtn.closest('.product-card');
          const popover = card?.querySelector('.card-quick-sizes');
          if (popover) {
            popover.classList.toggle('is-open');
          } else {
            const prodId = quickAddBtn.getAttribute('data-product-id');
            this.addToCart(prodId, 'M', 'Default', 1);
          }
        }

        // Quick Size Pill Click
        const sizePill = e.target.closest('.quick-size-btn');
        if (sizePill) {
          e.preventDefault();
          const prodId = sizePill.getAttribute('data-product-id');
          const size = sizePill.getAttribute('data-size');
          this.addToCart(prodId, size, 'Default', 1);
          sizePill.closest('.card-quick-sizes')?.classList.remove('is-open');
        }

        // Card Wishlist Click
        const wishlistBtn = e.target.closest('.product-card-wishlist');
        if (wishlistBtn) {
          e.preventDefault();
          const prodId = wishlistBtn.getAttribute('data-wishlist-id');
          this.toggleWishlist(prodId);
        }
      });
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.Vaunt.init());
  } else {
    window.Vaunt.init();
  }
})();
