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

var _ = require('underscore');
var assert = require('assert');
var async = require('async');

var m_TestSuite = require('TestSuite.js');
var m_sql_table = require(    'sql/table.js');
var m_sql_field = require(    'sql/field.js');
var m_sql_fieldLink = require('sql/fieldLink.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_sql_db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var m_dao_primaryDao = require('dao/primaryDao.js');
var m_bo_primaryBo = require('bo/primaryBo.js');

var tests = {
    _name: 'testLookups',
    testLookupFieldInDao: function() {
        var mainTable = m_sql_table.table('main');
        mainTable.field(m_sql_field.field('id', m_sql_field.DataType.int, 1, 'id'));
        mainTable.field(m_sql_field.field('name', m_sql_field.DataType.string, 1, 'id'));
        var childTable = m_sql_table.table('child');
        var lf = m_sql_lookupField.lookupField('mainId', m_sql_field.DataType.int, 1, 'mainId', mainTable.field('name'));
        childTable.field(lf);
        var link = m_sql_fieldLink.fieldLink(childTable.field('mainId'), mainTable.field('id'), m_sql_fieldLink.Type.manyToOne);
        childTable.field('mainId').link(link);
        var q = childTable.field('mainId').query();
        assert.ok(q);
        // TODO check structure of q

        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var dao1 = m_dao_primaryDao.primaryDao(db1).table(childTable);
        async.series([
            function(callback) { db1.runSql('CREATE TABLE main (id int, name text)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE child (id int, mainId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO main (id, name) VALUES(1, \'eins\')', [], callback); },
            function(callback) { db1.runSql('INSERT INTO child (mainId, id) VALUES(1, 1)', [], callback); },
            function(callback) {
                dao1.loadById(1, function(err, dao2) {
                    if (err) throw new Error(err);
                    callback();
                });
            }
        ]);

    },
    testLookupFieldInBo: function() {
        var mainTable = m_sql_table.table('main');
        mainTable.field(m_sql_field.field('id', m_sql_field.DataType.int, 1, 'id'));
        mainTable.field(m_sql_field.field('name', m_sql_field.DataType.string, 1, 'id'));
        var childTable = m_sql_table.table('child');
        var lf = m_sql_lookupField.lookupField('mainId', m_sql_field.DataType.int, 1, 'mainId', mainTable.field('name'));
        childTable.field(lf);
        var link = m_sql_fieldLink.fieldLink(childTable.field('mainId'), mainTable.field('id'), m_sql_fieldLink.Type.manyToOne);
        childTable.field('mainId').link(link);

        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var dao1 = m_dao_primaryDao.primaryDao(db1).table(childTable);
        var bo1 = m_bo_primaryBo.primaryBo(db1).dao(dao1);
        async.series([
            function(callback) { db1.runSql('CREATE TABLE main (id int, name text)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE child (id int, mainId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO main (id, name) VALUES(1, \'eins\')', [], callback); },
            function(callback) { db1.runSql('INSERT INTO child (mainId, id) VALUES(1, 1)', [], callback); },
            function(callback) {
                bo1.loadById(1, function(err, bo2) {
                    assert.strictEqual(1, _(bo2.field('mainId').options()).keys().length);
                    if (err) throw new Error(err);
                    callback();
                });
            }
        ]);

    },
    testLookupFieldInLoadAll: function() {
        var mainTable = m_sql_table.table('main');
        mainTable.field(m_sql_field.field('id', m_sql_field.DataType.int, 1, 'id'));
        mainTable.field(m_sql_field.field('name', m_sql_field.DataType.string, 1, 'id'));
        var childTable = m_sql_table.table('child');
        var lf = m_sql_lookupField.lookupField('mainId', m_sql_field.DataType.int, 1, 'mainId', mainTable.field('name'));
        childTable.field(lf);
        var link = m_sql_fieldLink.fieldLink(childTable.field('mainId'), mainTable.field('id'), m_sql_fieldLink.Type.manyToOne);
        childTable.field('mainId').link(link);

        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var dao1 = m_dao_primaryDao.primaryDao(db1).table(childTable);
        var bo1 = m_bo_primaryBo.primaryBo(db1).dao(dao1);
        var daoSet = m_dao_daoSet.daoSet(db1, m_dao_primaryDao.primaryDao).table(childTable);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_bo_primaryBo.primaryBo);
        async.series([
            function(callback) { db1.runSql('CREATE TABLE main (id int, name text)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE child (id int, mainId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO main (id, name) VALUES(1, \'eins\')', [], callback); },
            function(callback) { db1.runSql('INSERT INTO child (mainId, id) VALUES(1, 1)', [], callback); },
            function(callback) {
                boSet.loadAllByConditions([], function(err, bos) {
                    if (err) throw new Error(err);
                    assert.strictEqual(1, _(bos[0].field('mainId').options()).keys().length);
                    callback();
                });
            }
        ]);

    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}


exports.runTests = runTests;

