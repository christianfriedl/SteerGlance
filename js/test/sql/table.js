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
var assert = require(   'assert');
var table = require(    'sql/table.js');
var field = require(    'sql/field.js');
var fieldLink = require('sql/fieldLink.js');
var m_sql_calcField = require('sql/calcField.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_sql_table = require('sql/table.js');
var m_sql_field = require('sql/field.js');

var tests = {
    _name: 'testTable',
    testGuid: function() {
        var util = require('util.js');
        var guid1 = util.guid();
        var guid2 = util.guid();
        assert.notEqual(guid1, guid2);
    },
    testTable1: function() {
        var table1 = new table.Table('table1');
        assert.strictEqual('table1', table1.name());
        var field1 = new field.Field('field1', field.DataType.int);
        assert.strictEqual('field1', field1.name());
        assert.strictEqual(field.DataType.int, field1.dataType());
        table1.field(field1);
        assert.strictEqual(field1, table1.field('field1'));
        assert.strictEqual(table1, field1.table());
    },

    testTable2: function() {
        var table1 = new table.Table('table1');
        var field1 = new field.Field('field1', field.DataType.int);
        table1.field(field1);
        var table2 = new table.Table('table2');
        var field2 = new field.Field('field2', field.DataType.int);
        table2.field(field2);

        var fieldLink1 = new fieldLink.FieldLink(field1, field2, fieldLink.Type.oneToMany);
        assert.strictEqual(fieldLink.Type.oneToMany, fieldLink1.type());
    },

    testTable3: function() {
        var table1 = new table.Table('table1');
        var field1 = new field.Field('field1', field.DataType.int);
        var field2 = new field.Field('field2', field.DataType.int);
        table1.field(field1);
        assert.strictEqual(0, table1.field('field1').seq());
        table1.field(field2);
        assert.strictEqual(1, table1.field('field2').seq());
        assert.strictEqual(2, table1.fieldsAsList().length);
    },

    testFieldWebizable: function() {
        var field1 = new field.Field('field1', field.DataType.int);
        var field4 = m_sql_calcField.calcField('id1', field.DataType.int, m_sql_calcField.CalcType.sum, { label: 'Label' });

        var mainTable = m_sql_table.table('main');
        mainTable.field(m_sql_field.field('id', m_sql_field.DataType.int, 1, 'id'));
        mainTable.field(m_sql_field.field('name', m_sql_field.DataType.string, 1, 'id'));
        var childTable = m_sql_table.table('child');
        var field5 = m_sql_lookupField.lookupField('mainId', m_sql_field.DataType.int, 1, 'mainId', mainTable.field('name'));
        childTable.field(field5);

        assert.ok(field1.webize());
        assert.ok(field4.webize());
        assert.ok(field5.webize());

    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}


exports.runTests = runTests;
