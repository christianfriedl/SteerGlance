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

var assert = require('assert');
var m_sql_calcField = require('sql/calcField.js');
var m_sql_field = require('sql/Field.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'testCalcField',

    testInstanceof: function() {
        var f= m_sql_calcField.calcField('test', m_sql_field.DataType.int, 'test', m_sql_calcField.CalcType.sum);
        assert.ok('instanceof calcfield', f instanceof m_sql_calcField.CalcField);
        assert.ok('instanceof field', f instanceof m_sql_field.Field);
        assert.ok('not instanceof lookupfield', !(f instanceof m_sql_lookupField.LookupField));
    },
    testConstructorName: function() {
        var f= m_sql_calcField.calcField('test', m_sql_field.DataType.int, 'test', m_sql_calcField.CalcType.sum);
        assert.strictEqual('CalcField', f.constructor.name);
    },
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
