"use strict";

var m_TestSuite = require('TestSuite.js');

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_dao_daoSet = require('dao/daoSet.js');
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
    testLoadOneByQuery: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
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
                var daoSet1 = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                daoSet1.loadOneByQuery(select, function(err, dao2) {
                    assert.strictEqual(false, err);
                    console.log('dao laoded', dao2.id1());
                    assert.strictEqual(1, dao2.id1());
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },

    testLoadAllByQuery: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var select = query.select(id1).from(table1);
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id1 int)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(2)', [], callback); },
            function(callback) {
                var dao1 = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                dao1.loadAllByQuery(select, function(err, daos) {
                    assert.strictEqual(false, err);
                    assert.strictEqual(1, daos[0].id1());
                    assert.strictEqual(2, daos[1].id1());
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },

    testLoadAllByConditions: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id1 int)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id1) VALUES(2)', [], callback); },
            function(callback) {
                var dao1 = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                dao1.loadAllByConditions([], function(err, daos) {
                    assert.strictEqual(false, err);
                    assert.strictEqual(1, daos[0].id1());
                    assert.strictEqual(2, daos[1].id1());
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },

    testCountByConditions: function() {
        var table1 = table.table('counttable')
                        .name('counttable')
                        .field(field.field('id', field.DataType.int));
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE counttable (id int)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO counttable (id) VALUES(1)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO counttable (id) VALUES(1)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO counttable (id) VALUES(1)', [], callback); },
            function(callback) {
                var daoSet = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                daoSet.countByConditions([], function(err, count) {
                    assert.strictEqual(3, count);
                    callback();
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }
};

function runTests() {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests);
}


exports.runTests = runTests;
