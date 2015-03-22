var _ = require('underscore');

var BO = function() {
    this._fields = {};
    this.addField({ name: 'id', value: undefined, label: 'ID' });
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

BO.prototype.setId = function(id) {
    this._fields['id'].value = id;
};

BO.prototype.getId = function() {
    return this._fields['id'].value;
}

module.exports = BO;
