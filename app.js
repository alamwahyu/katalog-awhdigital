const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const ROOT_DIR = __dirname;
const CATALOG_PATH = path.join(ROOT_DIR, "catalog.json");
const THEMA_DIR = path.join(ROOT_DIR, "thema");
const IS_VERCEL = Boolean(process.env.VERCEL);

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024
  },
  fileFilter: (request, file, callback) => {
    if (!IMAGE_TYPES[file.mimetype]) {
      callback(new Error("INVALID_IMAGE_TYPE"));
      return;
    }

    callback(null, true);
  }
});

app.use(express.json({ limit: "5mb" }));
app.use(express.static(ROOT_DIR, {
  extensions: ["html"],
  setHeaders: (response, filePath) => {
    const extension = path.extname(filePath);
    response.setHeader("Cache-Control", extension === ".html" || extension === ".json" ? "no-store" : "public, max-age=3600");
  }
}));

const readCatalog = async () => {
  const content = await fs.promises.readFile(CATALOG_PATH, "utf8");
  return JSON.parse(content);
};

const writeCatalog = async (catalog) => {
  const temporaryPath = `${CATALOG_PATH}.tmp`;
  const content = `${JSON.stringify(catalog, null, 2)}\n`;
  await fs.promises.writeFile(temporaryPath, content, "utf8");
  await fs.promises.rename(temporaryPath, CATALOG_PATH);
};

const getLocalThemeImagePath = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    return "";
  }

  const normalizedPath = imagePath.replace(/^\/+/, "");

  if (!normalizedPath.startsWith("thema/")) {
    return "";
  }

  const absolutePath = path.resolve(ROOT_DIR, normalizedPath);

  if (!absolutePath.startsWith(THEMA_DIR + path.sep)) {
    return "";
  }

  return absolutePath;
};

const getThemeImageSet = (catalog) => {
  if (!catalog || !Array.isArray(catalog.themes)) {
    return new Set();
  }

  return new Set(
    catalog.themes
      .map((theme) => getLocalThemeImagePath(theme.image))
      .filter(Boolean)
  );
};

const deleteUnusedThemeImages = async (previousCatalog, nextCatalog) => {
  const previousImages = getThemeImageSet(previousCatalog);
  const nextImages = getThemeImageSet(nextCatalog);
  const unusedImages = [...previousImages].filter((imagePath) => !nextImages.has(imagePath));

  await Promise.all(unusedImages.map(async (imagePath) => {
    try {
      await fs.promises.unlink(imagePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn(`Gagal menghapus gambar tema: ${imagePath}`, error.message);
      }
    }
  }));
};

const validateCatalog = (catalog) => {
  return Boolean(
    catalog &&
    Array.isArray(catalog.categories) &&
    Array.isArray(catalog.themes) &&
    Array.isArray(catalog.packages)
  );
};

const rejectVercelFileWrite = (response) => {
  response.status(501).json({
    success: false,
    message: "Vercel serverless tidak mendukung penyimpanan file permanen. Gunakan database/storage seperti Supabase + Vercel Blob/Cloudinary untuk mode production."
  });
};

app.get("/api/catalog", async (request, response, next) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json(await readCatalog());
  } catch (error) {
    next(error);
  }
});

app.put("/api/catalog", async (request, response, next) => {
  try {
    if (IS_VERCEL) {
      rejectVercelFileWrite(response);
      return;
    }

    const catalog = request.body;

    if (!validateCatalog(catalog)) {
      response.status(400).json({ success: false, message: "Format catalog.json tidak valid." });
      return;
    }

    const previousCatalog = await readCatalog();
    await writeCatalog(catalog);
    await deleteUnusedThemeImages(previousCatalog, catalog);
    response.json({ success: true, catalog });
  } catch (error) {
    next(error);
  }
});

app.post("/api/upload-theme", upload.single("themeImage"), async (request, response, next) => {
  try {
    if (IS_VERCEL) {
      rejectVercelFileWrite(response);
      return;
    }

    if (!request.file) {
      response.status(400).json({ success: false, message: "File gambar tidak ditemukan." });
      return;
    }

    const extension = IMAGE_TYPES[request.file.mimetype];

    if (!extension) {
      response.status(415).json({ success: false, message: "Format gambar harus JPG, PNG, atau WEBP." });
      return;
    }

    await fs.promises.mkdir(THEMA_DIR, { recursive: true });

    const filename = `tema-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
    const targetPath = path.join(THEMA_DIR, filename);

    await fs.promises.writeFile(targetPath, request.file.buffer);
    response.json({ success: true, path: `thema/${filename}` });
  } catch (error) {
    next(error);
  }
});

app.use((error, request, response, next) => {
  if (error.message === "INVALID_IMAGE_TYPE") {
    response.status(415).json({ success: false, message: "Format gambar harus JPG, PNG, atau WEBP." });
    return;
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({ success: false, message: "Ukuran gambar maksimal 4MB." });
    return;
  }

  console.error(error);
  response.status(500).json({
    success: false,
    message: "Server error.",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
});

module.exports = app;
