const AWH_JSON_SOURCE = "catalog.json";
const AWH_CATALOG_DRAFT_KEY = "awhDigitalCatalogDraft";

const AWH_FALLBACK_CATALOG = {
  categories: [
    {
      id: "special",
      label: "Special Design",
      title: "SPESIAL DESIGN",
      description: "Template elegan dengan komposisi premium untuk undangan yang terlihat personal dan berkelas."
    },
    {
      id: "motion",
      label: "3D Motion",
      title: "3D MOTION WEB",
      description: "Desain modern dengan nuansa dinamis untuk tampilan undangan yang lebih hidup."
    },
    {
      id: "classic",
      label: "Classic & Etnik",
      title: "WEDDING TEMA CLASSIC & ADAT",
      description: "Nuansa klasik dan adat untuk pasangan yang menyukai tampilan hangat, formal, dan timeless."
    },
    {
      id: "floral",
      label: "Floral & Simple",
      title: "WEDDING TEMA FLORAL & MINIMALIS",
      description: "Pilihan tema soft, clean, dan romantis dengan sentuhan floral minimalis."
    },
    {
      id: "aqiqah",
      label: "Non Wedding",
      title: "AQIQAH DLL",
      description: "Template non wedding untuk aqiqah, tasyakuran, ulang tahun, dan acara keluarga lainnya."
    }
  ],
  themes: []
};

const fallbackImages = {
  special: [
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80"
  ],
  motion: [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=700&q=80"
  ],
  classic: [
    "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1505944357431-27579db47558?auto=format&fit=crop&w=700&q=80"
  ],
  floral: [
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1509719662288-7d705e5280b5?auto=format&fit=crop&w=700&q=80"
  ],
  aqiqah: [
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=700&q=80"
  ]
};

const fallbackThemeNames = {
  special: ["Royal Garden", "Golden Vow", "Pearl Romance", "Velvet Bloom"],
  motion: ["Motion Aurora", "3D Blossom", "Floating Garden", "Cinematic Vow"],
  classic: ["Java Heritage", "Nusantara Ayu", "Royal Adat", "Classic Maroon"],
  floral: ["Rose Elegance", "Floral Blue", "Sage Garden", "Lily Minimal"],
  aqiqah: ["Baby Blessing", "Little Garden", "Soft Aqiqah", "Blue Joy"]
};

const fallbackPrices = {
  special: { oldPrice: "Rp249.000", price: "Rp149.000", discount: "40%" },
  motion: { oldPrice: "Rp299.000", price: "Rp189.000", discount: "35%" },
  classic: { oldPrice: "Rp189.000", price: "Rp109.000", discount: "40%" },
  floral: { oldPrice: "Rp189.000", price: "Rp109.000", discount: "40%" },
  aqiqah: { oldPrice: "Rp159.000", price: "Rp99.000", discount: "38%" }
};

const createFallbackThemes = () => {
  return AWH_FALLBACK_CATALOG.categories.flatMap((category) => {
    const names = fallbackThemeNames[category.id] || [];
    const images = fallbackImages[category.id] || fallbackImages.special;
    const pricing = fallbackPrices[category.id] || fallbackPrices.special;

    return names.map((name, index) => ({
      id: `${category.id}-${String(index + 1).padStart(2, "0")}`,
      name,
      themeBadge: `${category.id.toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
      categoryId: category.id,
      image: images[index % images.length],
      oldPrice: pricing.oldPrice,
      price: pricing.price,
      discount: pricing.discount,
      previewLink: "",
      bestSeller: index === 0 || index === 2
    }));
  });
};

AWH_FALLBACK_CATALOG.themes = createFallbackThemes();

let catalogState = {
  categories: [],
  themes: []
};

const slugifyCategory = (value) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `kategori-${Date.now()}`;
};

const normalizeCategories = (categories) => {
  if (!Array.isArray(categories) || !categories.length) {
    return [...AWH_FALLBACK_CATALOG.categories];
  }

  return categories.map((category, index) => ({
    id: category.id || slugifyCategory(category.label || `Kategori ${index + 1}`),
    label: category.label || `Kategori ${index + 1}`,
    title: category.title || category.label || `KATEGORI ${index + 1}`,
    description: category.description || "Pilih tema undangan digital sesuai kebutuhan acara Anda."
  }));
};

const normalizeThemes = (themes, categories = catalogState.categories) => {
  const fallbackCategory = categories[0] ? categories[0].id : "special";
  const validCategoryIds = new Set(categories.map((category) => category.id));

  if (!Array.isArray(themes)) {
    return [...AWH_FALLBACK_CATALOG.themes];
  }

  return themes.map((theme, index) => ({
    id: theme.id || `theme-${Date.now()}-${index}`,
    name: theme.name || "Tema Baru",
    themeBadge: theme.themeBadge || "",
    categoryId: validCategoryIds.has(theme.categoryId) ? theme.categoryId : fallbackCategory,
    image: theme.image || fallbackImages.special[0],
    oldPrice: theme.oldPrice || "",
    price: theme.price || "Rp0",
    discount: theme.discount || "",
    previewLink: theme.previewLink || "",
    bestSeller: Boolean(theme.bestSeller)
  }));
};

const normalizeCatalog = (catalog) => {
  const categories = normalizeCategories(catalog && catalog.categories);
  const themes = normalizeThemes(catalog && catalog.themes, categories);
  return { categories, themes };
};

const persistDraft = () => {
  localStorage.setItem(AWH_CATALOG_DRAFT_KEY, JSON.stringify(catalogState));
};

const loadJsonCatalog = async () => {
  try {
    const response = await fetch(AWH_JSON_SOURCE, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load ${AWH_JSON_SOURCE}`);
    }

    catalogState = normalizeCatalog(await response.json());
  } catch (error) {
    catalogState = normalizeCatalog(AWH_FALLBACK_CATALOG);
  }

  const draft = localStorage.getItem(AWH_CATALOG_DRAFT_KEY);

  if (draft) {
    try {
      catalogState = normalizeCatalog(JSON.parse(draft));
    } catch (error) {
      localStorage.removeItem(AWH_CATALOG_DRAFT_KEY);
    }
  }

  return catalogState;
};

const catalogReady = loadJsonCatalog();

const loadCatalogCategories = () => catalogState.categories;
const loadCatalogThemes = () => catalogState.themes;

const saveCatalogThemes = (themes) => {
  catalogState = normalizeCatalog({
    categories: catalogState.categories,
    themes
  });
  persistDraft();
  window.dispatchEvent(new CustomEvent("awhCatalogUpdated", { detail: catalogState.themes }));
  return catalogState.themes;
};

const saveCatalogCategories = (categories) => {
  catalogState = normalizeCatalog({
    categories,
    themes: catalogState.themes
  });
  persistDraft();
  window.dispatchEvent(new CustomEvent("awhCategoriesUpdated", { detail: catalogState.categories }));
  return catalogState.categories;
};

const exportCatalogJson = () => JSON.stringify(catalogState, null, 2);

const clearCatalogDraft = () => {
  localStorage.removeItem(AWH_CATALOG_DRAFT_KEY);
};

window.AWHCatalogStore = {
  get categories() {
    return loadCatalogCategories();
  },
  ready: catalogReady,
  draftKey: AWH_CATALOG_DRAFT_KEY,
  load: loadCatalogThemes,
  save: saveCatalogThemes,
  loadCategories: loadCatalogCategories,
  saveCategories: saveCatalogCategories,
  exportJson: exportCatalogJson,
  clearDraft: clearCatalogDraft,
  slugifyCategory
};
