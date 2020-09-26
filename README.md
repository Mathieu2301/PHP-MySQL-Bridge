# PHP-MySQL-SocketIO-Bridge
PHP MySQL SocketIO Bridge

You can use this library to connect to your local PHP-MySQL database from a NodeJS process.

## Installation

```
npm install https://github.com/Mathieu2301/PHP-MySQL-SocketIO-Bridge.git
```

## PHP Installation
  Serve the ``/bridge`` folder on your PHP server.
 
  Create a ``/mysql.php`` file
  ```php
  <?
    if (!password_verify('PASS_HASH', $_SERVER['QUERY_STRING'])) exit();
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=database;charset=utf8mb4', 'root', 'pass', [
      PDO::ATTR_EMULATE_PREPARES   => false,
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4'
    ]);
    $ip = 'http://my-node-js-host.com/path/to/index.php';
  ?>
  ```

## NodeJS Initialization

 Start by importing the library

```javascript
const PSMB = require('psmb');
```

### Connect to the bridge (your PHP server)
```javascript
const mysql = PSMB('my-php-host.com', 'PASS');
```

### Send MySQL request
```javascript
(async () => {
  // Fetch example
  await mysql.query('SELECT * FROM my_table').exec();

  // Fetch example (Returns only the first element)
  const fetchRq = await mysql.query('SELECT * FROM my_table').fetch();
  console.log(fetchRq.data);

  // FetchAll example (Returns a list of all elements)
  const fetchAllRq = await mysql.query('SELECT * FROM my_table').fetchAll();
  console.log(fetchAllRq.data);
})();
```

## Tips

You can use fetchmodes
```javascript
// Availables are :
mysql.FETCH.ASSOC;
mysql.FETCH.COLUMN;
mysql.FETCH.UNIQUE;

// FETCH_UNIQUE example :
const ex1 = await mysql.query('SELECT ID, name, email FROM users').fetchAll(mysql.FETCH.UNIQUE);
console.log(ex1.data); // Template: { '{ID}': { name: '...', email: '...' }, '{ID_2}': { name: '...', email: '...' }, ... }

// Combination example :
const ex2 = await mysql.query('SELECT ID, name FROM my_table').fetchAll(mysql.FETCH.COLUMN | mysql.FETCH.UNIQUE);
console.log(ex2.data); // Template: { '{ID}': '{name}', '{ID_2}': '{name_2}', ... }
```

You can use promise ``.then()``
```javascript
mysql.query('SELECT * FROM my_table').fetch().then((rs) => {
  console.log(rs.data);
});
```

Latency measure
```javascript
const startTime = Date.now();
const data = await sql.query('SELECT * FROM my_table').fetchAll();

console.log(Date.now() - startTime, 'ms', data);
```

___
## Problems

 If you have errors in console or unwanted behavior please create an issue [here](https://github.com/Mathieu2301/PHP-MySQL-SocketIO-Bridge/issues).
