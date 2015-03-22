var util = require('util');
var BO = require('./BO.js');
var CustomerDao = require('../dao/CustomerDao.js');

var CustomerBo = function() {
    this.addFields([{ name: 'firstName'},
        { name: 'lastName', label: 'last Name from bo' }]);
    this.setDao(new CustomerDao.CustomerDao());
};

CustomerBo.prototype = new BO.BO();

CustomerBo.prototype.getFirstName = function() {
    return this._fields.firstName.value;
};

CustomerBo.prototype.setFirstName = function(firstName) {
    this._fields.firstName.value = firstName;
};

CustomerBo.prototype.getLastName = function() {
    return this._fields.lastName.value;
};

CustomerBo.prototype.setLastName = function(lastName) {
    this._fields.lastName.value = lastName;
};

var loadById = function(id, callback) {
    callback(false, new CustomerBo());
};

exports.loadById = loadById;
