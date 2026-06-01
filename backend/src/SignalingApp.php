<?php

namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

/**
 * WebSocket signaling server for WebRTC P2P file transfer.
 *
 * URL pattern: /ws/{code}/{role}
 *   role = sender | receiver
 *
 * Message flow:
 *   sender  → peer_joined (when receiver connects)
 *   sender  → offer       (WebRTC offer SDP)
 *   sender  ← answer      (WebRTC answer SDP from receiver)
 *   both    ↔ ice         (ICE candidates)
 *   sender  → peer_left   (when receiver disconnects)
 */
class SignalingApp implements MessageComponentInterface
{
    /** @var \SplObjectStorage<ConnectionInterface, array> */
    private \SplObjectStorage $clients;

    public function __construct(private RoomManager $rooms)
    {
        $this->clients = new \SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn): void
    {
        // Parse /ws/{code}/{role} from the request path
        $path  = $conn->httpRequest->getUri()->getPath();
        $parts = explode('/', trim($path, '/'));

        // parts: ['ws', code, role]
        if (count($parts) < 3) {
            $this->sendJson($conn, ['type' => 'error', 'message' => 'Invalid path']);
            $conn->close();
            return;
        }

        [, $code, $role] = $parts;

        if (!in_array($role, ['sender', 'receiver'], true)) {
            $this->sendJson($conn, ['type' => 'error', 'message' => 'Invalid role']);
            $conn->close();
            return;
        }

        $room = $this->rooms->get($code);
        if (!$room) {
            $this->sendJson($conn, ['type' => 'error', 'message' => 'Room not found or expired']);
            $conn->close();
            return;
        }

        if ($role === 'sender') {
            if ($room->sender !== null) {
                $this->sendJson($conn, ['type' => 'error', 'message' => 'Sender slot taken']);
                $conn->close();
                return;
            }
            $room->sender = $conn;
        } else {
            if ($room->receiver !== null) {
                $this->sendJson($conn, ['type' => 'error', 'message' => 'Receiver slot taken']);
                $conn->close();
                return;
            }
            $room->receiver = $conn;
            // Notify sender that receiver joined
            if ($room->sender) {
                $this->sendJson($room->sender, ['type' => 'peer_joined']);
            }
        }

        $this->clients->attach($conn, ['code' => $code, 'role' => $role]);
        echo "[+] {$role} connected to room {$code}\n";
    }

    public function onMessage(ConnectionInterface $from, $msg): void
    {
        if (!$this->clients->contains($from)) return;

        $meta = $this->clients[$from];
        $room = $this->rooms->get($meta['code']);
        if (!$room) return;

        $data = json_decode($msg, true);
        if (!$data || !isset($data['type'])) return;

        $peer = $meta['role'] === 'sender' ? $room->receiver : $room->sender;

        // Forward signaling messages directly to the other peer
        if (in_array($data['type'], ['offer', 'answer', 'ice', 'ready'], true)) {
            if ($peer) $this->sendJson($peer, $data);
            return;
        }

        if ($data['type'] === 'cancel') {
            if ($peer) $this->sendJson($peer, ['type' => 'cancelled']);
            $this->rooms->delete($meta['code']);
        }
    }

    public function onClose(ConnectionInterface $conn): void
    {
        if (!$this->clients->contains($conn)) return;

        $meta = $this->clients[$conn];
        $room = $this->rooms->get($meta['code']);

        if ($room) {
            $peer = $meta['role'] === 'sender' ? $room->receiver : $room->sender;
            if ($peer) {
                try { $this->sendJson($peer, ['type' => 'peer_left']); } catch (\Throwable) {}
            }

            if ($meta['role'] === 'sender')   $room->sender   = null;
            else                              $room->receiver = null;

            // Remove room when both sides gone
            if ($room->sender === null && $room->receiver === null) {
                $this->rooms->delete($meta['code']);
            }
        }

        $this->clients->detach($conn);
        echo "[-] {$meta['role']} left room {$meta['code']}\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e): void
    {
        echo "[!] Error: {$e->getMessage()}\n";
        $conn->close();
    }

    private function sendJson(ConnectionInterface $conn, array $data): void
    {
        $conn->send(json_encode($data));
    }
}
