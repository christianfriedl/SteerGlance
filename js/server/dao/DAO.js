var query = require('../sql/query.js');
var DAO = function() {
    this._className = 'dao.DAO';
    this._fields = {};
    this.addField({ name: 'id', value: undefined });
};

DAO.prototype.dao = function(dao) {
    if ( typeof(dao) !== 'undefined' ) {
        this._dao = dao;
        return this;
    }
    return this._dao;
};

DAO.prototype.field = function(fieldOrName) {
    if ( typeof(fieldOrName) !== 'undefined' ) {
        this._fields[field.name] = fieldOrName;
        return this;
    }
    return this._fields[fieldOrName];
};

DAO.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.field(f); });
};

DAO.prototype.fieldValue = function(name, value) {
    if ( typeof(value) !== 'undefined' ) {
        this.field(name).value(value);
        return this;
    }
    return this._fields[name].value();
};

DAO.prototype.id = function(id) {
    if ( typeof(id) !== 'undefined' ) {
        this._fields['id'].value = id;
        return this;
    }
    return this.field('id').value();
};

DAO.prototype._createIdSelect = function() {
    return query.select().fields(this._fields).from(this._tablesFromFields()).where(condition.condition(
};


exports.DAO = DAO;
