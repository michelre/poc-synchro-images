<?php

require_once 'vendor/autoload.php';

$klein = new \Klein\Klein();

function getUploadedFiles(){
    $files = scandir(__DIR__ . '/uploads');
    $files = array_filter($files, function($file){
        preg_match('/(jpeg|png)$/m', $file, $matches);
        return count($matches) > 0;
    });
    return array_map(function($file){
        return '/uploads/' . $file;
    }, array_values($files));
}

$klein->respond('GET', '/', function ($request, $response) {
    return file_get_contents('index.html');
});

$klein->respond('GET', '/ping', function($request, $response) {
    $response->header('Content-Type', 'application/json');
    return json_encode(['status' => 'OK']);
});

$klein->respond('GET', '/uploads', function ($request, $response) {

   $response->header('Content-Type', 'application/json');
   return json_encode(getUploadedFiles());
});

$klein->respond('POST', '/upload', function (\Klein\Request $request, $response) {
    $imageData = json_decode($request->body(), true);
    $filename = '/uploads/' . uniqid() . '.jpeg';
    $f = fopen(__DIR__ . $filename, 'w');
    preg_match_all('/,(.*)$/m', $imageData['data'], $matches, PREG_SET_ORDER, 0);
    fwrite($f, base64_decode($matches[0][1]));
    fclose($f);
    return json_encode(['file' => $filename]);
});

$klein->respond('DELETE', '/upload', function (\Klein\Request $request, $response) {
    unlink(__DIR__ . $request->param('file'));
    return json_encode([]);
});

$klein->respond('GET', '@\.(js|css|jpeg|html)$', function ($request, $response) {
    $response->header('Content-Type', \MimeType\MimeType::getType(__DIR__ . $request->pathname()));
    return file_get_contents(__DIR__ . $request->pathname());
});

$klein->dispatch();