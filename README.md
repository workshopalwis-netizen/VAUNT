# VAUNT ATELIER — Premium Modern E-Commerce Storefront
### Engineered for High Conversions & Shopify Online Store 2.0 Compatibility

**VAUNT ATELIER** is a luxury contemporary fashion e-commerce storefront designed with architectural silhouettes, editorial typography, and high-performance shopping mechanics. It is built specifically with a **dual-purpose architecture**:

1. **Immediate Interactive Storefront**: A zero-build, responsive web application (`index.html`, `collection.html`, `product.html`, `cart.html`) powered by modern vanilla ES6 modules, CSS Custom Properties, and local storage persistence.
2. **Shopify Online Store 2.0 Theme**: A 100% compliant Shopify theme structure (`layout/`, `templates/`, `sections/`, `snippets/`, `config/`, `locales/`, `assets/`) with rich Liquid markup and customizable `{% schema %}` JSON blocks ready for Shopify CLI deployment.

---

## 🏛️ Brand Concept & Aesthetic Direction

* **Brand Name**: **VAUNT ATELIER**
* **Identity**: Minimal, Premium, Bold, Editorial Contemporary Fashion.
* **Palette**:
  * Neutral Dark: Obsidian (`#0D0D0D`, `#161616`)
  * Neutral Light: Alabaster Off-White (`#F6F6F5`), Pure White (`#FFFFFF`)
  * Surface Muted: Slate Grey (`#7E7E7E`, `#E5E5E2`)
  * Primary Accent: Warm Champagne Gold (`#C5A880`) — centrally configured via `:root { --color-accent: #C5A880; }` or Shopify theme settings.
* **Currency**: LKR (Sri Lankan Rupee, e.g. `LKR 12,500`) with dynamic free shipping progress based on a **LKR 10,000 threshold**.

---

## ⚡ Core Features & Shopping Experience

### 1. Sticky Header & Mega Menus
- **Announcement Bar**: Dynamic ticker with editable free shipping prompt and dismissal option.
- **Sticky Desktop Navigation**:
  - `NEW ARRIVALS`, `MEN`, `WOMEN`, `COLLECTIONS`, `BEST SELLERS`, `SALE`.
  - Rich **Mega Menus** with multi-column category links (Tops, Outerwear, Bottoms, Accessories) and integrated lookbook campaign cards.
- **Mobile Experience**:
  - Touch-optimized sticky mobile bar.
  - Full-screen slide-in mobile drawer with accordion menus and currency selector.

### 2. Homepage Sections (Exact Requirements)
- **Hero Section**: Cinematic fashion visual (with image/video support, overlay opacity controls, and dual `SHOP MEN` / `SHOP WOMEN` CTAs).
- **New Arrivals**: 4-column desktop / 2-column mobile grid with hover image swapping, zoom, quick view, and inline quick-add size selection.
- **Shop by Category**: 4 large visual cards (`MEN`, `WOMEN`, `NEW ARRIVALS`, `ACCESSORIES`) with dark gradient overlays.
- **Featured Collection (Editorial)**: Split lifestyle section highlighting *"THE ESSENTIAL COLLECTION"*.
- **Best Sellers**: Star ratings, sale prices, compare-at badges, with horizontal touch snap-scrolling on mobile.
- **Promotional Banner**: Bold high-contrast banner with *"UP TO 40% OFF"*.
- **Shop by Style**: 5 aesthetic categories (`STREETWEAR`, `CASUAL`, `ACTIVE`, `PREMIUM`, `ESSENTIALS`).
- **Product Discovery (Trending Now)**: Horizontal snap carousel with trending badges.
- **Collection Feature**: Full-width editorial section (*"BUILT FOR YOUR EVERYDAY"*).
- **Instagram / Social Feed**: 6 curated editorial tiles with hover overlays.
- **Newsletter**: Sleek email subscription box with instant toast confirmation.
- **Comprehensive Footer**: 4 link columns (`SHOP`, `HELP`, `ABOUT`, `LEGAL`), social icons, payment badges (`VISA`, `MASTERCARD`, `AMEX`, `APPLE PAY`), copyright.

### 3. High-Converting E-Commerce Mechanics
- **Slide-out Cart Drawer**:
  - Real-time **Free Shipping Progress Bar** calculating distance to the LKR 10,000 goal.
  - Interactive quantity controls (`-` / `+`), remove button, subtotal, and secure checkout CTA.
  - Persisted across pages using `localStorage`.
- **Quick View Modal**:
  - Full variant selector (color swatches, size buttons), quantity picker, and instant add-to-cart without navigating away.
- **Persistent Wishlist**:
  - Bookmarks items to `localStorage` with a dynamic counter badge in the header.
- **Full-Screen Search Overlay**:
  - Instant keystroke search across products, categories, and tags.
  - Popular search shortcuts (*"Heavyweight Hoodie"*, *"Tactical Cargo"*, *"Supima Tee"*).
- **Collection Page (PLP)**:
  - Multi-facet sidebar filters: Gender, Category, Style, Size pills, Price range slider, and On Sale filter.
  - Dynamic sort dropdown (Featured, Best Selling, Newest, Price Low-High, Price High-Low).
- **Product Detail Page (PDP)**:
  - Sticky image gallery with thumbnail switcher.
  - Interactive Size Guide modal with measurement table (cm/inches).
  - Expandable accordions for Description, Fabric Specifications, Shipping, and Returns.
  - Sticky mobile "Add to Cart" bar when scrolling past the main button.
  - *"YOU MAY ALSO LIKE"* recommendation grid.

---

## 🚀 Running the Project Locally

Because the project uses clean modern ES6 standards without complex bundling dependencies, you can run it with any static server:

### Option A: Python HTTP Server (Recommended)
```bash
# Navigate to the project directory
cd /Users/workshop/Documents/Shopify

# Start local server
python3 -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option B: Node.js Serve
```bash
npx serve . -p 3000
```

---

## 🛍️ Shopify Online Store 2.0 Theme Conversion

This repository is already organized matching the official Shopify Online Store 2.0 theme architecture:

```
Shopify/
├── layout/
│   └── theme.liquid                # Main layout envelope
├── templates/
│   ├── index.json                  # Homepage section hierarchy
│   ├── collection.json             # Collection page template
│   ├── product.json                # Product page template
│   ├── cart.json                   # Cart template
│   └── 404.json                    # 404 error template
├── sections/
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── hero-banner.liquid
│   ├── new-arrivals.liquid
│   ├── category-cards.liquid
│   ├── featured-editorial.liquid
│   ├── best-sellers.liquid
│   ├── promo-banner.liquid
│   ├── shop-by-style.liquid
│   ├── trending-carousel.liquid
│   ├── collection-feature.liquid
│   ├── instagram-feed.liquid
│   ├── newsletter.liquid
│   ├── footer.liquid
│   ├── main-collection.liquid
│   └── main-product.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── cart-drawer.liquid
│   ├── quick-view-modal.liquid
│   ├── search-overlay.liquid
│   └── size-guide-modal.liquid
├── assets/
│   ├── base.css
│   ├── theme.css
│   ├── sections.css
│   ├── components.css
│   ├── theme.js
│   ├── collection.js
│   └── product.js
├── config/
│   ├── settings_schema.json        # Theme customizer color & font controls
│   └── settings_data.json          # Default values
└── locales/
    └── en.default.json             # Translation strings
```

### Deploying to Shopify via Shopify CLI

1. **Install Shopify CLI**:
   ```bash
   brew tap shopify/shopify
   brew install shopify-cli
   ```

2. **Authenticate with your store**:
   ```bash
   shopify auth login --store your-store-name.myshopify.com
   ```

3. **Preview Theme in Development Mode**:
   ```bash
   shopify theme dev --store your-store-name.myshopify.com
   ```

4. **Push Theme to Shopify**:
   ```bash
   shopify theme push
   ```

---

## 📦 GitHub Version Control Setup

To initialize and push this theme to your GitHub repository:

```bash
git init
git add .
git commit -m "feat: initial release of VAUNT ATELIER Shopify OS 2.0 theme"

# Link to your remote GitHub repo
git remote add origin https://github.com/your-username/vaunt-atelier-shopify.git
git branch -M main
git push -u origin main
```

---

## 🎨 Theme Customizer Settings

Merchants can customize everything from the Shopify Admin (`Online Store -> Themes -> Customize`):
* **Colors**: Change primary obsidian, accent gold, background, and sale badges with live preview.
* **Hero Banner**: Upload custom video backgrounds or high-res photography, adjust overlay darkness and CTA links.
* **Announcements**: Edit the banner text, discount codes, and toggle customer dismissal.
* **Free Shipping Threshold**: Set the exact currency amount to trigger the progress bar celebrations.

---

© 2026 VAUNT ATELIER. Built for high performance, modern elegance, and seamless Shopify Online Store 2.0 conversion.
