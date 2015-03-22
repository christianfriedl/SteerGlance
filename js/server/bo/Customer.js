var util = require('util');
var BO = require('./BO.js');

var Customer = function() {
    this.addFields([{ name: 'firstName'},
        { name: 'lastName', label: 'last Name from bo' }]);
};

Customer.prototype = new BO();

Customer.prototype.getFirstName = function() {
    return this._fields.firstName.value;
};

Customer.prototype.getLastName = function() {
    return this._fields.lastName.value;
};

module.exports = Customer;
