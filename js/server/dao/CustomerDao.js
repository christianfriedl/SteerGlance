var DAO = require('./DAO.js');
var db = require('../sql/sqlite/db.js');
var table = require('../sql/table.js');
var field = require('../sql/field.js');

var CustomerDao = function(db) {
    this._db = db;
    this.table(table.table('customer')
        .field(field.field('id', field.Type.int))
        .field(field.field('firstName', field.Type.string))
        .field(field.field('lastName', field.Type.string))
    );
}

CustomerDao.prototype = new DAO.DAO();

exports.CustomerDao = CustomerDao;
