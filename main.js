const https = require('https'), http = require('http');

module.exports = (hostname = '', auth = '', localPort = 400, certs = { key: null, cert: null }) => {
  const server = (certs.key && certs.cert ? https.createServer(certs) : http.createServer());
  const io = require('socket.io')(server);
  
  let connected = false;
  let sendRequest = () => new Promise((_, err) => err({ error: true, message: 'Not connected to the server...' }));

  io.on('connection', (socket) => {
    if (connected) {
      console.log('Duplicated');
      socket.emit('FORCE_DISCONNECT');
      socket.disconnect();
      return;
    } else console.log('Connected !');

    connected = true;

    socket.on('disconnect', () => {
      connected = false;
      console.info(`SocketIO > Disconnected socket ${socket.id}`);
      revive();
    });

    sendRequest = (sql, data, queryType, fetchType) => {
      return new Promise((res) => {
        const uid = (Math.random() * 10 ** 20).toString(36);
        socket.emit(queryType, sql, data, fetchType, uid);
        socket.once(`CB_${uid}`, res);
      });
    }
  });
  
  function revive() {
    if (!connected) https.get(`https://${hostname}/?${auth}`, (res) => {
      let data = '';
      res.on('data', (d) => data = data + d.toString());
      res.on('end', () => {
        console.log(data);
      });
    });
  }
  setInterval(revive, 10000);
  revive();

  server.listen(localPort);
  console.info(`SocketIO > listening on port ${localPort}`);

  return {
    FETCH: {
      ASSOC: 2,
      COLUMN: 7,
      UNIQUE: 196608,
    },
    query(sql = '', data = {}) {
      return {
        fetch: (fetchType = 2) => sendRequest(sql, data, 'fetch', fetchType),
        fetchAll: (fetchType = 2) => sendRequest(sql, data, 'fetchAll', fetchType),
        exec: () => sendRequest(sql, data, 'push', 0),
      }
    },
  }
};
