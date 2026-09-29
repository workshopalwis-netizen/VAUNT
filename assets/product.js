/**
 * VAUNT ATELIER - PRODUCT DETAIL PAGE ENGINE
 * Gallery thumbnail switching, variant selection, sticky mobile ATC, accordions
 */

(function () {
  'use strict';

  const ProductApp = {
    currentProduct: null,
    selectedSize: 'M',
    selectedColor: '',
    quantity: 1,

    init: function () {
      if (window.Vaunt && window.Vaunt.catalog && window.Vaunt.catalog.length > 0) {
        this.loadProduct();
      } else {
        document.addEventListener('vaunt:catalog-loaded', () => {
          this.loadProduct();
        });
      }
    },

    loadProduct: function () {
      const params = new URLSearchParams(window.location.search);
      const handle = params.get('id') || 'oversized-heavyweight-fleece-hoodie';

      this.currentProduct = window.Vaunt.catalog.find(p => p.handle === handle || p.id === handle);
      if (!this.currentProduct) {
        this.currentProduct = window.Vaunt.catalog[0];
      }

      if (this.currentProduct) {
        this.selectedSize = this.currentProduct.sizes[0] || 'M';
        this.selectedColor = this.currentProduct.colors[0]?.name || 'Default';
        this.renderPDP();
        this.renderRecommendations();
        this.bindEvents();
      }
    },

    renderPDP: function () {
      const p = this.currentProduct;
      document.title = `${p.title} — VAUNT ATELIER`;

      // Breadcrumb title
      const bcProduct = document.getElementById('breadcrumbProductTitle');
      if (bcProduct) bcProduct.textContent = p.title;

      // Gallery Thumbnails & Main Image
      const mainImg = document.getElementById('pdpMainImage');
      const thumbsContainer = document.getElementById('pdpThumbnails');
      if (mainImg) {
        mainImg.src = p.primary_image;
        mainImg.alt = p.title;
      }

      if (thumbsContainer && p.gallery) {
        thumbsContainer.innerHTML = p.gallery.map((imgSrc, i) => `
          <button type="button" class="pdp-thumb-btn ${i === 0 ? 'is-active' : ''}" data-index="${i}" onclick="ProductApp.switchImage('${imgSrc}', this)">
            <img src="${imgSrc}" alt="${p.title} view ${i + 1}" loading="lazy">
          </button>
        `).join('');
      }

      // Details
      const titleEl = document.getElementById('pdpTitle');
      if (titleEl) titleEl.textContent = p.title;

      const reviewsEl = document.getElementById('pdpReviewCount');
      if (reviewsEl) reviewsEl.textContent = `(${p.reviews_count} reviews)`;

      const priceEl = document.getElementById('pdpPrice');
      if (priceEl) priceEl.textContent = `LKR ${p.price.toLocaleString('en-US')}`;

      const compareEl = document.getElementById('pdpComparePrice');
      if (compareEl) {
        if (p.compare_at_price) {
          compareEl.textContent = `LKR ${p.compare_at_price.toLocaleString('en-US')}`;
          compareEl.style.display = 'inline-block';
        } else {
          compareEl.style.display = 'none';
        }
      }

      const discountEl = document.getElementById('pdpDiscountBadge');
      if (discountEl && p.compare_at_price) {
        const pct = Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100);
        discountEl.textContent = `SAVE ${pct}%`;
        discountEl.style.display = 'inline-block';
      }

      // Color Swatches
      const colorContainer = document.getElementById('pdpColorSwatches');
      const colorLabel = document.getElementById('pdpSelectedColorText');
      if (colorLabel) colorLabel.textContent = this.selectedColor;

      if (colorContainer && p.colors) {
        colorContainer.innerHTML = p.colors.map((c, i) => `
          <button type="button" class="color-swatch-btn ${i === 0 ? 'is-active' : ''}" data-color="${c.name}" onclick="ProductApp.selectColor(this, '${c.name}')" title="${c.name}">
            <span style="background-color: ${c.hex};"></span>
          </button>
        `).join('');
      }

      // Size Options
      const sizeContainer = document.getElementById('pdpSizeOptions');
      if (sizeContainer && p.sizes) {
        sizeContainer.innerHTML = p.sizes.map((s, i) => `
          <button type="button" class="size-btn ${i === 0 ? 'is-active' : ''}" data-size="${s}" onclick="ProductApp.selectSize(this, '${s}')">
            ${s}
          </button>
        `).join('');
      }

      // Description & Details
      const descEl = document.getElementById('pdpDescription');
      if (descEl) descEl.textContent = p.description;

      const detailsList = document.getElementById('pdpDetailsList');
      if (detailsList && p.details) {
        detailsList.innerHTML = p.details.map(item => `<li>${item}</li>`).join('');
      }

      // Sticky Bar Updates
      const stickyTitle = document.getElementById('stickyBarTitle');
      const stickyPrice = document.getElementById('stickyBarPrice');
      const stickyImg = document.getElementById('stickyBarImg');
      if (stickyTitle) stickyTitle.textContent = p.title;
      if (stickyPrice) stickyPrice.textContent = `LKR ${p.price.toLocaleString('en-US')}`;
      if (stickyImg) stickyImg.src = p.primary_image;

      // Update wishlist button state
      const wishBtn = document.getElementById('pdpWishlistBtn');
      if (wishBtn && window.Vaunt) {
        wishBtn.setAttribute('data-wishlist-id', p.id);
        if (window.Vaunt.isWishlisted(p.id)) {
          wishBtn.classList.add('is-active');
        }
      }
    },

    switchImage: function (imgSrc, btn) {
      const mainImg = document.getElementById('pdpMainImage');
      if (mainImg) {
        mainImg.style.opacity = '0.5';
        mainImg.src = imgSrc;
        setTimeout(() => mainImg.style.opacity = '1', 150);
      }
      document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    },

    selectColor: function (btn, colorName) {
      document.querySelectorAll('#pdpColorSwatches .color-swatch-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      this.selectedColor = colorName;
      const label = document.getElementById('pdpSelectedColorText');
      if (label) label.textContent = colorName;
    },

    selectSize: function (btn, size) {
      document.querySelectorAll('#pdpSizeOptions .size-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      this.selectedSize = size;
    },

    updateQty: function (delta) {
      this.quantity = Math.max(1, this.quantity + delta);
      const input = document.getElementById('pdpQtyInput');
      if (input) input.value = this.quantity;
    },

    addToCart: function () {
      if (!this.currentProduct) return;
      window.Vaunt.addToCart(this.currentProduct.id, this.selectedSize, this.selectedColor, this.quantity);
    },

    buyNow: function () {
      this.addToCart();
      window.location.href = 'cart.html';
    },

    renderRecommendations: function () {
      const recsGrid = document.getElementById('recommendedProductGrid');
      if (!recsGrid || !window.Vaunt.catalog) return;

      const recommendations = window.Vaunt.catalog
        .filter(p => p.id !== this.currentProduct.id)
        .slice(0, 4);

      recsGrid.innerHTML = recommendations.map(p => `
        <div class="product-card">
          <div class="product-card-media">
            <a href="product.html?id=${p.handle}">
              <img src="${p.primary_image}" alt="${p.title}" class="product-card-image primary" loading="lazy">
              <img src="${p.secondary_image}" alt="${p.title}" class="product-card-image secondary" loading="lazy">
            </a>
            <div class="product-card-actions">
              <button type="button" class="btn-quickadd" data-product-id="${p.id}">Quick Add</button>
              <button type="button" class="btn-quickview" data-quickview-id="${p.id}">Quick View</button>
            </div>
          </div>
          <div class="product-card-content">
            <h4 class="product-card-title"><a href="product.html?id=${p.handle}">${p.title}</a></h4>
            <div class="product-card-pricing">
              <span class="product-price">LKR ${p.price.toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>
      `).join('');
    },

    bindEvents: function () {
      const atcBtn = document.getElementById('pdpAddToCartBtn');
      atcBtn?.addEventListener('click', () => this.addToCart());

      const buyNowBtn = document.getElementById('pdpBuyNowBtn');
      buyNowBtn?.addEventListener('click', () => this.buyNow());

      const stickyAtc = document.getElementById('stickyBarAddToCartBtn');
      stickyAtc?.addEventListener('click', () => this.addToCart());

      // Sticky bar scroll observer
      const stickyBar = document.getElementById('pdpStickyBar');
      window.addEventListener('scroll', () => {
        if (!stickyBar) return;
        const atcRect = atcBtn?.getBoundingClientRect();
        if (atcRect && atcRect.bottom < 0) {
          stickyBar.classList.add('is-visible');
        } else {
          stickyBar.classList.remove('is-visible');
        }
      }, { passive: true });
    }
  };

  window.ProductApp = ProductApp;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductApp.init());
  } else {
    ProductApp.init();
  }
})();
