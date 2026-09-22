<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$target_dir = "uploads/";

if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

// 1. DIRECT RAW BINARY UPLOAD (Multipart form-data) - NO Base64 overhead!
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $tmp_name = $_FILES['file']['tmp_name'];
    $original_name = $_FILES['file']['name'];
    $extension = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));

    if (empty($extension)) {
        $extension = 'webp';
    }

    if (!in_array($extension, ['webp', 'jpg', 'jpeg', 'png', 'gif', 'ico', 'svg'])) {
        echo json_encode(['error' => 'Invalid image format. Allowed: WEBP, JPG, PNG, GIF, ICO, SVG']);
        exit();
    }

    $file_name = uniqid() . '.' . $extension;
    $file_path = $target_dir . $file_name;

    if (move_uploaded_file($tmp_name, $file_path)) {
        echo json_encode([
            'success' => true,
            'image_url' => $file_name
        ]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save binary uploaded file.']);
        exit();
    }
}

// 2. Base64 fallback (for legacy compatibility)
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['image']) && !empty($data['image'])) {
    $base64_image = $data['image'];
    $type = isset($data['type']) ? strtolower($data['type']) : 'webp';

    if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'ico', 'svg'])) {
        echo json_encode(['error' => 'Invalid image type.']);
        exit();
    }

    if (strpos($base64_image, 'base64,') !== false) {
        $base64_image = substr($base64_image, strpos($base64_image, ',') + 1);
    }

    $image_data = base64_decode($base64_image);
    if ($image_data === false) {
        echo json_encode(['error' => 'Base64 decoding failed.']);
        exit();
    }

    $file_name = uniqid() . '.' . $type;
    $file_path = $target_dir . $file_name;

    if (file_put_contents($file_path, $image_data)) {
        echo json_encode([
            'success' => true,
            'image_url' => $file_name
        ]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save the image.']);
        exit();
    }
}

http_response_code(400);
echo json_encode(['error' => 'No image file or data provided.']);
?>
