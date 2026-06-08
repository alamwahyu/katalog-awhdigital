const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

const ROOT_DIR = __dirname;
const CATALOG_PATH = path.join(ROOT_DIR, "catalog.json");
const THEMA_DIR = path.join(ROOT_DIR, "thema");
const PORT = Number(process.env.PORT || 3001);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
};

const readBody = (request, maxBytes) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("REQUEST_TOO_LARGE"));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
};

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

const parseMultipartFile = (body, contentType, fieldName) => {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

  if (!boundaryMatch) {
    throw new Error("BOUNDARY_NOT_FOUND");
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const parts = body.toString("binary").split(`--${boundary}`);

  for (const part of parts) {
    if (!part.includes(`name="${fieldName}"`)) {
      continue;
    }

    const headerEnd = part.indexOf("\r\n\r\n");

    if (headerEnd === -1) {
      continue;
    }

    const rawHeaders = part.slice(0, headerEnd);
    let binaryContent = part.slice(headerEnd + 4);

    if (binaryContent.endsWith("\r\n")) {
      binaryContent = binaryContent.slice(0, -2);
    }

    const typeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);
    const filenameMatch = rawHeaders.match(/filename="([^"]*)"/i);

    return {
      filename: filenameMatch ? path.basename(filenameMatch[1]) : "theme-image",
      mimeType: typeMatch ? typeMatch[1].trim().toLowerCase() : "",
      buffer: Buffer.from(binaryContent, "binary")
    };
  }

  throw new Error("FILE_NOT_FOUND");
};

const handleCatalogApi = async (request, response) => {
  if (request.method === "GET") {
    sendJson(response, 200, await readCatalog());
    return;
  }

  if (request.method !== "PUT") {
    sendJson(response, 405, { success: false, message: "Method tidak diizinkan." });
    return;
  }

  const body = await readBody(request, 5 * 1024 * 1024);
  const catalog = JSON.parse(body.toString("utf8"));

  if (!Array.isArray(catalog.categories) || !Array.isArray(catalog.themes) || !Array.isArray(catalog.packages)) {
    sendJson(response, 400, { success: false, message: "Format catalog.json tidak valid." });
    return;
  }

  const previousCatalog = await readCatalog();
  await writeCatalog(catalog);
  await deleteUnusedThemeImages(previousCatalog, catalog);
  sendJson(response, 200, { success: true, catalog });
};

const handleUploadApi = async (request, response) => {
  if (request.method !== "POST") {
    sendJson(response, 405, { success: false, message: "Method tidak diizinkan." });
    return;
  }

  const contentType = request.headers["content-type"] || "";

  if (!contentType.includes("multipart/form-data")) {
    sendJson(response, 400, { success: false, message: "Request harus multipart/form-data." });
    return;
  }

  const body = await readBody(request, 6 * 1024 * 1024);
  const file = parseMultipartFile(body, contentType, "themeImage");
  const extension = IMAGE_TYPES[file.mimeType];

  if (!extension) {
    sendJson(response, 415, { success: false, message: "Format gambar harus JPG, PNG, atau WEBP." });
    return;
  }

  await fs.promises.mkdir(THEMA_DIR, { recursive: true });

  const filename = `tema-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(4).toString("hex")}.${extension}`;
  const targetPath = path.join(THEMA_DIR, filename);

  await fs.promises.writeFile(targetPath, file.buffer);
  sendJson(response, 200, { success: true, path: `thema/${filename}` });
};

const serveStatic = async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(requestUrl.pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT_DIR, relativePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);
    const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const extension = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": extension === ".html" || extension === ".json" ? "no-store" : "public, max-age=3600"
    });
    fs.createReadStream(finalPath).pipe(response);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/catalog")) {
      await handleCatalogApi(request, response);
      return;
    }

    if (request.url.startsWith("/api/upload-theme")) {
      await handleUploadApi(request, response);
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    const statusCode = error.message === "REQUEST_TOO_LARGE" ? 413 : 500;
    sendJson(response, statusCode, {
      success: false,
      message: statusCode === 413 ? "Ukuran request terlalu besar." : "Server error.",
      detail: process.env.NODE_ENV === "production" ? undefined : error.message
    });
  }
});

server.listen(PORT, () => {
  console.log(`AWH Digital running at http://localhost:${PORT}`);
});
