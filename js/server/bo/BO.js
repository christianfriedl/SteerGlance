var _ = require('underscore');

var BO = function() {
    this._dao = null;
    this._fields = {};
    this.addField({ name: 'id', value: undefined, label: 'ID' });
};

BO.prototype.setDao = function(dao) {
    this._dao = dao;
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

BO.prototype.getValue = function(name) {
    return this._fields[name].value;
};

BO.prototype.setValue = function(name, value) {
    this._fields[name].value = value;
};

BO.prototype.addFields = function(fields) {
    _.each(fields, function(f) { this.addField(f); }, this);
};

BO.prototype.setId = function(id) {
    this._fields['id'].value = id;
};

BO.prototype.getId = function() {
    return this._fields['id'].value;
}

exports.BO = BO;
