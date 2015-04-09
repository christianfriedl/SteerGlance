"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var table = require('server/sql/table.js');
var field = require('server/sql/field.js');
var condition = require('server/sql/condition.js');
var aggregate = require('server/sql/aggregate.js');
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
 *
 *
 */

function testBasicQuery() {
    var table1 = table.table('table1');
    var field1 = field.field('field1', field.Type.int);
    table1.field(field1);
    var select = query.select(field1).from(table1);
    assert.strictEqual(1, select._fields.length);
    assert.strictEqual(1, select._fields.length);
    var sqliteQQ = sqliteQuery.query(select);
    assert.strictEqual('SELECT field1 FROM table1', sqliteQQ.queryString());
    assert.strictEqual(0, sqliteQQ.params().length);

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
    console.log(sqliteQQ.queryString(), sqliteQQ.params(), sqliteQQ.params().length);
    assert.strictEqual('SELECT field1 FROM table1 WHERE field1 = ?', sqliteQQ.queryString());
    assert.strictEqual(1, sqliteQQ.params().length);
    assert.strictEqual('haha', sqliteQQ.params()[0]);
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
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
    assert.strictEqual('SELECT id1, name1, id2 FROM table1, table2 WHERE id1 = id2', sqliteQQ.queryString());
    assert.strictEqual(0, sqliteQQ.params().length);
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
    var s = query.select(aggregate.aggregate(aggregate.Type.sum, sumField))
            .from(table1, table2)
            .where(condition.condition(id1, condition.Op.eq, id2));
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss);
    assert.strictEqual('SELECT SUM(sumField) FROM table1, table2 WHERE id1 = id2', sqliteQQ.queryString());
    assert.strictEqual(0, sqliteQQ.params().length);
}

function testInsertQuery() {
    var table1 = table.table('table1');
    var id1 = field.field('id1', field.Type.int).value(1);
    table1.field(id1);
    var name1 = field.field('name1', field.Type.string).value('name');
    table1.field(name1);
    var s = query.insert()
            .into(table1); // all fields
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss, sqliteQQ.params());
    assert.strictEqual('INSERT INTO table1 (id1, name1) VALUES (?, ?)', sqliteQQ.queryString());
    assert.strictEqual(2, sqliteQQ.params().length);
    assert.strictEqual(1, sqliteQQ.params()[0]);
    assert.strictEqual('name', sqliteQQ.params()[1]);
}

function testUpdateQuery() {
    var table1 = table.table('table1');
    var id1 = field.field('id1', field.Type.int).value(1);
    table1.field(id1);
    var name1 = field.field('name1', field.Type.string).value('name');
    table1.field(name1);
    var s = query.update()
            .table(table1)
            .where(condition.condition(id1, condition.Op.eq, 1)); // all fields
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss, sqliteQQ.params());
    assert.strictEqual('UPDATE table1 SET id1 = ?, name1 = ? WHERE id1 = ?', sqliteQQ.queryString());
    assert.strictEqual(3, sqliteQQ.params().length);
    assert.strictEqual(1, sqliteQQ.params()[0]);
    assert.strictEqual('name', sqliteQQ.params()[1]);
    assert.strictEqual(1, sqliteQQ.params()[2]);
}

function testDeleteQuery() {
    var table1 = table.table('table1');
    var id1 = field.field('id1', field.Type.int).value(1);
    table1.field(id1);
    var s = query.delete()
            .table(table1)
            .where(condition.condition(id1, condition.Op.eq, 1)); // all fields
    var sqliteQQ = sqliteQuery.query(s);
    var ss = sqliteQQ.queryString(s);
    console.log(ss, sqliteQQ.params());
    assert.strictEqual('DELETE FROM table1 WHERE id1 = ?', sqliteQQ.queryString());
    assert.strictEqual(1, sqliteQQ.params().length);
    assert.strictEqual(1, sqliteQQ.params()[0]);
}

testBasicQuery();
testQueryWithCondition();
testQueryWithJoin();
testAggregateQuery();
testInsertQuery();
testUpdateQuery();
