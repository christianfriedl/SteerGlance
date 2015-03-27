/**
 * factory for tthe db drivers
 */

var sqlite = require('./sqlite/db.js');

// url is currently actually just a filename... TODO
function DB(url) { 
    this._db = sqlite.db(url);
}

DB.prototype.open = function(url) {
    return this._db.open(url);
};

DB.prototype.runSql = function(query, params, callback) {
    return this._db.runSql(query, params, callback);
};
DB.prototype.run = function(query, callback) {
    return this._db.run(query, callback);
}
DB.prototype.fetchRow = function(query, callback) {
    return this._db.fetchRow(query, callback);
};

DB.prototype.close = function() {
    return this._db.close();
};

function db(url) { return new DB(url); }

exports.db = db;
