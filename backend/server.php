<?php

require __DIR__ . '/vendor/autoload.php';

use App\RoomManager;
use App\SignalingApp;
use App\Http\CreateRoom;
use App\Http\RoomStatus;
use App\Http\StaticFiles;
use Ratchet\App;

$port  = (int) (getenv('PORT') ?: 8080);
$rooms = new RoomManager();

echo "FileShare PHP server starting on port {$port}...\n";

$app = new App('0.0.0.0', $port, '0.0.0.0');

// ── REST API ────────────────────────────────────────────────
$app->route('/api/room/create',           new CreateRoom($rooms),  ['*']);
$app->route('/api/room/{code}/status',    new RoomStatus($rooms),  ['*']);

// ── WebSocket signaling ──────────────────────────────────────
$app->route('/ws/{code}/{role}',          new SignalingApp($rooms), ['*']);

// ── Serve React SPA (catch-all) ──────────────────────────────
$app->route('/{path}',                   new StaticFiles(), ['*']);
$app->route('/',                         new StaticFiles(), ['*']);

$app->run();
