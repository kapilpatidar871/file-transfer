<?php

namespace App\Http;

use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServerInterface;
use Psr\Http\Message\RequestInterface;

/**
 * Serves the React build (dist/) as static files.
 * All unknown routes fall back to index.html (SPA support).
 */
class StaticFiles implements HttpServerInterface
{
    private string $distDir;

    private array $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf',
        'webp' => 'image/webp',
        'txt'  => 'text/plain',
    ];

    public function __construct(?string $distDir = null)
    {
        $this->distDir = $distDir ?? realpath(__DIR__ . '/../../../frontend/dist');
    }

    public function onOpen(ConnectionInterface $conn, RequestInterface $request = null): void
    {
        $uri  = $request ? $request->getUri()->getPath() : '/';
        $file = $this->resolveFile($uri);

        if (!$file || !file_exists($file)) {
            // SPA fallback — serve index.html for client-side routes
            $file = $this->distDir . '/index.html';
        }

        if (!file_exists($file)) {
            $this->send($conn, 404, 'text/plain', '404 Not Found');
            return;
        }

        $ext     = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        $mime    = $this->mimeTypes[$ext] ?? 'application/octet-stream';
        $content = file_get_contents($file);

        $this->send($conn, 200, $mime, $content);
    }

    public function onMessage(ConnectionInterface $from, $msg): void {}
    public function onClose(ConnectionInterface $conn): void {}
    public function onError(ConnectionInterface $conn, \Exception $e): void { $conn->close(); }

    private function resolveFile(string $uri): ?string
    {
        // Remove query string
        $uri  = strtok($uri, '?') ?: '/';
        $path = realpath($this->distDir . $uri);

        // Prevent path traversal
        if (!$path || !str_starts_with($path, $this->distDir)) {
            return null;
        }

        return is_file($path) ? $path : null;
    }

    private function send(ConnectionInterface $conn, int $status, string $mime, string $body): void
    {
        $phrases = [200 => 'OK', 404 => 'Not Found'];
        $phrase  = $phrases[$status] ?? 'OK';
        $len     = strlen($body);
        $conn->send(implode("\r\n", [
            "HTTP/1.1 {$status} {$phrase}",
            "Content-Type: {$mime}",
            "Content-Length: {$len}",
            "Cache-Control: public, max-age=3600",
            "Connection: close",
            "",
            $body,
        ]));
        $conn->close();
    }
}
