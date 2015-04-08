var assert = require('assert');
var async = require('async');
var table = require('server/sql/table.js');
var field = require('server/sql/field.js');
var condition = require('server/sql/condition.js');
var query = require('server/sql/query.js');
var sqlDb = require('server/sql/db.js');
var sqliteQuery = require('server/sql/sqlite/query.js');


/*
 * test cases:
 *
 * SELECT t1.f1, t1.f2 FROM table1 AS t1
 * SELECT t1.f1, t1.f2 FROM table1 AS t1 WHERE tf1.cf1 = 'a'
 * SELECT t1.f1, t2.f2 FROM table1 AS t1, table2 AS t2
 * SELECT t1.f1, t2.f2 FROM table1 AS t1, table2 AS t2 WHERE t1.cf1 = t2.cf2
 * SELECT t1.f1, t2.f2 FROM table1 AS t1 LEFT JOIN t2 ON (t1.cf1 = t2.cf2)
 * SELECT SUM(t1.f1) FROM table1 AS t1
 * SELECT SUM(t1.f1) FROM table1 AS t1 WHERE t1.cf1 = 'a'
 * SELECT SUM(t2.f2) FROM table1 AS t1, table2 AS t2 WHERE t1.cf1 = 'a' AND t1.cf2 = t2.cf3
 * SELECT COUNT(t1.f1) FROM table1 AS t1 WHERE t1.cf1 = 'a'
 * SELECT COUNT(*) FROM table1 AS t1 WHERE t1.cf1 = 'a'
 *
 */

function testBasicQuery() {
    var table1 = table.table('table1');
    var field1 = field.field('field1', field.Type.int);
    table1.field(field1);
    var select = query.select(field1).from(table1);
    assert.strictEqual(1, select._fields.length);
    assert.strictEqual(1, select._fields.length);
}

function testQueryWithCondition() {
    var table1 = table.table('table1');
    var field1 = field.field('field1', field.Type.int);
    table1.field(field1);
    var cond = condition.condition()
        .field(new field.Field('field1'))
        .op(condition.Op.eq)
        .compareTo('haha');
    var select = query.select(field1).from(table1).where(cond);
    var sqliteQQ = sqliteQuery.query(select);
    console.log(sqliteQQ.queryString(), sqliteQQ.params());
}

function testQueryWithJoin() {
    var table1 = table.table('table1');
    var table2 = table.table('table2');
    var id1 = field.field('id1', field.Type.int);
    table1.field(id1);
    var name1 = field.field('name1', field.Type.string);
    table1.field(name1);
    var id2 = field.field('id2', field.Type.int);
    table2.field(id2);
    var s = query.select(id1, name1, id2)
            .from(table1, table2)
            .where(condition.condition(id1, condition.Op.eq, id2));
    console.log(s);
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
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
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
}

function testInsertQuery() {
    throw 'not implemented';
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
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
}

function testUpdateQuery() {
    throw 'not implemented';
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
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
}




testBasicQuery();
testQueryWithCondition();
testQueryWithJoin();
testAggregateQuery();
testInsertQuery();
testUpdateQuery();
