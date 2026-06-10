const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "awhdigital123";
const ADMIN_SESSION_KEY = "awhDigitalAdminLoggedIn";

const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout");
const themeForm = document.getElementById("theme-form");
const formTitle = document.getElementById("form-title");
const formMessage = document.getElementById("form-message");
const themeIdInput = document.getElementById("theme-id");
const themeNameInput = document.getElementById("theme-name");
const themeImageInput = document.getElementById("theme-image");
const themeImageUrlInput = document.getElementById("theme-image-url");
const themeCategoryInput = document.getElementById("theme-category");
const themeBadgeInput = document.getElementById("theme-badge");
const themePriceInput = document.getElementById("theme-price");
const themeDiscountInput = document.getElementById("theme-discount");
const themeOldPriceInput = document.getElementById("theme-old-price");
const themePreviewLinkInput = document.getElementById("theme-preview-link");
const themeBestSellerInput = document.getElementById("theme-best-seller");
const themeActiveInput = document.getElementById("theme-active");
const imagePreview = document.getElementById("image-preview");
const filterCategoryInput = document.getElementById("filter-category");
const themeSearchInput = document.getElementById("theme-search");
const themeList = document.getElementById("theme-list");
const adminStats = document.getElementById("admin-stats");
const cancelEditButton = document.getElementById("cancel-edit");
const categoryForm = document.getElementById("category-form");
const categoryFormTitle = document.getElementById("category-form-title");
const categoryIdInput = document.getElementById("category-id");
const categoryLabelInput = document.getElementById("category-label");
const categoryTitleInput = document.getElementById("category-title");
const categoryDescriptionInput = document.getElementById("category-description");
const categoryMessage = document.getElementById("category-message");
const categoryList = document.getElementById("category-list");
const cancelCategoryEditButton = document.getElementById("cancel-category-edit");
const priceForm = document.getElementById("price-form");
const priceFormTitle = document.getElementById("price-form-title");
const priceIdInput = document.getElementById("price-id");
const priceNameInput = document.getElementById("price-name");
const priceCategoryInput = document.getElementById("price-category");
const priceBadgeInput = document.getElementById("price-badge");
const priceNoteInput = document.getElementById("price-note");
const priceValueInput = document.getElementById("price-value");
const priceDiscountInput = document.getElementById("price-discount");
const priceOldValueInput = document.getElementById("price-old-value");
const priceFeaturesInput = document.getElementById("price-features");
const priceFeaturedInput = document.getElementById("price-featured");
const priceActiveInput = document.getElementById("price-active");
const priceMessage = document.getElementById("price-message");
const priceList = document.getElementById("price-list");
const cancelPriceEditButton = document.getElementById("cancel-price-edit");
const openThemeFormButton = document.getElementById("open-theme-form");
const openCategoryFormButton = document.getElementById("open-category-form");
const openPriceFormButton = document.getElementById("open-price-form");
const downloadJsonButton = document.getElementById("download-json");
const adminMenuToggle = document.querySelector(".admin-menu-toggle");
const adminHeaderActions = document.getElementById("admin-header-actions");
const themeModal = document.getElementById("theme-modal");
const categoryModal = document.getElementById("category-modal");
const priceModal = document.getElementById("price-modal");
const adminLoadingOverlay = document.getElementById("admin-loading-overlay");

let themes = [];
let selectedImage = "";
let categories = [];
let pricePackages = [];
let loadingCounter = 0;

const IMAGE_MAX_SIZE = 900;
const IMAGE_QUALITY = 0.76;
const THEME_UPLOAD_ENDPOINT = "/api/upload-theme";

const showLoading = () => {
  loadingCounter += 1;
  adminLoadingOverlay.hidden = false;
  document.body.classList.add("admin-is-loading");
};

const hideLoading = () => {
  loadingCounter = Math.max(0, loadingCounter - 1);

  if (loadingCounter === 0) {
    adminLoadingOverlay.hidden = true;
    document.body.classList.remove("admin-is-loading");
  }
};

const onlyDigits = (value) => value.replace(/[^\d]/g, "");

const formatRupiah = (value) => {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return `Rp${Number(digits).toLocaleString("id-ID")}`;
};

const formatDiscount = (value) => {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return `${digits}%`;
};

const normalizeThemePriceInputs = () => {
  themePriceInput.value = formatRupiah(themePriceInput.value);
  themeOldPriceInput.value = formatRupiah(themeOldPriceInput.value);
  themeDiscountInput.value = formatDiscount(themeDiscountInput.value);
};

const normalizePackagePriceInputs = () => {
  priceValueInput.value = formatRupiah(priceValueInput.value);
  priceOldValueInput.value = formatRupiah(priceOldValueInput.value);
  priceDiscountInput.value = formatDiscount(priceDiscountInput.value);
};

const setMessage = (element, message, type = "") => {
  element.textContent = message;
  element.className = `form-message ${type ? `is-${type}` : ""}`;
};

const isStorageQuotaError = (error) => {
  return error && (
    error.name === "AWHStorageQuotaError" ||
    error.name === "QuotaExceededError" ||
    error.message === "AWH_STORAGE_QUOTA_EXCEEDED"
  );
};

const handleStorageError = (error, element = formMessage) => {
  if (isStorageQuotaError(error)) {
    setMessage(element, "Data terlalu besar untuk disimpan di browser. Gunakan URL gambar, atau upload gambar yang lebih kecil/terkompres.", "error");
    return true;
  }

  setMessage(element, `Data gagal disimpan. ${error && error.message ? error.message : "Pastikan API aktif dan Vercel Blob sudah terhubung."}`, "error");
  console.error(error);
  return true;
};

const isLoggedIn = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

const openModal = (modal) => {
  modal.hidden = false;
  document.body.classList.add("modal-open");
};

const closeModal = (modal) => {
  modal.hidden = true;

  if (themeModal.hidden && categoryModal.hidden && priceModal.hidden) {
    document.body.classList.remove("modal-open");
  }
};

const closeAdminMenu = () => {
  if (!adminMenuToggle || !adminHeaderActions) {
    return;
  }

  adminMenuToggle.classList.remove("is-open");
  adminHeaderActions.classList.remove("is-open");
  adminMenuToggle.setAttribute("aria-expanded", "false");
};

const toggleAdminMenu = () => {
  if (!adminMenuToggle || !adminHeaderActions) {
    return;
  }

  const willOpen = !adminHeaderActions.classList.contains("is-open");
  adminMenuToggle.classList.toggle("is-open", willOpen);
  adminHeaderActions.classList.toggle("is-open", willOpen);
  adminMenuToggle.setAttribute("aria-expanded", String(willOpen));
};

const showDashboard = () => {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  document.body.classList.add("admin-dashboard-active");
  categories = window.AWHCatalogStore ? window.AWHCatalogStore.loadCategories() : [];
  themes = window.AWHCatalogStore ? window.AWHCatalogStore.load() : [];
  pricePackages = window.AWHCatalogStore ? window.AWHCatalogStore.loadPackages() : [];
  populateCategories();
  renderAdmin();
};

const showLogin = () => {
  loginScreen.hidden = false;
  dashboard.hidden = true;
  document.body.classList.remove("admin-dashboard-active");
};

const populateCategories = () => {
  if (!window.AWHCatalogStore) {
    setMessage(loginMessage, "Data katalog belum terbaca. Pastikan catalog-data.js termuat.", "error");
    return;
  }

  categories = window.AWHCatalogStore.loadCategories();

  const categoryOptions = categories
    .map((category) => `<option value="${category.id}">${category.label}</option>`)
    .join("");

  themeCategoryInput.innerHTML = categoryOptions;
  priceCategoryInput.innerHTML = categoryOptions;
  filterCategoryInput.innerHTML = `<option value="all">Semua Kategori</option>${categoryOptions}`;
};

const getCategoryLabel = (categoryId) => {
  const category = categories.find((item) => item.id === categoryId);
  return category ? category.label : "Katalog";
};

const renderImagePreview = (image = "") => {
  if (!image) {
    imagePreview.innerHTML = "<span>Preview gambar akan tampil di sini</span>";
    return;
  }

  imagePreview.innerHTML = `<img src="${image}" alt="Preview gambar tema" />`;
};

const resetForm = () => {
  themeForm.reset();
  themeIdInput.value = "";
  selectedImage = "";
  formTitle.textContent = "Tambah Tema Baru";
  renderImagePreview();
  setMessage(formMessage, "");
};

const resetCategoryForm = () => {
  categoryForm.reset();
  categoryIdInput.value = "";
  categoryFormTitle.textContent = "Tambah Kategori";
  setMessage(categoryMessage, "");
};

const resetPriceForm = () => {
  priceForm.reset();
  priceIdInput.value = "";
  priceActiveInput.checked = true;
  priceFormTitle.textContent = "Tambah Harga";
  setMessage(priceMessage, "");
};

const saveThemes = async (nextThemes = themes, messageElement = formMessage) => {
  const previousThemes = themes;

  try {
    themes = window.AWHCatalogStore.saveAsync
      ? await window.AWHCatalogStore.saveAsync(nextThemes)
      : window.AWHCatalogStore.save(nextThemes);
    renderAdmin();
    return true;
  } catch (error) {
    themes = previousThemes;
    handleStorageError(error, messageElement);
    return false;
  }
};

const saveCategories = async (nextCategories = categories, messageElement = categoryMessage) => {
  const previousCategories = categories;

  try {
    categories = window.AWHCatalogStore.saveCategoriesAsync
      ? await window.AWHCatalogStore.saveCategoriesAsync(nextCategories)
      : window.AWHCatalogStore.saveCategories(nextCategories);
    populateCategories();
    renderAdmin();
    return true;
  } catch (error) {
    categories = previousCategories;
    handleStorageError(error, messageElement);
    return false;
  }
};

const savePackages = async (nextPackages = pricePackages, messageElement = priceMessage) => {
  const previousPackages = pricePackages;

  try {
    pricePackages = window.AWHCatalogStore.savePackagesAsync
      ? await window.AWHCatalogStore.savePackagesAsync(nextPackages)
      : window.AWHCatalogStore.savePackages(nextPackages);
    renderAdmin();
    return true;
  } catch (error) {
    pricePackages = previousPackages;
    handleStorageError(error, messageElement);
    return false;
  }
};

const saveAdminCatalogSnapshot = async (nextCatalog, messageElement = formMessage) => {
  const previousThemes = themes;
  const previousCategories = categories;
  const previousPackages = pricePackages;

  try {
    const savedCatalog = window.AWHCatalogStore.saveCatalogAsync
      ? await window.AWHCatalogStore.saveCatalogAsync(nextCatalog)
      : window.AWHCatalogStore.saveCatalog(nextCatalog);
    themes = savedCatalog.themes;
    categories = savedCatalog.categories;
    pricePackages = savedCatalog.packages;
    populateCategories();
    renderAdmin();
    return true;
  } catch (error) {
    themes = previousThemes;
    categories = previousCategories;
    pricePackages = previousPackages;
    handleStorageError(error, messageElement);
    return false;
  }
};

const renderStats = () => {
  const bestSellerCount = themes.filter((theme) => theme.bestSeller).length;
  const inactiveCount = themes.filter((theme) => theme.active === false).length;
  const activePackageCount = pricePackages.filter((pricePackage) => pricePackage.active !== false).length;

  adminStats.innerHTML = `
    <div class="stat-card">
      <strong>${themes.length}</strong>
      <span>Total Tema</span>
    </div>
    <div class="stat-card">
      <strong>${bestSellerCount}</strong>
      <span>Best Seller</span>
    </div>
    <div class="stat-card">
      <strong>${inactiveCount}</strong>
      <span>Tema Inactive</span>
    </div>
    <div class="stat-card">
      <strong>${activePackageCount}</strong>
      <span>Harga Aktif</span>
    </div>
  `;
};

const renderThemeList = () => {
  const selectedCategory = filterCategoryInput.value;
  const searchQuery = themeSearchInput.value.trim().toLowerCase();
  const categoryFilteredThemes = selectedCategory === "all"
    ? themes
    : themes.filter((theme) => theme.categoryId === selectedCategory);
  const filteredThemes = !searchQuery
    ? categoryFilteredThemes
    : categoryFilteredThemes.filter((theme) => {
      const searchableText = [
        theme.name,
        theme.themeBadge,
        getCategoryLabel(theme.categoryId),
        theme.price,
        theme.oldPrice,
        theme.discount
      ].join(" ").toLowerCase();

      return searchableText.includes(searchQuery);
    });

  if (!filteredThemes.length) {
    themeList.innerHTML = '<div class="empty-state">Tidak ada tema yang cocok dengan filter saat ini.</div>';
    return;
  }

  themeList.innerHTML = filteredThemes.map((theme) => `
    <article class="theme-row" data-id="${theme.id}">
      <img src="${theme.image}" alt="${theme.name}" />
      <div class="theme-info">
        <h3>${theme.name}</h3>
        <div class="theme-meta">
          ${theme.themeBadge ? `<span>${theme.themeBadge}</span>` : ""}
          <span>${getCategoryLabel(theme.categoryId)}</span>
          <span>${theme.price}</span>
          ${theme.discount ? `<span>Diskon ${theme.discount}</span>` : ""}
          <span>${theme.active === false ? "Inactive" : "Aktif"}</span>
          ${theme.bestSeller ? "<span>Best Seller</span>" : ""}
        </div>
      </div>
      <div class="row-actions">
        <button type="button" data-action="edit">Edit</button>
        <button type="button" class="danger" data-action="delete">Delete</button>
      </div>
    </article>
  `).join("");
};

const renderCategoryList = () => {
  categoryList.innerHTML = categories.map((category) => {
    const themeCount = themes.filter((theme) => theme.categoryId === category.id).length;

    return `
      <article class="category-row" data-id="${category.id}">
        <div>
          <h3>${category.label}</h3>
          <p>${category.title} · ${themeCount} tema</p>
        </div>
        <div class="category-actions">
          <button type="button" data-category-action="edit">Edit</button>
          <button type="button" class="danger" data-category-action="delete">Delete</button>
        </div>
      </article>
    `;
  }).join("");
};

const renderPriceList = () => {
  if (!pricePackages.length) {
    priceList.innerHTML = '<div class="empty-state">Belum ada paket harga.</div>';
    return;
  }

  priceList.innerHTML = pricePackages.map((pricePackage) => `
    <article class="price-row" data-id="${pricePackage.id}">
      <div>
        <h3>${pricePackage.name}</h3>
        <p>${getCategoryLabel(pricePackage.categoryId)} · ${pricePackage.price} · ${pricePackage.active === false ? "Inactive" : "Aktif"}${pricePackage.featured ? " · Favorit" : ""}</p>
      </div>
      <div class="price-actions">
        <button type="button" data-price-action="edit">Edit</button>
        <button type="button" class="danger" data-price-action="delete">Delete</button>
      </div>
    </article>
  `).join("");
};

const renderAdmin = () => {
  renderStats();
  renderThemeList();
  renderCategoryList();
  renderPriceList();
};

const createCompressedCanvas = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();

    reader.onload = () => {
      image.src = reader.result;
    };

    image.onload = () => {
      const scale = Math.min(1, IMAGE_MAX_SIZE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas);
    };

    image.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const fileToCompressedDataUrl = async (file) => {
  const canvas = await createCompressedCanvas(file);
  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
};

const fileToCompressedBlob = async (file) => {
  const canvas = await createCompressedCanvas(file);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("IMAGE_COMPRESSION_FAILED"));
        return;
      }

      resolve(blob);
    }, "image/jpeg", IMAGE_QUALITY);
  });
};

const uploadThemeImage = async (file) => {
  const compressedBlob = await fileToCompressedBlob(file);
  const compressedName = `${file.name.replace(/\.[^.]+$/, "") || "theme-image"}.jpg`;
  const formData = new FormData();
  formData.append("themeImage", compressedBlob, compressedName);

  const response = await fetch(THEME_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData
  });

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("UPLOAD_ENDPOINT_NOT_AVAILABLE");
  }

  const result = await response.json();

  if (!response.ok || !result.success || !result.path) {
    throw new Error(result.message || "UPLOAD_FAILED");
  }

  return result.path;
};

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showLoading();

  try {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setMessage(loginMessage, "Username atau password salah.", "error");
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setMessage(loginMessage, "");
    showDashboard();
  } finally {
    hideLoading();
  }
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  resetForm();
  resetPriceForm();
  closeAdminMenu();
  showLogin();
});

if (adminMenuToggle) {
  adminMenuToggle.addEventListener("click", toggleAdminMenu);
}

document.addEventListener("click", (event) => {
  const isHeaderClick = event.target.closest(".admin-header");

  if (!isHeaderClick) {
    closeAdminMenu();
  }
});

openThemeFormButton.addEventListener("click", () => {
  resetForm();
  closeAdminMenu();
  openModal(themeModal);
});

openCategoryFormButton.addEventListener("click", () => {
  resetCategoryForm();
  closeAdminMenu();
  openModal(categoryModal);
});

openPriceFormButton.addEventListener("click", () => {
  resetPriceForm();
  closeAdminMenu();
  openModal(priceModal);
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(themeModal);
    closeModal(categoryModal);
    closeModal(priceModal);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAdminMenu();
    closeModal(themeModal);
    closeModal(categoryModal);
    closeModal(priceModal);
  }
});

downloadJsonButton.addEventListener("click", () => {
  closeAdminMenu();
  const blob = new Blob([window.AWHCatalogStore.exportJson()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "catalog.json";
  link.click();
  URL.revokeObjectURL(url);
});

themeImageInput.addEventListener("change", async () => {
  const file = themeImageInput.files[0];

  if (!file) {
    selectedImage = "";
    return;
  }

  showLoading();

  try {
    selectedImage = await uploadThemeImage(file);
    themeImageUrlInput.value = "";
    renderImagePreview(selectedImage);
    setMessage(
      formMessage,
      selectedImage.startsWith("http") ? "Gambar berhasil dikompres dan diupload ke Vercel Blob." : "Gambar berhasil dikompres dan disimpan ke storage lokal.",
      "success"
    );
  } catch (error) {
    try {
      selectedImage = await fileToCompressedDataUrl(file);
      themeImageUrlInput.value = "";
      renderImagePreview(selectedImage);
      setMessage(formMessage, "Server upload belum aktif, gambar disimpan sementara sebagai base64 terkompres.", "success");
    } catch (fallbackError) {
      selectedImage = "";
      setMessage(formMessage, "Gambar gagal diproses. Coba gunakan gambar lain atau isi URL gambar.", "error");
    }
  } finally {
    hideLoading();
  }
});

themeImageUrlInput.addEventListener("input", () => {
  selectedImage = "";
  themeImageInput.value = "";
  renderImagePreview(themeImageUrlInput.value.trim());
});

[themePriceInput, themeOldPriceInput, priceValueInput, priceOldValueInput].forEach((input) => {
  input.addEventListener("blur", () => {
    input.value = formatRupiah(input.value);
  });
});

themeDiscountInput.addEventListener("blur", () => {
  themeDiscountInput.value = formatDiscount(themeDiscountInput.value);
});

priceDiscountInput.addEventListener("blur", () => {
  priceDiscountInput.value = formatDiscount(priceDiscountInput.value);
});

themeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const editingId = themeIdInput.value;
  const existingTheme = themes.find((theme) => theme.id === editingId);
  const imageUrl = themeImageUrlInput.value.trim();
  const finalImage = selectedImage || imageUrl || (existingTheme ? existingTheme.image : "");

  normalizeThemePriceInputs();

  if (!finalImage) {
    setMessage(formMessage, "Upload gambar tema atau isi URL gambar terlebih dahulu.", "error");
    return;
  }

  const themePayload = {
    id: editingId || `theme-${Date.now()}`,
    name: themeNameInput.value.trim(),
    themeBadge: themeBadgeInput.value.trim(),
    categoryId: themeCategoryInput.value,
    image: finalImage,
    oldPrice: themeOldPriceInput.value.trim(),
    price: themePriceInput.value.trim(),
    discount: themeDiscountInput.value.trim(),
    previewLink: themePreviewLinkInput.value.trim(),
    active: themeActiveInput.checked,
    bestSeller: themeBestSellerInput.checked
  };

  showLoading();

  try {
    if (editingId) {
      const nextThemes = themes.map((theme) => theme.id === editingId ? themePayload : theme);

      if (!await saveThemes(nextThemes, formMessage)) {
        return;
      }

      resetForm();
      closeModal(themeModal);
      setMessage(formMessage, "Tema berhasil diperbarui.", "success");
    } else {
      const nextThemes = [themePayload, ...themes];

      if (!await saveThemes(nextThemes, formMessage)) {
        return;
      }

      resetForm();
      closeModal(themeModal);
      setMessage(formMessage, "Tema baru berhasil ditambahkan.", "success");
    }
  } finally {
    hideLoading();
  }
});

themeList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const row = actionButton.closest(".theme-row");
  const themeId = row.dataset.id;
  const theme = themes.find((item) => item.id === themeId);

  if (!theme) {
    return;
  }

  if (actionButton.dataset.action === "delete") {
    if (!confirm(`Hapus tema "${theme.name}"?`)) {
      return;
    }

    showLoading();

    try {
      await saveThemes(themes.filter((item) => item.id !== themeId), formMessage);
    } finally {
      hideLoading();
    }
    return;
  }

  themeIdInput.value = theme.id;
  themeNameInput.value = theme.name;
  themeBadgeInput.value = theme.themeBadge || "";
  themeCategoryInput.value = theme.categoryId;
  themePriceInput.value = theme.price;
  themeDiscountInput.value = theme.discount;
  themeOldPriceInput.value = theme.oldPrice;
  themePreviewLinkInput.value = theme.previewLink;
  themeImageUrlInput.value = theme.image.startsWith("data:") ? "" : theme.image;
  themeBestSellerInput.checked = theme.bestSeller;
  themeActiveInput.checked = theme.active !== false;
  selectedImage = "";
  formTitle.textContent = "Edit Tema";
  renderImagePreview(theme.image);
  setMessage(formMessage, "Mode edit aktif. Upload gambar baru hanya jika ingin mengganti gambar.", "success");
  openModal(themeModal);
});

priceForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  normalizePackagePriceInputs();

  const editingId = priceIdInput.value;
  const features = priceFeaturesInput.value
    .split(/\n+/)
    .map((feature) => feature.trim())
    .filter(Boolean);

  if (!features.length) {
    setMessage(priceMessage, "Isi minimal satu fitur paket.", "error");
    return;
  }

  const payload = {
    id: editingId || `package-${Date.now()}`,
    name: priceNameInput.value.trim(),
    badge: priceBadgeInput.value.trim(),
    categoryId: priceCategoryInput.value,
    note: priceNoteInput.value.trim(),
    oldPrice: priceOldValueInput.value.trim(),
    price: priceValueInput.value.trim(),
    discount: priceDiscountInput.value.trim(),
    features,
    active: priceActiveInput.checked,
    featured: priceFeaturedInput.checked
  };

  showLoading();

  try {
    if (editingId) {
      const nextPackages = pricePackages.map((pricePackage) => pricePackage.id === editingId ? payload : pricePackage);

      if (!await savePackages(nextPackages, priceMessage)) {
        return;
      }

      setMessage(priceMessage, "Harga berhasil diperbarui.", "success");
    } else {
      const nextPackages = [payload, ...pricePackages];

      if (!await savePackages(nextPackages, priceMessage)) {
        return;
      }

      setMessage(priceMessage, "Harga baru berhasil ditambahkan.", "success");
    }

    resetPriceForm();
    closeModal(priceModal);
  } finally {
    hideLoading();
  }
});

priceList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-price-action]");

  if (!actionButton) {
    return;
  }

  const row = actionButton.closest(".price-row");
  const packageId = row.dataset.id;
  const pricePackage = pricePackages.find((item) => item.id === packageId);

  if (!pricePackage) {
    return;
  }

  if (actionButton.dataset.priceAction === "delete") {
    if (!confirm(`Hapus paket harga "${pricePackage.name}"?`)) {
      return;
    }

    showLoading();

    try {
      await savePackages(pricePackages.filter((item) => item.id !== packageId), priceMessage);
    } finally {
      hideLoading();
    }
    return;
  }

  priceIdInput.value = pricePackage.id;
  priceNameInput.value = pricePackage.name;
  priceCategoryInput.value = pricePackage.categoryId;
  priceBadgeInput.value = pricePackage.badge || "";
  priceNoteInput.value = pricePackage.note || "";
  priceValueInput.value = pricePackage.price;
  priceDiscountInput.value = pricePackage.discount;
  priceOldValueInput.value = pricePackage.oldPrice;
  priceFeaturesInput.value = pricePackage.features.join("\n");
  priceFeaturedInput.checked = pricePackage.featured;
  priceActiveInput.checked = pricePackage.active !== false;
  priceFormTitle.textContent = "Edit Harga";
  setMessage(priceMessage, "Mode edit harga aktif.", "success");
  openModal(priceModal);
});

categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const editingId = categoryIdInput.value;
  const label = categoryLabelInput.value.trim();
  const title = categoryTitleInput.value.trim();
  const description = categoryDescriptionInput.value.trim();
  const generatedId = window.AWHCatalogStore.slugifyCategory(label);
  const finalId = editingId || generatedId;
  const duplicateCategory = categories.find((category) => category.id === finalId && category.id !== editingId);

  if (duplicateCategory) {
    setMessage(categoryMessage, "Kategori dengan nama ini sudah ada.", "error");
    return;
  }

  const payload = {
    id: finalId,
    label,
    title,
    description
  };

  showLoading();

  try {
    if (editingId) {
      const nextCategories = categories.map((category) => category.id === editingId ? payload : category);

      if (!await saveCategories(nextCategories, categoryMessage)) {
        return;
      }

      setMessage(categoryMessage, "Kategori berhasil diperbarui.", "success");
    } else {
      const nextCategories = [...categories, payload];

      if (!await saveCategories(nextCategories, categoryMessage)) {
        return;
      }

      setMessage(categoryMessage, "Kategori baru berhasil ditambahkan.", "success");
    }

    resetCategoryForm();
    closeModal(categoryModal);
    setMessage(categoryMessage, editingId ? "Kategori berhasil diperbarui." : "Kategori baru berhasil ditambahkan.", "success");
  } finally {
    hideLoading();
  }
});

categoryList.addEventListener("click", async (event) => {
  const actionButton = event.target.closest("[data-category-action]");

  if (!actionButton) {
    return;
  }

  const row = actionButton.closest(".category-row");
  const categoryId = row.dataset.id;
  const category = categories.find((item) => item.id === categoryId);

  if (!category) {
    return;
  }

  if (actionButton.dataset.categoryAction === "delete") {
    if (categories.length <= 1) {
      setMessage(categoryMessage, "Minimal harus ada satu kategori.", "error");
      return;
    }

    const themeCount = themes.filter((theme) => theme.categoryId === categoryId).length;
    const confirmMessage = themeCount
      ? `Hapus kategori "${category.label}" dan ${themeCount} tema di dalamnya?`
      : `Hapus kategori "${category.label}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    const nextCategories = categories.filter((item) => item.id !== categoryId);
    const nextThemes = themes.filter((theme) => theme.categoryId !== categoryId);
    const nextPackages = pricePackages.filter((pricePackage) => pricePackage.categoryId !== categoryId);

    showLoading();

    try {
      if (!await saveAdminCatalogSnapshot({
        categories: nextCategories,
        packages: nextPackages,
        themes: nextThemes
      }, categoryMessage)) {
        return;
      }

      resetCategoryForm();
      resetPriceForm();
      resetForm();
    } finally {
      hideLoading();
    }
    return;
  }

  categoryIdInput.value = category.id;
  categoryLabelInput.value = category.label;
  categoryTitleInput.value = category.title;
  categoryDescriptionInput.value = category.description;
  categoryFormTitle.textContent = "Edit Kategori";
  setMessage(categoryMessage, "Mode edit kategori aktif.", "success");
  openModal(categoryModal);
});

filterCategoryInput.addEventListener("change", renderThemeList);
themeSearchInput.addEventListener("input", renderThemeList);
cancelEditButton.addEventListener("click", () => {
  resetForm();
  closeModal(themeModal);
});
cancelCategoryEditButton.addEventListener("click", () => {
  resetCategoryForm();
  closeModal(categoryModal);
});
cancelPriceEditButton.addEventListener("click", () => {
  resetPriceForm();
  closeModal(priceModal);
});

window.AWHCatalogStore.ready.then(() => {
  populateCategories();

  if (isLoggedIn()) {
    showDashboard();
  } else {
    showLogin();
  }
});
