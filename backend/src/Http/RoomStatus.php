<?php

namespace App\Http;

use App\RoomManager;
use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServerInterface;
use Psr\Http\Message\RequestInterface;

class RoomStatus implements HttpServerInterface
{
    public function __construct(private RoomManager $rooms) {}

    public function onOpen(ConnectionInterface $conn, RequestInterface $request = null): void
    {
        // Extract code from path: /api/room/{code}/status
        $path  = $request ? $request->getUri()->getPath() : '';
        $parts = explode('/', trim($path, '/'));
        $code  = $parts[2] ?? '';

        $room = $this->rooms->get($code);
        if (!$room) {
            $this->respond($conn, 404, json_encode(['exists' => false]));
            return;
        }

        $this->respond($conn, 200, json_encode([
            'exists'       => true,
            'has_sender'   => $room->sender !== null,
            'has_receiver' => $room->receiver !== null,
        ]));
    }

    public function onMessage(ConnectionInterface $from, $msg): void {}
    public function onClose(ConnectionInterface $conn): void {}
    public function onError(ConnectionInterface $conn, \Exception $e): void { $conn->close(); }

    private function respond(ConnectionInterface $conn, int $status, string $body): void
    {
        $phrases = [200 => 'OK', 404 => 'Not Found'];
        $phrase  = $phrases[$status] ?? 'OK';
        $len     = strlen($body);
        $conn->send(implode("\r\n", [
            "HTTP/1.1 {$status} {$phrase}",
            "Content-Type: application/json",
            "Content-Length: {$len}",
            "Access-Control-Allow-Origin: *",
            "Connection: close",
            "",
            $body,
        ]));
        $conn->close();
    }
}
