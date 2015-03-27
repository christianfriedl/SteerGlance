var sq = require('../query.js');
var condition = require('../condition.js');
var _ = require('underscore');

function queryString(serverQuery) {
    switch ( serverQuery.type() ) {
        case sq.Type.select:
            return _selectQueryString(serverQuery);
            break;
        default:
            throw 'no such query type';
            break;
    }
}

function _selectQueryString(serverQuery) {
    var sql = 'SELECT ';
    sql += _.reduce(_.map(serverQuery.fields(), function(f) { return f.name(); }), ', ');
    sql += ' FROM ';
    sql += _.reduce(_.map(serverQuery.tables(), function(t) { return t.name(); }), ', ');
    sql += ' ';
    sql += _whereClause(serverQuery);
    console.log(sql);
}

function _whereClause(serverQuery) {
    var sql = 'WHERE ';
    sql += _.reduce(_.map(serverQuery.conditions(), function(c) { return c.field().name() + ' ' + _opString(c.op()) + ' ' + c.compareToValue(); }));
    return sql;
}

function _opString(op) {
    switch ( op ) {
        case condition.Op.eq:
            return '=';
        default:
            throw 'TODO implement _opString!!!';
    }
}

exports.queryString = queryString;
