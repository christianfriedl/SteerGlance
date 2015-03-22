var _ = require('underscore');

var BO = function() {
    this._fields = {};
};

BO.prototype.addField = function(field) {
    if ( !field.hasOwnProperty('value') )
        field.value = undefined;
    if ( !field.hasOwnProperty('label') )
        field.label = field.name;
    this._fields[field.name] = field;
};

BO.prototype.getField = function(name) {
    return this._fields[name];
};

BO.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.addField(f); });
};

module.exports = BO;
