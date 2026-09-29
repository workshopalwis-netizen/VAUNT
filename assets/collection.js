/**
 * VAUNT ATELIER - COLLECTION PAGE ENGINE
 * Handles multi-facet filtering, sorting, price range, and grid rendering
 */

(function () {
  'use strict';

  const CollectionApp = {
    products: [],
    filteredProducts: [],
    filters: {
      category: 'all',
      gender: 'all',
      style: 'all',
      size: 'all',
      color: 'all',
      maxPrice: 35000,
      onSaleOnly: false
    },
    sortBy: 'featured',

    init: function () {
      // Listen for catalog loaded event or check if already available
      if (window.Vaunt && window.Vaunt.catalog && window.Vaunt.catalog.length > 0) {
        this.products = [...window.Vaunt.catalog];
        this.setup();
      } else {
        document.addEventListener('vaunt:catalog-loaded', (e) => {
          this.products = [...e.detail];
          this.setup();
        });
      }
    },

    setup: function () {
      this.readUrlParams();
      this.bindFilterEvents();
      this.applyFiltersAndSort();
    },

    readUrlParams: function () {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const gender = params.get('gender');
      const style = params.get('style');

      if (cat) this.filters.category = cat.toLowerCase();
      if (gender) this.filters.gender = gender.toLowerCase();
      if (style) this.filters.style = style.toLowerCase();

      // Update UI selects/checkboxes if matching
      if (cat) {
        const catSelect = document.getElementById('filterCategory');
        if (catSelect) catSelect.value = this.filters.category;
      }
    },

    bindFilterEvents: function () {
      // Category filter
      const catSelect = document.getElementById('filterCategory');
      catSelect?.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.applyFiltersAndSort();
      });

      // Gender filter buttons/radios
      document.querySelectorAll('[data-filter-gender]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('[data-filter-gender]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.filters.gender = btn.getAttribute('data-filter-gender');
          this.applyFiltersAndSort();
        });
      });

      // Style filter
      const styleSelect = document.getElementById('filterStyle');
      styleSelect?.addEventListener('change', (e) => {
        this.filters.style = e.target.value;
        this.applyFiltersAndSort();
      });

      // Size pills
      document.querySelectorAll('[data-filter-size]').forEach(btn => {
        btn.addEventListener('click', () => {
          const size = btn.getAttribute('data-filter-size');
          if (this.filters.size === size) {
            this.filters.size = 'all';
            btn.classList.remove('is-active');
          } else {
            document.querySelectorAll('[data-filter-size]').forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            this.filters.size = size;
          }
          this.applyFiltersAndSort();
        });
      });

      // Price slider
      const priceSlider = document.getElementById('priceRangeSlider');
      const priceValueDisplay = document.getElementById('priceRangeValue');
      priceSlider?.addEventListener('input', (e) => {
        this.filters.maxPrice = Number(e.target.value);
        if (priceValueDisplay) {
          priceValueDisplay.textContent = 'LKR ' + this.filters.maxPrice.toLocaleString('en-US');
        }
        this.applyFiltersAndSort();
      });

      // Sale toggle
      const saleCheckbox = document.getElementById('filterSaleOnly');
      saleCheckbox?.addEventListener('change', (e) => {
        this.filters.onSaleOnly = e.target.checked;
        this.applyFiltersAndSort();
      });

      // Sort Select
      const sortSelect = document.getElementById('sortSelect');
      sortSelect?.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFiltersAndSort();
      });

      // Clear all
      const clearBtn = document.getElementById('clearFiltersBtn');
      clearBtn?.addEventListener('click', () => {
        this.clearFilters();
      });

      // Mobile Filter Drawer Toggle
      const mobileFilterBtn = document.getElementById('mobileFilterTrigger');
      const filterSidebar = document.querySelector('.collection-sidebar');
      const closeFilterSidebar = document.querySelector('.close-sidebar-btn');

      mobileFilterBtn?.addEventListener('click', () => {
        filterSidebar?.classList.add('is-mobile-open');
        document.body.classList.add('drawer-open');
      });

      closeFilterSidebar?.addEventListener('click', () => {
        filterSidebar?.classList.remove('is-mobile-open');
        document.body.classList.remove('drawer-open');
      });
    },

    clearFilters: function () {
      this.filters = {
        category: 'all',
        gender: 'all',
        style: 'all',
        size: 'all',
        color: 'all',
        maxPrice: 35000,
        onSaleOnly: false
      };

      const catSelect = document.getElementById('filterCategory');
      if (catSelect) catSelect.value = 'all';

      const styleSelect = document.getElementById('filterStyle');
      if (styleSelect) styleSelect.value = 'all';

      const saleCheckbox = document.getElementById('filterSaleOnly');
      if (saleCheckbox) saleCheckbox.checked = false;

      const priceSlider = document.getElementById('priceRangeSlider');
      if (priceSlider) priceSlider.value = 35000;
      const priceValueDisplay = document.getElementById('priceRangeValue');
      if (priceValueDisplay) priceValueDisplay.textContent = 'LKR 35,000';

      document.querySelectorAll('[data-filter-gender]').forEach(b => b.classList.remove('is-active'));
      document.querySelector('[data-filter-gender="all"]')?.classList.add('is-active');

      document.querySelectorAll('[data-filter-size]').forEach(b => b.classList.remove('is-active'));

      this.applyFiltersAndSort();
    },

    applyFiltersAndSort: function () {
      let results = [...this.products];

      // Filter by Category
      if (this.filters.category !== 'all') {
        results = results.filter(p => p.category.toLowerCase() === this.filters.category.toLowerCase());
      }

      // Filter by Gender
      if (this.filters.gender !== 'all') {
        results = results.filter(p => p.gender.toLowerCase() === this.filters.gender.toLowerCase() || p.gender === 'unisex');
      }

      // Filter by Style
      if (this.filters.style !== 'all') {
        results = results.filter(p => p.style.toLowerCase() === this.filters.style.toLowerCase());
      }

      // Filter by Size
      if (this.filters.size !== 'all') {
        results = results.filter(p => p.sizes && p.sizes.includes(this.filters.size));
      }

      // Filter by Price
      results = results.filter(p => p.price <= this.filters.maxPrice);

      // Filter by On Sale
      if (this.filters.onSaleOnly) {
        results = results.filter(p => p.compare_at_price && p.compare_at_price > p.price);
      }

      // Sorting
      switch (this.sortBy) {
        case 'price-ascending':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-descending':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'best-selling':
          results.sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));
          break;
        case 'newest':
          results.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
          break;
        case 'featured':
        default:
          break;
      }

      this.filteredProducts = results;
      this.renderCollectionGrid();
    },

    renderCollectionGrid: function () {
      const grid = document.getElementById('collectionProductGrid');
      const countDisplay = document.getElementById('collectionProductCount');

      if (countDisplay) {
        countDisplay.textContent = `${this.filteredProducts.length} ${this.filteredProducts.length === 1 ? 'Product' : 'Products'}`;
      }

      if (!grid) return;

      if (this.filteredProducts.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <h3 style="font-family: var(--font-family-display); font-size: 1.5rem; text-transform: uppercase; margin-bottom: 8px;">No matching pieces found</h3>
            <p style="color: var(--color-foreground-muted); margin-bottom: 20px;">Try clearing some filters to view our full collection.</p>
            <button type="button" class="btn btn-primary" onclick="CollectionApp.clearFilters()">Clear All Filters</button>
          </div>
        `;
        return;
      }

      grid.innerHTML = this.filteredProducts.map(p => {
        const isWish = window.Vaunt && window.Vaunt.isWishlisted(p.id);
        const discountPct = p.compare_at_price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : 0;

        return `
          <div class="product-card" data-product-id="${p.id}">
            <div class="product-card-media">
              <a href="product.html?id=${p.handle}">
                <img src="${p.primary_image}" alt="${p.title}" class="product-card-image primary" loading="lazy">
                <img src="${p.secondary_image}" alt="${p.title}" class="product-card-image secondary" loading="lazy">
              </a>
              <div class="product-card-badges">
                ${p.is_new ? '<span class="badge badge-new">NEW</span>' : ''}
                ${discountPct > 0 ? `<span class="badge badge-sale">-${discountPct}%</span>` : ''}
              </div>
              <button type="button" class="product-card-wishlist ${isWish ? 'is-active' : ''}" data-wishlist-id="${p.id}" aria-label="Add to wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <div class="product-card-actions">
                <button type="button" class="btn-quickadd" data-product-id="${p.id}">Quick Add</button>
                <button type="button" class="btn-quickview" data-quickview-id="${p.id}">Quick View</button>
              </div>

              <!-- Quick Size Selector Overlay -->
              <div class="card-quick-sizes">
                <div class="quick-sizes-title">
                  <span>Select Size</span>
                  <span style="cursor: pointer;" onclick="this.closest('.card-quick-sizes').classList.remove('is-open')">✕</span>
                </div>
                <div class="quick-sizes-grid">
                  ${p.sizes.map(s => `
                    <button type="button" class="quick-size-btn" data-product-id="${p.id}" data-size="${s}">${s}</button>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="product-card-content">
              <div class="product-card-rating">
                <span class="rating-stars">★★★★★</span>
                <span>(${p.reviews_count || 0})</span>
              </div>
              <h3 class="product-card-title">
                <a href="product.html?id=${p.handle}">${p.title}</a>
              </h3>
              <div class="product-card-pricing">
                <span class="product-price">LKR ${p.price.toLocaleString('en-US')}</span>
                ${p.compare_at_price ? `<span class="product-price-compare">LKR ${p.compare_at_price.toLocaleString('en-US')}</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  };

  window.CollectionApp = CollectionApp;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CollectionApp.init());
  } else {
    CollectionApp.init();
  }
})();
