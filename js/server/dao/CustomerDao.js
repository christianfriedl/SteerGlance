var DAO = require('./DAO.js');
var db = require('../sql/sqlite/db.js');

var CustomerDao = function() {
}

CustomerDao.prototype = new DAO.DAO();

exports.CustomerDao = CustomerDao;
