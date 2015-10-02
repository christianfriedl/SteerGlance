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
var m_dao_dao = require('dao/dao.js');
var m_bo_bo = require('bo/bo.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');

var tests = {
    _name: 'testBoSet',

    testLoadAllByConditions: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var cond = condition.condition()
            .field(id1)
            .op(condition.Op.eq)
            .compareTo(1);
        var db1 = db.db(':memory:').open(':memory:');
        db1._db.runSql('CREATE TABLE table1 (id1 int)', [], function(err) {
            if ( err ) throw err;
            db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], function(err) {
                if ( err ) throw err;
                var daoSet1 = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                var boSet1 = m_bo_boSet.boSet(db1, daoSet1, m_bo_bo.bo);
                boSet1.loadAllByConditions([], function(err, bos) {
                    assert.strictEqual(false, err);
                    assert.strictEqual(1, bos.length);
                    assert.strictEqual(1, bos[0].id1());
                });
            });
        });
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
