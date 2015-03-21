var Customer = function() {
    this._firstName = 'firstName';
    this._lastName = 'lastName';
};

Customer.prototype.getFirstName = function() {
    return this._firstName;
};

Customer.prototype.getLastName = function() {
    return this._lastName;
};

exports.Customer = Customer;
