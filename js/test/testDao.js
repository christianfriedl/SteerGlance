"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var dao = require('dao/dao.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqlDb = require('sql/db.js');
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


function runTests() {
    testFields();
    testGetters();
    testSetters();
}

runTests();

exports.runTests = runTests;
