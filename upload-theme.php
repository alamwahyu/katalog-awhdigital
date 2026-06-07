<?php
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/thema';
$publicDir = 'thema';
$maxSize = 4 * 1024 * 1024;
$allowedTypes = [
  'image/jpeg' => 'jpg',
  'image/png' => 'png',
  'image/webp' => 'webp'
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
  exit;
}

if (!isset($_FILES['themeImage']) || !is_uploaded_file($_FILES['themeImage']['tmp_name'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'File gambar tidak ditemukan.']);
  exit;
}

$file = $_FILES['themeImage'];

if ($file['size'] > $maxSize) {
  http_response_code(413);
  echo json_encode(['success' => false, 'message' => 'Ukuran gambar maksimal 4MB.']);
  exit;
}

$mimeType = mime_content_type($file['tmp_name']);

if (!isset($allowedTypes[$mimeType])) {
  http_response_code(415);
  echo json_encode(['success' => false, 'message' => 'Format gambar harus JPG, PNG, atau WEBP.']);
  exit;
}

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Folder thema tidak bisa dibuat.']);
  exit;
}

$filename = 'tema-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $allowedTypes[$mimeType];
$targetPath = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Gambar gagal disimpan.']);
  exit;
}

echo json_encode([
  'success' => true,
  'path' => $publicDir . '/' . $filename
]);
