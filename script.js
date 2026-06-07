let activeCategoryId = "";

const getCategories = () => window.AWHCatalogStore.loadCategories();

const formatThemeCode = (theme, index) => {
  if (theme.themeBadge) {
    return theme.themeBadge;
  }

  const prefix = theme.categoryId.toUpperCase();
  return `${prefix}-${String(index + 1).padStart(2, "0")}`;
};

const getCategoryLabel = (categoryId) => {
  const category = getCategories().find((item) => item.id === categoryId);
  return category ? category.label : "Katalog";
};

const createOrderUrl = (theme, themeCode) => {
  const category = getCategoryLabel(theme.categoryId);
  const message = encodeURIComponent(`Halo AWH Digital, saya ingin order ${theme.name} (${themeCode}) kategori ${category}.`);
  return `https://wa.me/6281234567890?text=${message}`;
};

const renderThemeCard = (theme, index) => {
  const category = getCategoryLabel(theme.categoryId);
  const themeCode = formatThemeCode(theme, index);
  const orderUrl = createOrderUrl(theme, themeCode);
  const description = `${theme.name} adalah tema ${category} dengan tampilan elegan, mobile friendly, dan cocok untuk undangan digital AWH Digital.`;
  const card = document.createElement("article");

  card.className = "catalog-card reveal";
  card.innerHTML = `
    <div class="thumb">
      <img src="${theme.image}" alt="Thumbnail ${theme.name} ${category}" loading="lazy">
      <div class="card-badges">
        <span class="theme-badge">${themeCode}</span>
        ${theme.bestSeller ? '<span class="seller-badge">Best Seller</span>' : ""}
      </div>
      ${theme.discount ? `<span class="discount-ribbon">Diskon ${theme.discount}</span>` : ""}
    </div>
    <div class="card-body">
      <div>
        <p class="theme-name">${theme.name}</p>
        <p class="theme-category">${category}</p>
      </div>
      <div class="card-price">
        ${theme.oldPrice ? `<span class="old-price">${theme.oldPrice}</span>` : ""}
        <strong class="new-price">${theme.price}</strong>
      </div>
      <div class="card-actions">
        <button class="preview-button" type="button" aria-label="Preview ${theme.name} ${category}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12Z" />
            <path d="M12 15.25a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z" />
          </svg>
          <span>Preview</span>
        </button>
        <a class="order-button" href="${orderUrl}" target="_blank" rel="noopener" aria-label="Order ${theme.name} ${category}">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 11.5a8.5 8.5 0 0 1-12.61 7.45L3.5 20.5l1.48-4.5A8.5 8.5 0 1 1 20.5 11.5Z" />
            <path d="M8.75 8.9c.15 3.35 2.5 5.42 5.35 6.08l1.45-1.45-2.12-1.18-.72.72c-.95-.33-1.72-1.1-2.05-2.05l.72-.72-1.18-2.12-1.45 1.72Z" />
          </svg>
          <span>Order</span>
        </a>
      </div>
    </div>
  `;

  const previewButton = card.querySelector(".preview-button");
  previewButton.dataset.title = theme.name;
  previewButton.dataset.category = category;
  previewButton.dataset.description = description;
  previewButton.dataset.image = theme.image;
  previewButton.dataset.oldPrice = theme.oldPrice;
  previewButton.dataset.price = theme.price;
  previewButton.dataset.orderUrl = orderUrl;
  previewButton.dataset.previewLink = theme.previewLink || "";

  return card;
};

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

const observeRevealElements = () => {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
    revealObserver.observe(element);
  });
};

const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
  });
};

const initSectionScrollSpy = () => {
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) {
    return;
  }

  const getHeaderOffset = () => {
    const header = document.querySelector(".site-nav");
    return header ? header.offsetHeight + 48 : 120;
  };

  const updateActiveNav = () => {
    const currentPosition = window.scrollY + getHeaderOffset();
    let activeSection = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= currentPosition) {
        activeSection = section;
      }
    });

    setActiveNav(activeSection.id);
  };

  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveNav();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", updateActiveNav);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href").slice(1);
      setActiveNav(targetId);
    });
  });

  updateActiveNav();
};

const renderCategoryControls = (categories) => {
  const filter = document.getElementById("catalog-filter");

  filter.innerHTML = categories.map((category, index) => `
    <button
      class="nav-button ${index === 0 ? "is-active" : ""}"
      type="button"
      data-category-id="${category.id}"
      data-target="category-${category.id}"
      aria-controls="category-${category.id}"
      aria-selected="${index === 0 ? "true" : "false"}"
    >${category.label}</button>
  `).join("");
};

const renderCategorySections = (categories, themes) => {
  const wrapper = document.getElementById("catalog-sections");

  wrapper.innerHTML = categories.map((category, index) => `
    <section class="catalog-section ${index === 0 ? "is-active" : ""}" id="category-${category.id}" aria-hidden="${index === 0 ? "false" : "true"}">
      <div class="container">
        <div class="section-heading reveal">
          <span class="label">Kategori</span>
          <h2>${category.title}</h2>
          <p>${category.description}</p>
        </div>
        <div class="catalog-grid" data-category-id="${category.id}"></div>
      </div>
    </section>
  `).join("");

  categories.forEach((category) => {
    const grid = wrapper.querySelector(`[data-category-id="${category.id}"]`);
    const categoryThemes = themes.filter((theme) => theme.categoryId === category.id);

    if (!categoryThemes.length) {
      grid.innerHTML = `
        <div class="empty-catalog">
          <h3>Belum ada tema di kategori ini</h3>
          <p>Tambahkan tema melalui halaman admin katalog.</p>
        </div>
      `;
      return;
    }

    categoryThemes.forEach((theme, index) => {
      grid.appendChild(renderThemeCard(theme, index));
    });
  });
};

const showCategory = (categoryId, shouldScroll = true) => {
  const targetSection = document.getElementById(`category-${categoryId}`);
  const filter = document.getElementById("catalog-filter");

  if (!targetSection) {
    return;
  }

  activeCategoryId = categoryId;

  document.querySelectorAll(".catalog-section").forEach((section) => {
    const isActive = section.id === `category-${categoryId}`;
    section.classList.toggle("is-active", isActive);
    section.setAttribute("aria-hidden", String(!isActive));
  });

  document.querySelectorAll(".nav-button[data-category-id]").forEach((button) => {
    const isActive = button.dataset.categoryId === categoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (shouldScroll) {
    filter.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const renderCatalog = () => {
  const categories = getCategories();
  const themes = window.AWHCatalogStore.load();

  if (!categories.length) {
    return;
  }

  if (!activeCategoryId || !categories.some((category) => category.id === activeCategoryId)) {
    activeCategoryId = categories[0].id;
  }

  renderCategoryControls(categories);
  renderCategorySections(categories, themes);
  showCategory(activeCategoryId, false);
  observeRevealElements();
};

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest(".nav-button[data-category-id]");

  if (categoryButton) {
    showCategory(categoryButton.dataset.categoryId);
    return;
  }

  const previewButton = event.target.closest(".preview-button");

  if (!previewButton) {
    return;
  }

  if (previewButton.dataset.previewLink) {
    window.open(previewButton.dataset.previewLink, "_blank", "noopener");
    return;
  }

  previewTitle.textContent = previewButton.dataset.title;
  previewCategory.textContent = previewButton.dataset.category;
  previewDescription.textContent = previewButton.dataset.description;
  previewImage.src = previewButton.dataset.image;
  previewImage.alt = `Preview ${previewButton.dataset.title}`;
  previewOldPrice.textContent = previewButton.dataset.oldPrice;
  previewPrice.textContent = previewButton.dataset.price;
  previewOrder.href = previewButton.dataset.orderUrl;
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("body-locked");
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

document.querySelectorAll("[data-close-preview]").forEach((button) => {
  button.addEventListener("click", closePreview);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && previewModal.classList.contains("is-open")) {
    closePreview();
  }
});

window.addEventListener("awhCatalogUpdated", renderCatalog);
window.addEventListener("awhCategoriesUpdated", renderCatalog);

window.AWHCatalogStore.ready.then(() => {
  renderCatalog();
  initSectionScrollSpy();
});
