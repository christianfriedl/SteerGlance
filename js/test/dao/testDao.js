/*
 * Copyright (C) 2015 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
 *
 * Mapitor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

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
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('name');
        var table1 = table.table().field(id1).field(name1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        assert.strictEqual('id1', dao1.field('id1').name());
        assert.strictEqual('name1', dao1.field('name1').name());
    },
    testGetters: function() {
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('one');
        var table1 = table.table().field(id1).field(name1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        console.log(dao1.id1(), dao1.name1());
        assert.strictEqual(1, dao1.id1());
        assert.strictEqual('one', dao1.name1());
    },

    testSetters: function() {
        var id1 = field.field('id1', field.DataType.int);
        assert.strictEqual('id1', id1.accessorName());
        var name1 = field.field('name1', field.DataType.string);
        assert.strictEqual('name1', name1.accessorName());
        var table1 = table.table().field(id1).field(name1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        assert.strictEqual(dao1, dao1.id1(1));
        assert.strictEqual(dao1, dao1.name1('name'));
        assert.strictEqual(1, dao1.id1());
        assert.strictEqual('name', dao1.name1());
    },

    testPrimaryDao: function() {
        var table1 = table.table('table1')
                        .name('table1')
                        .field(field.field('id', field.DataType.int))
                        .field(field.field('name', field.DataType.string));
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE table1 (id int, name text)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO table1 (id, name) VALUES(1, \'full name\')', [], callback); },
            function(callback) {
                var dao1 = m_dao_primaryDao.primaryDao(db1).table(table1);
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
    },

    testSaveExistingRecord: function() {
        var table1 = table.table('updatetable')
                        .name('updatetable')
                        .field(field.field('id', field.DataType.int))
                        .field(field.field('name', field.DataType.string));
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE updatetable (id int, name text)', [], callback); },
            function(callback) { db1._db.runSql('INSERT INTO updatetable (id, name) VALUES(1, \'full name\')', [], callback); },
            function(callback) {
                var dao1 = m_dao_primaryDao.primaryDao(db1).table(table1);
                dao1.loadById(1, function(err) {
                    if ( err ) callback(err);
                    dao1.name('new name');
                    dao1.save(function(err, dao2) {
                        assert.strictEqual('new name', dao1.name());
                        assert.strictEqual('new name', dao2.name());
                    });
                    callback();
                });
            }
            ],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    },

    testSaveNewRecord: function() {
        var table1 = table.table('updatetable')
                        .name('updatetable')
                        .field(field.field('id', field.DataType.int))
                        .field(field.field('name', field.DataType.string));
        var db1 = db.db(':memory:').open(':memory:');
        async.series([
            function(callback) { db1._db.runSql('CREATE TABLE updatetable (id int, name text)', [], callback); },
            function(callback) {
                var dao1 = m_dao_primaryDao.primaryDao(db1).table(table1);
                dao1.name('new name');
                dao1.save(function(err, dao2) {
                    assert.strictEqual('new name', dao1.name());
                    assert.strictEqual('new name', dao2.name());
                });
                callback();
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
