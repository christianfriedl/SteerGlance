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

var m_sql_field = require('sql/field.js');
var m_sql_table = require('sql/table.js');
var m_sql_fieldLink = require('sql/fieldLink.js');
var m_sql_lazyFieldLink = require('sql/lazyFieldLink.js');
var m_sql_lazyFieldLinkManager = require('sql/lazyFieldLinkManager.js');
var assert = require('assert');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'testFieldLinkManager',

    testCreate: function() {
        var id1 = m_sql_field.field('id1', m_sql_field.DataType.int);
        var table1 = m_sql_table.table('table1').field(id1);
        var id2 = m_sql_field.field('id2', m_sql_field.DataType.int);
        var table2 = m_sql_table.table('table2').field(id2);
        var mgr1 = m_sql_lazyFieldLinkManager.lazyFieldLinkManager();
        var d = m_sql_lazyFieldLink.lazyFieldLink(table1, 'id1', table2, 'id2', m_sql_fieldLink.Type.oneToMany);
        mgr1.addLink(d);
        assert.equal(1, mgr1._lazyFieldLinks.length);
    },
    testApply: function() {
        var id1 = m_sql_field.field('id1', m_sql_field.DataType.int);
        var table1 = m_sql_table.table('table1').field(id1);
        var id2 = m_sql_field.field('id2', m_sql_field.DataType.int);
        var table2 = m_sql_table.table('table2').field(id2);
        var mgr1 = m_sql_lazyFieldLinkManager.lazyFieldLinkManager();
        var d = m_sql_lazyFieldLink.lazyFieldLink(table1, 'id1', table2, 'id2', m_sql_fieldLink.Type.oneToMany);
        mgr1.addLink(d);
        mgr1.apply();
        assert.ok(table1.field('id1').link(table2));
    },
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}


exports.runTests = runTests;
