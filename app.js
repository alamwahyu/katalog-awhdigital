const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const multer = require("multer");

const ROOT_DIR = __dirname;
const CATALOG_PATH = path.join(ROOT_DIR, "catalog.json");
const THEMA_DIR = path.join(ROOT_DIR, "thema");
const CATALOG_BLOB_PATH = "data/catalog.json";
const BLOB_IMAGE_PREFIX = "theme-images";

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

const hasBlobToken = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const isVercelRuntime = () => Boolean(process.env.VERCEL);

const rejectMissingBlobToken = (response) => {
  response.status(503).json({
    success: false,
    message: "Vercel Blob belum terhubung. Pastikan environment BLOB_READ_WRITE_TOKEN tersedia di Vercel."
  });
};

const getBlobSdk = async () => {
  return import("@vercel/blob");
};

const blobStreamToJson = async (stream) => {
  const text = await new Response(stream).text();
  return JSON.parse(text);
};

const readLegacyPublicBlobCatalog = async () => {
  const { list } = await getBlobSdk();
  const { blobs } = await list({
    prefix: CATALOG_BLOB_PATH,
    limit: 10
  });
  const catalogBlob = blobs.find((blob) => blob.pathname === CATALOG_BLOB_PATH);

  if (!catalogBlob) {
    return null;
  }

  const response = await fetch(catalogBlob.downloadUrl || catalogBlob.url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Blob catalog gagal dibaca.");
  }

  return response.json();
};

const readBlobCatalog = async () => {
  const { get, put } = await getBlobSdk();
  const catalogBlob = await get(CATALOG_BLOB_PATH, {
    access: "private",
    useCache: false
  }).catch(() => null);

  if (catalogBlob && catalogBlob.stream) {
    return blobStreamToJson(catalogBlob.stream);
  }

  const legacyCatalog = await readLegacyPublicBlobCatalog();

  if (!legacyCatalog) {
    const localCatalog = await readCatalog();
    await put(CATALOG_BLOB_PATH, JSON.stringify(localCatalog, null, 2), {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return localCatalog;
  }

  await put(CATALOG_BLOB_PATH, JSON.stringify(legacyCatalog, null, 2), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });
  return legacyCatalog;
};

const writeBlobCatalog = async (catalog) => {
  const { put } = await getBlobSdk();

  await put(CATALOG_BLOB_PATH, JSON.stringify(catalog, null, 2), {
    access: "private",
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60
  });
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

const getManagedBlobImage = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") {
    return "";
  }

  if (!imagePath.startsWith("http")) {
    return imagePath.startsWith(`${BLOB_IMAGE_PREFIX}/`) ? imagePath : "";
  }

  try {
    const url = new URL(imagePath);

    if (!url.hostname.includes("blob.vercel-storage.com")) {
      return "";
    }

    return url.pathname.includes(`/${BLOB_IMAGE_PREFIX}/`) ? imagePath : "";
  } catch (error) {
    return "";
  }
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

const getBlobImageSet = (catalog) => {
  if (!catalog || !Array.isArray(catalog.themes)) {
    return new Set();
  }

  return new Set(
    catalog.themes
      .map((theme) => getManagedBlobImage(theme.image))
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

  if (!hasBlobToken()) {
    return;
  }

  const previousBlobImages = getBlobImageSet(previousCatalog);
  const nextBlobImages = getBlobImageSet(nextCatalog);
  const unusedBlobImages = [...previousBlobImages].filter((imagePath) => !nextBlobImages.has(imagePath));

  if (!unusedBlobImages.length) {
    return;
  }

  const { del } = await getBlobSdk();
  await del(unusedBlobImages);
};

const validateCatalog = (catalog) => {
  return Boolean(
    catalog &&
    Array.isArray(catalog.categories) &&
    Array.isArray(catalog.themes) &&
    Array.isArray(catalog.packages)
  );
};

app.get("/api/catalog", async (request, response, next) => {
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json(hasBlobToken() ? await readBlobCatalog() : await readCatalog());
  } catch (error) {
    next(error);
  }
});

app.put("/api/catalog", async (request, response, next) => {
  try {
    if (!hasBlobToken() && isVercelRuntime()) {
      rejectMissingBlobToken(response);
      return;
    }

    const catalog = request.body;

    if (!validateCatalog(catalog)) {
      response.status(400).json({ success: false, message: "Format catalog.json tidak valid." });
      return;
    }

    const previousCatalog = hasBlobToken() ? await readBlobCatalog() : await readCatalog();

    if (hasBlobToken()) {
      await writeBlobCatalog(catalog);
    } else {
      await writeCatalog(catalog);
    }

    await deleteUnusedThemeImages(previousCatalog, catalog);
    response.json({ success: true, catalog });
  } catch (error) {
    next(error);
  }
});

app.post("/api/upload-theme", upload.single("themeImage"), async (request, response, next) => {
  try {
    if (!hasBlobToken() && isVercelRuntime()) {
      rejectMissingBlobToken(response);
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

    const filename = `tema-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}.${extension}`;

    if (hasBlobToken()) {
      const { put } = await getBlobSdk();
      const blob = await put(`${BLOB_IMAGE_PREFIX}/${filename}`, request.file.buffer, {
        access: "public",
        contentType: request.file.mimetype,
        addRandomSuffix: false,
        cacheControlMaxAge: 60 * 60 * 24 * 30
      });

      response.json({ success: true, path: blob.url });
      return;
    }

    await fs.promises.mkdir(THEMA_DIR, { recursive: true });

    const targetPath = path.join(THEMA_DIR, filename);

    await fs.promises.writeFile(targetPath, request.file.buffer);
    response.json({ success: true, path: `thema/${filename}` });
  } catch (error) {
    next(error);
  }
});

app.get(["/", "/index.html"], (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.get("/admin.html", (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.sendFile(path.join(ROOT_DIR, "admin.html"));
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
