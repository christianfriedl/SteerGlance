"use strict";

var m_TestSuite = require('TestSuite.js');

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
var m_dao_primaryDao = require('dao/primaryDao.js');

var tests = {
    _name: 'testDao',
    testFields: function() {
        var id1 = field.field('id1', field.Type.int).value(1);
        var name1 = field.field('name1', field.Type.string).value('name');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(null, table1);
        assert.strictEqual('id1', dao1.field('id1').name());
        assert.strictEqual('name1', dao1.field('name1').name());
    },
    testGetters: function() {
        var id1 = field.field('id1', field.Type.int).value(1);
        var name1 = field.field('name1', field.Type.string).value('one');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(null, table1);
        console.log(dao1.id1(), dao1.name1());
        assert.strictEqual(1, dao1.id1());
        assert.strictEqual('one', dao1.name1());
    },

    testSetters: function() {
        var id1 = field.field('id1');
        assert.strictEqual('id1', id1.accessorName());
        var name1 = field.field('name1');
        assert.strictEqual('name1', name1.accessorName());
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(null, table1);
        assert.strictEqual(dao1, dao1.id1(1));
        assert.strictEqual(dao1, dao1.name1('name'));
        assert.strictEqual(1, dao1.id1());
        assert.strictEqual('name', dao1.name1());
    },

    testLoadByQuery: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.Type.int);
        table1.field(id1);
        var cond = condition.condition()
            .field(id1)
            .op(condition.Op.eq)
            .compareTo(1);
        var select = query.select(id1).from(table1).where(cond);
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id1 int)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], callback); },
            function(callback) {
                var dao1 = dao.dao(db1, table1);
                dao1.loadOneByQuery(select, function(err, dao2) {
                    assert.strictEqual(false, err);
                    console.log('dao laoded', dao1.id1());
                    assert.strictEqual(1, dao1.id1());
                    assert.strictEqual(dao2, dao1);
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },

    testLoadAllByQuery: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.Type.int);
        table1.field(id1);
        var select = query.select(id1).from(table1);
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id1 int)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(2)', [], callback); },
            function(callback) {
                var dao1 = dao.dao(db1, table1);
                dao1.loadAllByQuery(select, function(err, daos) {
                    assert.strictEqual(false, err);
                    assert.strictEqual(1, daos[0].id1());
                    assert.strictEqual(2, daos[1].id1());
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },


    testPrimaryDao: function() {
        var table1 = table.table('table1')
                        .name('table1')
                        .field(field.field('id', field.Type.int))
                        .field(field.field('name', field.Type.string));
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id int, name text)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id, name) VALUES(1, \'full name\')', [], callback); },
            function(callback) {
                var dao1 = m_dao_primaryDao.primaryDao(db1, table1);
                dao1.loadById(1, function(err) {
                    if ( err ) callback(err);
                    console.log('dao laoded', dao1.id(), dao1.name());
                    assert.strictEqual(1, dao1.id());
                    assert.strictEqual('full name', dao1.name());
                    callback();
                });
            }
            ],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }

};

function runTests() {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests);
}


exports.runTests = runTests;
