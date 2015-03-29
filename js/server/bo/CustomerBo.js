var util = require('util');
var BO = require('./BO.js');
var customerDao = require('../dao/CustomerDao.js');

var CustomerBo = function() {
    this._className = 'customerBo.CustomerBo';
    this.dao(customerDao.customerDao());
};

CustomerBo.prototype = new BO.BO();

////////////////////////////////////////////////////

CustomerBo.prototype.id = function(id) {
    if ( typeof(id) !== 'undefined' ) {
        this._fields['id'].value(id);
        return this;
    }
    return this._fields['id'].value();
};

CustomerBo.prototype.firstName = function(firstName) {
    if ( typeof(firstName) !== 'undefined' ) {
        this._fields['firstName'].value(firstName)
        return this;
    }
    return this._fields['firstName'].value();
};

CustomerBo.prototype.lastName = function(lastName) {
    if ( typeof(lastName) !== 'undefined' ) {
        this._fields['lastName'].value(lastName);
        return this;
    }
    return this._fields['lastName'].value();
};

CustomerBo.prototype.loadById = function(id, callback) {
    this._dao.loadById(id, function(err, row) {
        if (err) callback(err);
        this._fieldValuesFromRow(row);
        callback();
    }.bind(this));
};

function customerBo() { return new CustomerBo(); }

exports.customerBo = customerBo;
exports.CustomerBo = CustomerBo;
