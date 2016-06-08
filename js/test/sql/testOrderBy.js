/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of SteerGlance.
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
var async = require('async');
var assert = require('assert');
var m_sql_orderBy = require('sql/orderBy.js');
var m_sql_table = require('sql/table.js');
var m_sql_field = require('sql/field.js');
var util = require('util');

var tests = {
    _name: 'testOrderBy',
    testOBDirection: function() {
        var dir = m_sql_orderBy.directionByName('asc');
        assert.strictEqual(m_sql_orderBy.Direction.asc, dir);
        dir = m_sql_orderBy.directionByName('desc');
        assert.strictEqual(m_sql_orderBy.Direction.desc, dir);
    },
    testOBfromWeb: function() {
        var table1 = new m_sql_table.Table('table1');
        var field1 = new m_sql_field.Field('field1', m_sql_field.DataType.int);
        table1.field(field1);
        var field2 = new m_sql_field.Field('field2', m_sql_field.DataType.int);
        table1.field(field2);

        var ob = m_sql_orderBy.orderByFromWeb(table1, [ { field: 'field1', direction: 'asc' }, { field: 'field2' } ]);
        assert.strictEqual(ob.fields()[0].field(), field1);
        assert.strictEqual(ob.fields()[1].field(), field2);
        assert.strictEqual(ob.fields()[0].direction(), m_sql_orderBy.Direction.asc);
        assert.strictEqual(ob.fields()[1].direction(), m_sql_orderBy.Direction.asc);
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
