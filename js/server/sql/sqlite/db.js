var sqlite3 = require('sqlite3').verbose();

var db = null;

var open = function(/* etc., ignored for now */) {
    db = new sqlite3.Database(':memory:');
    db.serialize(function() {
        db.run("CREATE TABLE customer (id INT, firstName text, lastName text)");
        var stmt = db.prepare("INSERT INTO customer VALUES (?, ?, ?)");
        stmt.run(2, 'real first', 'real last');
        stmt.finalize();
    });
};

/**
 * string query, array params -> callback(err, row)
 */
var fetchRow = function(query, params, callback) {
    db.get(query, params, function(err, row) {
        callback(err, row);
    });
};

var close = function() {
    db.close();
};

exports.open = open;
exports.close = close;
