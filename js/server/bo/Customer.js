var util = require('util');
var BO = require('./BO.js');

var Customer = function(id) {
    this._id = id;
    this.addFields([{ name: 'firstName'},
        { name: 'lastName', label: 'last Name from bo' }]);
};

Customer.prototype = new BO();

Customer.prototype.getId = function() {
    return this._id;
};

Customer.prototype.getFirstName = function() {
    return this._fields.firstName;
};

Customer.prototype.getLastName = function() {
    return this._fields.lastName;
};

module.exports = Customer;
