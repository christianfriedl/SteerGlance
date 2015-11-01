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
var m_sql_db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_sql_table = require('sql/table.js');
var m_sql_field = require('sql/field.js');
var m_sql_fieldLink = require('sql/fieldLink.js');
var m_sql_boSetField = require('sql/boSetField.js');

var tests = {
    _name: 'testBoSetField',
    tesCreationEtc: function() {
        var f_customer_id = m_sql_field.field('id', field.DataType.int);
        var f_customer_name = m_sql_field.field(name', field.DataType.string);
        var f_invoice_customerId = m_sql_field.field('customerId', field.DataType.int);
        var fl_invoice_customerId = m_sql_fieldLink.fieldLink(f_invoice_customerId, f_customer_id, m_sql_fieldLink.Type.manyToOne);
        var f_invoice_customerBoSet = m_sql_boSetField.boSetField('customerBoSet', ....testitet
        var t_customer = table.table().field(f_customer_id).field(f_customer_name);
        var t_invoice = table.table().field(f_invoice_customerId).field(f_invoice_customerBoSet);

    },
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
