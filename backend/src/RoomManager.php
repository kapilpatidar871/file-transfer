<?php

namespace App;

use Ratchet\ConnectionInterface;

class Room
{
    public ?ConnectionInterface $sender   = null;
    public ?ConnectionInterface $receiver = null;
    public int $createdAt;

    public function __construct(public readonly string $code)
    {
        $this->createdAt = time();
    }

    public function isExpired(): bool
    {
        return time() - $this->createdAt > 600; // 10 min TTL
    }

    public function isFull(): bool
    {
        return $this->sender !== null && $this->receiver !== null;
    }
}

class RoomManager
{
    /** @var array<string, Room> */
    private array $rooms = [];

    public function create(): Room
    {
        $this->cleanup();
        do {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (isset($this->rooms[$code]));

        $room = new Room($code);
        $this->rooms[$code] = $room;
        return $room;
    }

    public function get(string $code): ?Room
    {
        $room = $this->rooms[$code] ?? null;
        if ($room && $room->isExpired()) {
            $this->delete($code);
            return null;
        }
        return $room;
    }

    public function delete(string $code): void
    {
        unset($this->rooms[$code]);
    }

    private function cleanup(): void
    {
        foreach ($this->rooms as $code => $room) {
            if ($room->isExpired()) unset($this->rooms[$code]);
        }
    }
}
