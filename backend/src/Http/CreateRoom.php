<?php

namespace App\Http;

use App\RoomManager;
use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServerInterface;
use Psr\Http\Message\RequestInterface;

class CreateRoom implements HttpServerInterface
{
    public function __construct(private RoomManager $rooms) {}

    public function onOpen(ConnectionInterface $conn, RequestInterface $request = null): void
    {
        // Allow CORS preflight
        if ($request && strtoupper($request->getMethod()) === 'OPTIONS') {
            $this->respond($conn, 204, '');
            return;
        }

        $room = $this->rooms->create();
        $this->respond($conn, 200, json_encode(['code' => $room->code]));
    }

    public function onMessage(ConnectionInterface $from, $msg): void {}
    public function onClose(ConnectionInterface $conn): void {}
    public function onError(ConnectionInterface $conn, \Exception $e): void { $conn->close(); }

    private function respond(ConnectionInterface $conn, int $status, string $body): void
    {
        $phrases = [200 => 'OK', 204 => 'No Content', 404 => 'Not Found'];
        $phrase  = $phrases[$status] ?? 'OK';
        $len     = strlen($body);
        $conn->send(implode("\r\n", [
            "HTTP/1.1 {$status} {$phrase}",
            "Content-Type: application/json",
            "Content-Length: {$len}",
            "Access-Control-Allow-Origin: *",
            "Access-Control-Allow-Methods: POST, GET, OPTIONS",
            "Access-Control-Allow-Headers: Content-Type",
            "Connection: close",
            "",
            $body,
        ]));
        $conn->close();
    }
}
