<?php
/**
 * RapidTechPro Image Upload Receiver for Hostinger / cPanel Server
 * Place this file inside: public_html/rapid_panel/uploadImage.php
 * Uploaded files will be stored in: public_html/rapid_panel/uploads/
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// 1. Check for Base64 JSON payload
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['image'])) {
    $data = $input['image'];
    if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
        $data = substr($data, strpos($data, ',') + 1);
        $type = strtolower($type[1]);
        if ($type === 'jpeg') $type = 'jpg';

        if (!in_array($type, ['jpg', 'png', 'gif', 'webp'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid image format. Allowed: JPG, PNG, GIF, WebP']);
            exit();
        }

        $data = base64_decode($data);
        if ($data === false) {
            http_response_code(400);
            echo json_encode(['error' => 'Base64 decode failed']);
            exit();
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid base64 data format']);
        exit();
    }

    $fileName = time() . '_' . uniqid() . '.' . $type;
    $filePath = $uploadDir . $fileName;

    if (file_put_contents($filePath, $data)) {
        echo json_encode([
            'success' => true,
            'image_url' => $fileName
        ]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write file to uploads directory']);
        exit();
    }
}

// 2. Check for Multipart form-data
if (isset($_FILES['file'])) {
    $file = $_FILES['file'];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_' . uniqid() . '.' . $extension;
    $filePath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        echo json_encode([
            'success' => true,
            'image_url' => $fileName
        ]);
        exit();
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
        exit();
    }
}

http_response_code(400);
echo json_encode(['error' => 'No image file or data provided']);
