"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var dao = require('dao/dao.js');
var bo = require('bo/bo.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');

function testFields() {
    var id1 = field.field('id1', field.Type.int).value(1);
    var name1 = field.field('name1', field.Type.string).value('name');
    var table1 = table.table().field(id1).field(name1);
    var dao1 = dao.dao(null, table1);
    var bo1 = bo.bo(dao1);
    assert.strictEqual(id1, bo1.field('id1'));
    assert.strictEqual(name1, bo1.field('name1'));
}
function testGetters() {
    var id1 = field.field('id1', field.Type.int).value(1);
    var name1 = field.field('name1', field.Type.string).value('one');
    var table1 = table.table().field(id1).field(name1);
    var dao1 = dao.dao(null, table1);
    var bo1 = bo.bo(dao1);
    console.log(bo1.id1(), bo1.name1());
    assert.strictEqual(1, bo1.id1());
    assert.strictEqual('one', bo1.name1());
}

function testSetters() {
    var id1 = field.field('id1');
    assert.strictEqual('id1', id1.accessorName());
    var name1 = field.field('name1');
    assert.strictEqual('name1', name1.accessorName());
    var table1 = table.table().field(id1).field(name1);
    var dao1 = dao.dao(null, table1);
    var bo1 = bo.bo(dao1);
    assert.strictEqual(bo1, bo1.id1(1));
    assert.strictEqual(bo1, bo1.name1('name'));
    assert.strictEqual(1, bo1.id1());
    assert.strictEqual('name', bo1.name1());
}

function testLoadByQuery() {
    var table1 = table.table('table1');
    var id1 = field.field('id1', field.Type.int);
    table1.field(id1);
    var cond = condition.condition()
        .field(id1)
        .op(condition.Op.eq)
        .compareTo(1);
    var select = query.select(id1).from(table1).where(cond);
    var db1 = db.db(':memory:').open(':memory:');
    db1._db.runSql('CREATE TABLE table1 (id1 int)', [], function(err) {
        if ( err ) throw err;
        db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], function(err) {
            if ( err ) throw err;
            var dao1 = dao.dao(db1, table1);
            dao1.loadByQuery(select, function(err) {
                if ( err ) throw err;
                console.log('dao laoded', dao1.id1());
                assert.strictEqual(1, dao1.id1());
            });
        });
    });
}

function runTests() {
    testFields();
    testGetters();
    testSetters();
    testLoadByQuery();
}

exports.runTests = runTests;
