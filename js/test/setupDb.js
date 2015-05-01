var sqlite3 = require('sqlite3').verbose();

var db = new sqlite3.Database('test.db');
db.serialize(function() {
    db.run('DROP TABLE IF EXISTS customer', [], function(err, res) { console.log(err, 'done', res); });
    db.run('CREATE TABLE customer (id int, firstName text, lastName text)', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO customer VALUES(1, \'Karenbruck\', \'Hardnebrautz\')', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO customer VALUES(2, \'Christian\', \'Friedl\')', [], function(err, res) { console.log(err, 'done', res); });

    db.run('DROP TABLE IF EXISTS invoice', [], function(err, res) { console.log(err, 'done', res); });
    db.run('CREATE TABLE invoice (id int, customerId int, amount decimal)', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO invoice VALUES(1, 1, 10.0)', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO invoice VALUES(2, 1, 20.0)', [], function(err, res) { console.log(err, 'done', res); });
});

