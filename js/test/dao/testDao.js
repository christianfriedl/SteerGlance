/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');
var m_dao_primaryDao = require('dao/primaryDao.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_sql_boField = require('sql/boField.js');
var m_sql_calcField = require('sql/calcField.js');

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
        assert.strictEqual(id1.id(), dao1.field('id1').id());
        assert.strictEqual(name1.id(), dao1.field('name1').id());
    },
    testGetters: function() {
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('one');
        var table1 = table.table().field(id1).field(name1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
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
    testFieldLists: function() {
        var db1 = db.db(':memory:').open(':memory:');

        var f1 = field.field('f1', field.DataType.int);
        var bf1 = m_sql_boField.boField('bf1', null, 'bf1', db1, function(){}, f1);
        var cf1 = m_sql_calcField.calcField('cf1', field.DataType.int, 'cf1', m_sql_calcField.CalcType.sum);

        var table1 = table.table().field(f1).field(bf1).field(cf1);
        var lf1 = m_sql_lookupField.lookupField('lf1', null, 'lf1', f1, f1);
        table1.field(lf1);
        var dao1 = dao.dao(db1).table(table1);

        var flist = dao1.fieldsAsList();
        var lflist = dao1.lookupFieldsAsList();
        var bflist = dao1.boFieldsAsList();
        var cflist = dao1.calcFieldsAsList();

        assert.strictEqual(4, flist.length);
        assert.ok(_(flist).filter(function(f) { return f1.id() === f.id(); }), 'field missing in list');
        assert.ok(_(flist).filter(function(f) { return lf1.id() === f.id(); }), 'lookupfield missing in list');
        assert.ok(_(flist).filter(function(f) { return bf1.id() === f.id(); }), 'bofield missing in list');
        assert.ok(_(flist).filter(function(f) { return cf1.id() === f.id(); }), 'calcfield missing in list');

        assert.strictEqual(1, lflist.length);
        assert.strictEqual(lf1.id(), lflist[0].id());

        assert.strictEqual(1, cflist.length);
        assert.strictEqual(cf1.id(), cflist[0].id());

        assert.strictEqual(1, bflist.length);
        assert.strictEqual(bf1.id(), bflist[0].id());

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
