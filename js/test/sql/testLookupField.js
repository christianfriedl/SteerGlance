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
var m_sql_table = require('sql/table.js');
var m_sql_field = require('sql/field.js');
var m_sql_calcField = require('sql/calcField.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'tesLookupField',

    testCreate: function() {
        var f_customer_id = m_sql_field.field('id', m_sql_field.DataType.int, 1);
        assert.ok('instanceof field', f_customer_id instanceof m_sql_field.Field);
        var f_customer_name = m_sql_field.field('name', m_sql_field.DataType.string, 'name');
        var t = m_sql_table.table('t').field(f_customer_id).field(f_customer_name);
        var f_invoice_customerId = m_sql_lookupField.lookupField('customerId', 1, 'customerId', f_customer_id, f_customer_name);
        assert.ok('instanceof calcfield', f_invoice_customerId instanceof m_sql_calcField.CalcField);
        assert.ok('instanceof field', f_invoice_customerId instanceof m_sql_field.Field);
        assert.ok('instanceof lookupfield', (f_invoice_customerId instanceof m_sql_lookupField.LookupField));
        assert.strictEqual(f_customer_id, f_invoice_customerId.targetField());
        assert.strictEqual(f_customer_name, f_invoice_customerId.targetLabelField());
    },
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
