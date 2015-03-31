var assert = require('assert');
var async = require('async');
var table = require('server/sql/table.js');
var field = require('server/sql/field.js');
var condition = require('server/sql/condition.js');
var query = require('server/sql/query.js');
var sqlDb = require('server/sql/db.js');
var sqliteQuery = require('server/sql/sqlite/query.js');

function testBasicQuery() {
    var table1 = table.table('table1');
    var field1 = field.field('field1', field.Type.int);
    table1.field(field1);
    var select = query.select(field1).from(table1);
    assert.strictEqual(1, select._fields.length);
    assert.strictEqual(1, select._fields.length);
}

function testQueryWithCondition() {
    var cond = condition.condition()
        .field(new field.Field('field1'))
        .op(condition.Op.eq)
        .compareTo('haha');
}

function testAggregateQuery() {
    var table1 = table.table('table1');
    var table2 = table.table('table2');
    var sumField = field.field('sumField', field.Type.int);
    table2.field(sumField);
    var id1 = field.field('id1', field.Type.int);
    table1.field(id1);
    var id2 = field.field('id2', field.Type.int);
    table2.field(id2);
    var s = query.select(sumField)
            .aggregate(query.Aggregate.sum)
            .from(table1, table2)
            .where(condition.condition(id1, condition.Op.eq, id2));
    console.log(s);
    var ss = sqliteQuery.queryString(s);
    console.log(ss);
}



testBasicQuery();
testQueryWithCondition();
testAggregateQuery();
