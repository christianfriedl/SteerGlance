"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var dao = require('dao/dao.js');
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
    assert.strictEqual(id1, dao1.field('id1'));
    assert.strictEqual(name1, dao1.field('name1'));
}
function testGetters() {
    var id1 = field.field('id1', field.Type.int).value(1);
    var name1 = field.field('name1', field.Type.string).value('one');
    var table1 = table.table().field(id1).field(name1);
    var dao1 = dao.dao(null, table1);
    console.log(dao1.getId1(), dao1.getName1());
    assert.strictEqual(1, dao1.getId1());
    assert.strictEqual('one', dao1.getName1());
}

function testSetters() {
    var id1 = field.field('id1');
    assert.strictEqual('setId1', id1.setterName());
    var name1 = field.field('name1');
    assert.strictEqual('setName1', name1.setterName());
    var table1 = table.table().field(id1).field(name1);
    var dao1 = dao.dao(null, table1);
    assert.strictEqual(dao1, dao1.setId1(1));
    assert.strictEqual(dao1, dao1.setName1('name'));
    assert.strictEqual(1, dao1.getId1());
    assert.strictEqual('name', dao1.getName1());
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
                console.log('dao laoded', dao1.getId1());
                assert.strictEqual(1, dao1.getId1());
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
