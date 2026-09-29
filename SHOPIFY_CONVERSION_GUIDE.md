# Shopify Online Store 2.0 Theme Conversion Guide
## VAUNT ATELIER Technical Architecture & Integration Notes

This guide provides Shopify theme developers with the technical specifications for connecting **VAUNT ATELIER** to a live Shopify store.

---

## 1. Directory Structure Mapping

The repository includes both standalone HTML files for immediate prototype inspection and official Liquid theme components:

| HTML Prototype File | Shopify OS 2.0 Equivalent | Liquid Location |
| :--- | :--- | :--- |
| `index.html` | Homepage | `templates/index.json` + `sections/*.liquid` |
| `collection.html` | Collection (PLP) | `templates/collection.json` + `sections/main-collection.liquid` |
| `product.html` | Product Detail (PDP) | `templates/product.json` + `sections/main-product.liquid` |
| `cart.html` | Cart Page | `templates/cart.json` + `sections/main-cart.liquid` |
| Cart Drawer | Slide-out Cart | `snippets/cart-drawer.liquid` |
| Quick View Modal | Quick View | `snippets/quick-view-modal.liquid` |
| Fullscreen Search | Predictive Search | `snippets/search-overlay.liquid` |
| Size Guide | Measurement Modal | `snippets/size-guide-modal.liquid` |

---

## 2. Connecting the Cart Drawer to Shopify Ajax API

In the standalone prototype, cart state is managed in `assets/theme.js` using `localStorage`. When deploying to Shopify, connect directly to Shopify's standard Ajax Cart endpoints:

### Add to Cart
```javascript
fetch('/cart/add.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{
      id: variantId,
      quantity: qty
    }]
  })
})
.then(res => res.json())
.then(cartItem => {
  // Re-fetch updated cart
  fetchCartAndRenderDrawer();
});
```

### Fetch Cart & Free Shipping Calculation
```javascript
fetch('/cart.js')
  .then(res => res.json())
  .then(cart => {
    // cart.total_price is in cents
    const subtotal = cart.total_price / 100;
    const threshold = {{ settings.free_shipping_threshold | default: 10000 }};
    const remaining = threshold - subtotal;
    
    // Update progress bar
    const percent = Math.min(100, Math.round((subtotal / threshold) * 100));
    document.querySelector('.shipping-progress-fill').style.width = percent + '%';
  });
```

### Change Quantity / Remove
```javascript
fetch('/cart/change.js', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    line: lineIndex,
    quantity: newQuantity
  })
})
.then(res => res.json())
.then(cart => fetchCartAndRenderDrawer());
```

---

## 3. Product Media & Swatches

### Secondary Hover Image
In `snippets/product-card.liquid`:
```liquid
<div class="product-card-media">
  <img src="{{ product.featured_media | image_url: width: 700 }}" class="product-card-image primary" loading="lazy">
  {% if product.media[1] != blank %}
    <img src="{{ product.media[1] | image_url: width: 700 }}" class="product-card-image secondary" loading="lazy">
  {% endif %}
</div>
```

### Color Swatches
For automatic color swatch mapping, Shopify Category Metafields or standard color option names are supported:
```liquid
{% for color_option in product.options_by_name['Color'].values %}
  <button type="button" class="color-swatch-btn" data-color="{{ color_option.name }}">
    <span style="background-color: {{ color_option.swatch.color | default: color_option.name | downcase }};"></span>
  </button>
{% endfor %}
```

---

## 4. Theme Settings Customization

Merchants can configure the following from the Shopify Theme Customizer:

1. **Colors**:
   - `settings.color_primary`: Main obsidian neutral for text, buttons, header lines.
   - `settings.color_accent`: Accent gold for notification badges, interactive dots, highlights.
   - `settings.color_background`: Clean off-white surface tone.
   - `settings.color_sale`: Crimson discount pills.
2. **Free Shipping Goal**:
   - `settings.free_shipping_threshold`: Editable number (defaults to `10000` for LKR 10,000).

---

## 5. Deployment Commands

```bash
# Verify theme structure
shopify theme check

# Launch local preview connected to your dev store
shopify theme dev --store your-store-name.myshopify.com

# Deploy live or to an unreleased theme slot
shopify theme push --unpublished
```
