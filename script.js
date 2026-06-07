const imagePools = {
  special: [
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=700&q=80"
  ],
  motion: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1513278974582-3e1b4a4fa21e?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80"
  ],
  classic: [
    "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1505944357431-27579db47558?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=700&q=80"
  ],
  floral: [
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1509719662288-7d705e5280b5?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=80"
  ],
  aqiqah: [
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1546015720-b8b30df5aa27?auto=format&fit=crop&w=700&q=80"
  ]
};

const grids = document.querySelectorAll(".catalog-grid");

const themeCopy = {
  special: ["Royal Garden", "Golden Vow", "Pearl Romance", "Velvet Bloom", "Ivory Luxe", "Eternal Sage", "Champagne Story", "Serenity Gold"],
  motion: ["Motion Aurora", "3D Blossom", "Floating Garden", "Cinematic Vow", "Royal Motion", "Galaxy Love", "Velvet Frame", "Golden Orbit"],
  classic: ["Java Heritage", "Nusantara Ayu", "Royal Adat", "Classic Maroon", "Siger Elegance", "Jogja Royal", "Minang Gold", "Heritage Calm"],
  floral: ["Rose Elegance", "Floral Blue", "Sage Garden", "Lily Minimal", "Blush Story", "White Orchid", "Dusty Romance", "Gardenia Soft"],
  aqiqah: ["Baby Blessing", "Little Garden", "Soft Aqiqah", "Blue Joy", "Pink Wonder", "Family Moment"]
};

const priceBySeed = {
  special: { old: "Rp249.000", price: "Rp149.000", discount: "40%" },
  motion: { old: "Rp299.000", price: "Rp189.000", discount: "35%" },
  classic: { old: "Rp189.000", price: "Rp109.000", discount: "40%" },
  floral: { old: "Rp189.000", price: "Rp109.000", discount: "40%" },
  aqiqah: { old: "Rp159.000", price: "Rp99.000", discount: "38%" }
};

grids.forEach((grid) => {
  const count = Number(grid.dataset.count || 6);
  const category = grid.dataset.category || "Wedding";
  const seed = grid.dataset.seed || "special";
  const images = imagePools[seed] || imagePools.special;
  const names = themeCopy[seed] || themeCopy.special;
  const price = priceBySeed[seed] || priceBySeed.special;

  for (let index = 1; index <= count; index += 1) {
    const card = document.createElement("article");
    const themeName = names[(index - 1) % names.length];
    const themeCode = `${seed.toUpperCase()}-${String(index).padStart(2, "0")}`;
    const imageSrc = images[(index - 1) % images.length];
    const isBestSeller = index === 1 || index === 3 || index === 5;
    const description = `${themeName} adalah tema ${category} dengan tampilan elegan, mobile friendly, dan cocok untuk undangan digital AWH Digital.`;
    const orderMessage = encodeURIComponent(`Halo AWH Digital, saya ingin order ${themeName} (${themeCode}) kategori ${category}.`);

    card.className = "catalog-card reveal";
    card.innerHTML = `
      <div class="thumb">
        <img src="${imageSrc}" alt="Thumbnail dummy ${themeName} ${category}" loading="lazy">
        <div class="card-badges">
          <span class="theme-badge">${themeCode}</span>
          ${isBestSeller ? '<span class="seller-badge">Best Seller</span>' : ""}
        </div>
        <span class="discount-ribbon">Diskon ${price.discount}</span>
      </div>
      <div class="card-body">
        <div>
          <p class="theme-name">${themeName}</p>
          <p class="theme-category">${category}</p>
        </div>
        <div class="card-price">
          <span class="old-price">${price.old}</span>
          <strong class="new-price">${price.price}</strong>
        </div>
        <div class="card-actions">
          <button class="preview-button" type="button" aria-label="Preview ${themeName} ${category}">Preview</button>
          <a class="order-button" href="https://wa.me/6281234567890?text=${orderMessage}" target="_blank" rel="noopener" aria-label="Order ${themeName} ${category}">Order</a>
        </div>
      </div>
    `;

    const previewButton = card.querySelector(".preview-button");
    previewButton.dataset.title = themeName;
    previewButton.dataset.category = category;
    previewButton.dataset.description = description;
    previewButton.dataset.image = imageSrc;
    previewButton.dataset.oldPrice = price.old;
    previewButton.dataset.price = price.price;
    previewButton.dataset.orderUrl = `https://wa.me/6281234567890?text=${orderMessage}`;

    grid.appendChild(card);
  }
});

const categoryButtons = document.querySelectorAll(".nav-button[data-target]");
const catalogSections = document.querySelectorAll(".catalog-section");
const catalogFilter = document.querySelector(".catalog-filter");

const showCategory = (targetId, shouldScroll = true) => {
  const targetSection = document.getElementById(targetId);

  if (!targetSection) {
    return;
  }

  catalogSections.forEach((section) => {
    const isActive = section.id === targetId;
    section.classList.toggle("is-active", isActive);
    section.setAttribute("aria-hidden", String(!isActive));
  });

  categoryButtons.forEach((button) => {
    const isActive = button.dataset.target === targetId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (shouldScroll) {
    const scrollTarget = catalogFilter || targetSection;
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCategory(button.dataset.target);
  });
});

const previewModal = document.getElementById("preview-modal");
const previewImage = document.getElementById("preview-image");
const previewTitle = document.getElementById("preview-title");
const previewCategory = document.getElementById("preview-category");
const previewDescription = document.getElementById("preview-description");
const previewOldPrice = document.getElementById("preview-old-price");
const previewPrice = document.getElementById("preview-price");
const previewOrder = document.getElementById("preview-order");

const closePreview = () => {
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("body-locked");
};

document.querySelectorAll(".preview-button").forEach((button) => {
  button.addEventListener("click", () => {
    previewTitle.textContent = button.dataset.title;
    previewCategory.textContent = button.dataset.category;
    previewDescription.textContent = button.dataset.description;
    previewImage.src = button.dataset.image;
    previewImage.alt = `Preview ${button.dataset.title}`;
    previewOldPrice.textContent = button.dataset.oldPrice;
    previewPrice.textContent = button.dataset.price;
    previewOrder.href = button.dataset.orderUrl;
    previewModal.classList.add("is-open");
    previewModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("body-locked");
  });
});

document.querySelectorAll("[data-close-preview]").forEach((button) => {
  button.addEventListener("click", closePreview);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && previewModal.classList.contains("is-open")) {
    closePreview();
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -40px 0px"
});

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});
