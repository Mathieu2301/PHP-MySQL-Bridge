<?php
require('./mysql.php');

use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version2X;

require __DIR__ . '/vendor/autoload.php';

// exit(json_encode($_SERVER));

$client = new Client(new Version2X($ip));

try {
    $client->initialize();
} catch (\Throwable $th) {
    exit($th->getMessage());
}

function sendRequest($type, $sql, $data, $fetchMode = false, $uid = '') {
    global $pdo;

    if (!$sql) return;

    $rq = $pdo->prepare($sql);
    
    if ($data) $rq->execute($data);
    else $rq->execute();
    
    if ($type === 'none' || !$fetchMode) return sendCB($uid, [ 'type' => $type, 'success' => true, 'rs' => false ]);
    
    if ($fetchMode && $type === 'fetch') $rs = $rq->fetch($fetchMode);
    if ($fetchMode && $type === 'fetchAll') $rs = $rq->fetchAll($fetchMode);
    
    if ($rs) sendCB($uid, [ 'type' => $type, 'success' => true, 'data' => $rs ]);
    else sendCB($uid, [ 'type' => $type, 'success' => true, 'data' => false ]);
}

function sendCB($uid, $data) {
    global $client;
    $client->emit("CB_$uid", $data);
}

function onReq($data) {
    $data = json_decode(preg_replace('/([0-9].)\[/', '[', $data), true);

    if ($data[0] === 'FORCE_DISCONNECT') {
        $client->close();
        exit('EXITED');
        return;
    }

    if ($data[0] === 'fetch')    return sendRequest('fetch', $data[1], $data[2], $data[3], $data[4]);
    if ($data[0] === 'fetchAll') return sendRequest('fetchAll', $data[1], $data[2], $data[3], $data[4]);
    if ($data[0] === 'push')     return sendRequest('none', $data[1], $data[2], $data[3], $data[4]);
}

while (true) {
    $r = $client->read();
    if (!empty($r)) onReq($r);
}
