var _ = require('underscore');
var dao = require('../dao/dao.js');

var BO = function() {
    this._className = 'bo.BO';
    this._dao = new dao.DAO();
    this._fields = {};
};

BO.prototype.dao = function(dao) {
    if ( typeof(dao) !== 'undefined') {
        this._dao = dao;
        this._fieldsFromDao(dao);
        return this;
    }
    return this._dao;
};

BO.prototype.field = function(fieldOrName) {
    if ( typeof(fieldOrName.className) !== 'undefined' && fieldOrName.className() === 'sql.Field' ) {
        this._fields[fieldOrName.name()] = fieldOrName;
        return this;
    }
    return this._fields[fieldOrName];
};

BO.prototype.fieldValue = function(name, value) {
    if ( typeof(value) !== 'undefined' ) {
        this.field(name).value(value);
        return this;
    }
    return this._fields[name].value();
};

BO.prototype.addFields = function(fields) {
    _.each(fields, function(f) { this.field(f); }, this);
};

BO.prototype._fieldValuesFromRow = function(row) {
    _.each(_.keys(row), function(n) { this.fieldValue(n, row[n]); }, this);
};

BO.prototype._fieldsFromDao = function() {
    console.log('_fieldsFromDao', this._dao.table().fields());
    _.map(this._dao.table().fields(), function(f) { this.field(f); }, this);
    console.log('_fieldsFromDao 2', this._fields);
};



exports.BO = BO;
