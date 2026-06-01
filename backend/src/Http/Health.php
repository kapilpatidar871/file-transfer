<?php

namespace App\Http;

use Ratchet\ConnectionInterface;
use Ratchet\Http\HttpServerInterface;
use Psr\Http\Message\RequestInterface;

class Health implements HttpServerInterface
{
    public function onOpen(ConnectionInterface $conn, RequestInterface $request = null): void
    {
        $body = json_encode(['status' => 'ok', 'time' => time()]);
        $len  = strlen($body);
        $conn->send(implode("\r\n", [
            "HTTP/1.1 200 OK",
            "Content-Type: application/json",
            "Content-Length: {$len}",
            "Access-Control-Allow-Origin: *",
            "Connection: close",
            "",
            $body,
        ]));
        $conn->close();
    }

    public function onMessage(ConnectionInterface $from, $msg): void {}
    public function onClose(ConnectionInterface $conn): void {}
    public function onError(ConnectionInterface $conn, \Exception $e): void { $conn->close(); }
}
