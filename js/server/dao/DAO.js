var table = require('../sql/table.js');
var query = require('../sql/query.js');
var field = require('../sql/field.js');
var condition = require('../sql/condition.js');
var sqliteQuery = require('../sql/sqlite/query.js');
var _ = require('underscore');

var DAO = function(table) {
    this._className = 'dao.DAO';
    this._fields = {};
    this._table = null;
    if ( typeof(table) !== 'undefined' ) {
        this._table = table;
        this._fieldsFromTable(table);
        console.log('f af ', this._fields);
    }
};

DAO.prototype.table = function(table) {
    if ( typeof(table) !== 'undefined' ) {
        this._table = table;
        this._fieldsFromTable(table);
        return this;
    }
    return this._table;
};

DAO.prototype.field = function(fieldOrName) {
    if ( typeof(fieldOrName.className) !== 'undefined' && fieldOrName.className() === 'sql.Field' ) {
        fieldOrName.table(this.table());
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
    var sql = sqliteQuery.queryString(query);
};

DAO.prototype._createIdSelect = function() {
    return query.select().fields(this._fields).tables([ this._table ]).where(condition.condition(this._fields['id'], condition.Op.eq, this._fields['id'].value()));
};

DAO.prototype._fieldsFromTable = function(table) {
    _.map(table.fields(), function(f) { this.field(f); }, this);
};


exports.DAO = DAO;
