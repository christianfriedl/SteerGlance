var query = require('../sql/query.js');
var field = require('../sql/field.js');
var condition = require('../sql/condition.js');
var _ = require('underscore');

var DAO = function() {
    this._className = 'dao.DAO';
    this._fields = {};
    this.field(new field.Field('id', field.Type.int));
};

DAO.prototype.dao = function(dao) {
    if ( typeof(dao) !== 'undefined' ) {
        this._dao = dao;
        return this;
    }
    return this._dao;
};

DAO.prototype.field = function(fieldOrName) {
    if ( typeof(fieldOrName.className) !== 'undefined' && fieldOrName.className() === 'sql.Field' ) {
        this._fields[fieldOrName.name()] = fieldOrName;
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
        this.field('id').value(id);
        return this;
    }
    return this.field('id').value();
};

DAO.prototype.loadById = function(id) {
    this.id(id);
    var query = this._createIdSelect();
    console.log(query);
};

DAO.prototype._createIdSelect = function() {
    return query.select().fields(this._fields).from(this._tablesFromFields()).where(condition.condition(this._fields['id'], condition.Op.eq, this._fields['id'].value()));
};

DAO.prototype._tablesFromFields = function() {
    return _.map(this._fields, function(f) { return f.table(); });
};


exports.DAO = DAO;
