const https = require('https');

function rq(
  hostname = '',
  auth = '',
  data = {},
  cb = (data = {}) => null,
  cb_err = (error = new Error()) => null,
) {
  const body = Buffer.from(JSON.stringify({ auth, data }), 'utf8').toString('base64');

  https.request({
    hostname,
    method: 'PUT',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': body.length,
    },
  }, (res) => {
    let rs = '';
    
    res.on('data', (c) => rs += c);

    res.on('end', () => {
      console.log('END', rs)
      if (!rs || !res) return cb_err(new Error('No server response'));
      try {
        rs = JSON.parse(Buffer.from(rs, 'base64').toString('utf8'));
      } catch (err) {
        if (rs.startsWith('\n<script')) {
          console.warn('Server overloaded, please wait...');
        } else return cb_err(new Error('Can\'t parse server response'));
      }
      if (!rs.error) {
        cb(rs);
      } else return cb_err(new Error(`Request error: ${rs.message}`));
    });
  })
  .on('error', (err) => {
    cb_err(err);
  })
  .write(body);
}

module.exports = (hostname = '', auth = '') => {
  function sendRequest(sql = '', data = {}, fetchMethod = '', fetchType = 0) {
    return new Promise((res) => {
      rq(hostname, auth, { sql, data, fetchMethod, fetchType }, res);
    });
  }

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
  };
}
