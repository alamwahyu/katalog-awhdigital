const AWH_CATALOG_STORAGE_KEY = "awhDigitalCatalogThemes";
const AWH_CATEGORY_STORAGE_KEY = "awhDigitalCatalogCategories";

const AWH_DEFAULT_CATEGORIES = [
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
];

const AWH_DEFAULT_IMAGES = {
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

const AWH_THEME_NAMES = {
  special: ["Royal Garden", "Golden Vow", "Pearl Romance", "Velvet Bloom", "Ivory Luxe", "Eternal Sage", "Champagne Story", "Serenity Gold"],
  motion: ["Motion Aurora", "3D Blossom", "Floating Garden", "Cinematic Vow", "Royal Motion", "Galaxy Love", "Velvet Frame", "Golden Orbit"],
  classic: ["Java Heritage", "Nusantara Ayu", "Royal Adat", "Classic Maroon", "Siger Elegance", "Jogja Royal", "Minang Gold", "Heritage Calm"],
  floral: ["Rose Elegance", "Floral Blue", "Sage Garden", "Lily Minimal", "Blush Story", "White Orchid", "Dusty Romance", "Gardenia Soft"],
  aqiqah: ["Baby Blessing", "Little Garden", "Soft Aqiqah", "Blue Joy", "Pink Wonder", "Family Moment"]
};

const AWH_PRICE_BY_CATEGORY = {
  special: { oldPrice: "Rp249.000", price: "Rp149.000", discount: "40%" },
  motion: { oldPrice: "Rp299.000", price: "Rp189.000", discount: "35%" },
  classic: { oldPrice: "Rp189.000", price: "Rp109.000", discount: "40%" },
  floral: { oldPrice: "Rp189.000", price: "Rp109.000", discount: "40%" },
  aqiqah: { oldPrice: "Rp159.000", price: "Rp99.000", discount: "38%" }
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
    return [...AWH_DEFAULT_CATEGORIES];
  }

  return categories.map((category, index) => ({
    id: category.id || slugifyCategory(category.label || `Kategori ${index + 1}`),
    label: category.label || `Kategori ${index + 1}`,
    title: category.title || category.label || `KATEGORI ${index + 1}`,
    description: category.description || "Pilih tema undangan digital sesuai kebutuhan acara Anda."
  }));
};

const loadCatalogCategories = () => {
  try {
    const rawCategories = localStorage.getItem(AWH_CATEGORY_STORAGE_KEY);

    if (!rawCategories) {
      const defaultCategories = normalizeCategories(AWH_DEFAULT_CATEGORIES);
      localStorage.setItem(AWH_CATEGORY_STORAGE_KEY, JSON.stringify(defaultCategories));
      return defaultCategories;
    }

    return normalizeCategories(JSON.parse(rawCategories));
  } catch (error) {
    return normalizeCategories(AWH_DEFAULT_CATEGORIES);
  }
};

const createDefaultThemes = () => {
  return AWH_DEFAULT_CATEGORIES.flatMap((category) => {
    const names = AWH_THEME_NAMES[category.id];
    const images = AWH_DEFAULT_IMAGES[category.id];
    const pricing = AWH_PRICE_BY_CATEGORY[category.id];

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
      bestSeller: index === 0 || index === 2 || index === 4
    }));
  });
};

const normalizeThemes = (themes) => {
  const categories = loadCatalogCategories();
  const fallbackCategory = categories[0] ? categories[0].id : "special";
  const validCategoryIds = new Set(categories.map((category) => category.id));

  if (!Array.isArray(themes)) {
    return createDefaultThemes();
  }

  return themes.map((theme, index) => ({
    id: theme.id || `theme-${Date.now()}-${index}`,
    name: theme.name || "Tema Baru",
    themeBadge: theme.themeBadge || "",
    categoryId: validCategoryIds.has(theme.categoryId) ? theme.categoryId : fallbackCategory,
    image: theme.image || AWH_DEFAULT_IMAGES.special[0],
    oldPrice: theme.oldPrice || "",
    price: theme.price || "Rp0",
    discount: theme.discount || "0%",
    previewLink: theme.previewLink || "",
    bestSeller: Boolean(theme.bestSeller)
  }));
};

const loadCatalogThemes = () => {
  try {
    const rawThemes = localStorage.getItem(AWH_CATALOG_STORAGE_KEY);

    if (!rawThemes) {
      const defaultThemes = createDefaultThemes();
      localStorage.setItem(AWH_CATALOG_STORAGE_KEY, JSON.stringify(defaultThemes));
      return defaultThemes;
    }

    return normalizeThemes(JSON.parse(rawThemes));
  } catch (error) {
    return createDefaultThemes();
  }
};

const saveCatalogThemes = (themes) => {
  const normalizedThemes = normalizeThemes(themes);
  localStorage.setItem(AWH_CATALOG_STORAGE_KEY, JSON.stringify(normalizedThemes));
  window.dispatchEvent(new CustomEvent("awhCatalogUpdated", { detail: normalizedThemes }));
  return normalizedThemes;
};

const saveCatalogCategories = (categories) => {
  const normalizedCategories = normalizeCategories(categories);
  localStorage.setItem(AWH_CATEGORY_STORAGE_KEY, JSON.stringify(normalizedCategories));
  window.dispatchEvent(new CustomEvent("awhCategoriesUpdated", { detail: normalizedCategories }));
  return normalizedCategories;
};

const resetCatalogData = () => {
  const defaultCategories = saveCatalogCategories(AWH_DEFAULT_CATEGORIES);
  const defaultThemes = saveCatalogThemes(createDefaultThemes());
  return { categories: defaultCategories, themes: defaultThemes };
};

window.AWHCatalogStore = {
  get categories() {
    return loadCatalogCategories();
  },
  categoryKey: AWH_CATEGORY_STORAGE_KEY,
  themeKey: AWH_CATALOG_STORAGE_KEY,
  load: loadCatalogThemes,
  save: saveCatalogThemes,
  loadCategories: loadCatalogCategories,
  saveCategories: saveCatalogCategories,
  reset: resetCatalogData,
  slugifyCategory
};
