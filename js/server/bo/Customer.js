var Customer = function(id) {
    this._id = id;
    this._data = { firstName: { name: 'firstName', label: 'First Name from bo', value: 'firstName from bo ' + id },
                    lastName: { name: 'lastName', label: 'last Name from bo', value: 'lastName from bo ' + id },
                };
};

Customer.prototype.getId = function() {
    return this._id;
};

Customer.prototype.getFirstName = function() {
    return this._data.firstName;
};

Customer.prototype.getLastName = function() {
    return this._data.lastName;
};

module.exports = Customer;
