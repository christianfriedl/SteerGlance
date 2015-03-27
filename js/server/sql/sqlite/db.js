var sqlite3 = require('sqlite3').verbose();
var query = require('./query.js');

function DB() {
    this._db = null;
}

DB.prototype.open = function(fileName) {
    this._db = new sqlite3.Database(fileName);
    return this;
};

DB.prototype.close = function() {
    this._db.close();
    return this;
};

DB.prototype.runSql = function(sqlString, params, callback) {
    this._db.run(sqlString, params, function(err) {
        callback(err);
    });
    return this;
};

/**
 * string query, array params -> callback(err, row)
 */
DB.prototype.fetchRow = function(sqlQuery, params, callback) {
    var s = query.queryString(sqlQuery);
    this._db.get(s, params, function(err, row) {
        callback(err, row);
    });
    return this;
};

function db(fileName) {
    return new DB(fileName);
}

exports.db = db;
