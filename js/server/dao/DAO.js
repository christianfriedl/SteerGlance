var table = require('../sql/table.js');
var query = require('../sql/query.js');
var field = require('../sql/field.js');
var condition = require('../sql/condition.js');
var sqliteQuery = require('../sql/sqlite/query.js');
var _ = require('underscore');

var DAO = function(db, table) {
    this._className = 'dao.DAO';
    this._db = db;
    this._fields = {};
    this._table = null;
    this.table(table);
};

DAO.prototype.db = function(db) {
    this._db = db;
    return this;
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
        console.log('dao is adding field ', fieldOrName.name(), fieldOrName.value());
        fieldOrName.table(this.table());
        this._fields[fieldOrName.name()] = fieldOrName;
        console.log('dao has added field ', fieldOrName.name(), fieldOrName.value());
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

DAO.prototype.loadById = function(id, callback) {
    console.log('dao id 1', this.field('id'), _.keys(this.field('id')).join(','), '----' , this.field('id').value, this.field('id')._name);
    this.field('id').value(id);
    console.log('dao id 2', this.field('id'), _.keys(this.field('id')).join(','), '----' , this.field('id').value, this.field('id')._name);
    var query = this._createIdSelect();
    this._db.fetchRow(query, [], function(err, row) { 
        if ( err ) {
            return callback(err);
        }
        callback(false, row);
    });
};

DAO.prototype._fieldsAsList = function() {
    return _.values(this._fields);
};

DAO.prototype._createIdSelect = function() {
    return query.select()
        .fields(this._fieldsAsList())
        .from(this._table)
        .where(
            condition.condition(this._fields['id'], condition.Op.eq, this._fields['id'].value()));
};

DAO.prototype._fieldsFromTable = function(table) {
    console.log('f d d', _.values(table.fields()));
    var self = this;
    // _.map(_.values(table.fields()), function(f) { console.log('f d d is adding field', f.name(), f.value(), f.name, f.value); self.field(f); }, this);
    var key;
    var f = table.fields();
    console.log('START FOREACH');
    for (key in f) {
        var ff = f[key];
        console.log(ff.name(), ff.value(), ff.name, ff.value);
        this.field(ff);
    }
    console.log('END FOREACH');
    console.log('f d d affter adding', this.field('id').value);
};


exports.DAO = DAO;
