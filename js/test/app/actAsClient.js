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

var _ = require('underscore');
var async = require('async');
var m_app_customer_customerDao = require('app/customer/customerDao.js');
var m_app_customer_customerBo = require('app/customer/customerBo.js');
var m_app_invoice_invoiceDao = require('app/invoice/invoiceDao.js');
var m_app_invoice_invoiceBo = require('app/invoice/invoiceBo.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var m_sql_db = require('sql/db.js');
var assert = require('assert');
var m_TestSuite = require('TestSuite.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var m_controller = require('server/defaultController.js');
var util = require('util');

function setupDb(db1, callback) {
    async.series([
        function(callback) { db1.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], callback); },
        function(callback) { db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Christian\', \'Friedl\')', [], callback); },
        function(callback) { db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(2, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
        function(callback) { db1.runSql('CREATE TABLE invoice (id int, amount int, customerId int)', [], callback); },
        function(callback) {
            var i=1; 
            async.whilst(
                function() { return i <= 10 },
                function(callback) { 
                    db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(' + i + ', ' + (i*10) + ', 1)', [], function() { ++i;  callback(); }); 
                },
                function(err, res) { }
                // 10 + 20 + ... + 100 = 550 => custid 1
            );
            var j=11;
            async.whilst(
                function() { return j <= 20 },
                function(callback) { 
                    db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(' + j + ', ' + (j*10) + ', 2)', [], function() { ++j;  callback(); }); 
                },
                function(err, res) { callback(); }
                // 110 + 120 + ... + 200 = 1550 => custid 2

                // custid 1 + custid 2 => 550 + 1550 = 2100
            );
        }
    ], callback);
}

var tests = {
    _name: 'actAsClient',
    testFetchCustomerList: function() { // can test calcfield...
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_customer_customerDao.customerDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_customer_customerBo.customerBo);
        var request = {};
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return m_controller.list(boSet, request, response, function(response) {
                        console.log('testFetchCustomerList: "responsecallback" received response', response, 'with rows', util.inspect(response.data.rows, { depth: 3} ));
                        console.log('testFetchCustomerList: "responsecallback" with templateRow', util.inspect(response.data.templateRow, { depth: 3} ));
                        console.log('testFetchCustomerList: "responsecallback" with aggregateRow', util.inspect(response.data.aggregateRow, { depth: 3} ));
                        assert.strictEqual('list', response.action);
                        assert.strictEqual(2, response.data.count);
                        assert.ok(response.data.rows);
                        assert.strictEqual(2, response.data.rows.length);
                        assert.ok(response.data.aggregateRow);
                        assert.ok(response.data.aggregateRow.fields);
                        assert.ok(response.data.templateRow.fields);
                        assert.ok(response.data.rows[0].fields);
                        assert.strictEqual(1, response.data.rows[0].id);
                        assert.strictEqual(1, _(response.data.rows[0].fields).findWhere({ name: 'id' }).value);
                        assert.strictEqual(550, _(response.data.rows[0].fields).findWhere({ name: 'sumInvoiceAmount' }).value);
                        assert.strictEqual(2, response.data.rows[1].id);
                        assert.strictEqual(2, _(response.data.rows[1].fields).findWhere({ name: 'id' }).value);
                        assert.strictEqual(1550, _(response.data.rows[1].fields).findWhere({ name: 'sumInvoiceAmount' }).value);
                        assert.strictEqual(2100, _(response.data.aggregateRow.fields).findWhere({ name: 'sumInvoiceAmount' }).value);
                        callback();
                    });

                }
        ]);

    },
    testFetchInvoiceList: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = {};
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return m_controller.list(boSet, request, response, function(response) {
                        assert.strictEqual(20, response.data.count);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                        assert.strictEqual(1, response.data.rows[0].fields[0].value);
                    });

                }
        ]);
    },
    testFetchInvoiceListWithLimits: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 9 } } };
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return m_controller.list(boSet, request, response, function(response) {
                        assert.strictEqual(3, response.data.rows.length);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                    });

                }
        ]);
    },
    testFetchInvoiceListWithLimitsAndOrderby: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 9, count: 2, orderBy: [ { field: 'id' } ] } } };
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return m_controller.list(boSet, request, response, function(response) {
                        console.log('"responsecallback" received response', response, 'with rows', util.inspect(response.data.rows, { depth: 3} ));
                        assert.strictEqual(3, response.data.rows.length);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                        assert.strictEqual(10, response.data.rows[0].fields[0].value);
                        assert.strictEqual(100, response.data.rows[0].fields[1].value);
                        assert.strictEqual(1, response.data.rows[0].fields[2].value);

                        assert.strictEqual('id', response.data.rows[1].fields[0].name);
                        assert.strictEqual(11, response.data.rows[1].fields[0].value);
                        assert.strictEqual(110, response.data.rows[1].fields[1].value);
                        assert.strictEqual(2, response.data.rows[1].fields[2].value);

                        assert.strictEqual('id', response.data.rows[2].fields[0].name);
                        assert.strictEqual(12, response.data.rows[2].fields[0].value);
                        assert.strictEqual(120, response.data.rows[2].fields[1].value);
                        assert.strictEqual(2, response.data.rows[2].fields[2].value);

                        console.log('"responsecallback" with templateRow', util.inspect(response.data.templateRow, { depth: 3} ));
                        console.log('"responsecallback" with aggregateRow', util.inspect(response.data.aggregateRow, { depth: 3} ));
                    });

                }
        ]);

    },
    testFetchInvoiceListWithFilter: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 0, orderBy: [ { field: 'id' } ], filters: [ { fieldName: 'customerId', opName: 'eq', value: '2' } ] } } };
        var response = {};
        async.series([
            function(callback) { setupDb(db1, callback); },
            function(callback) {
                return m_controller.list(boSet, request, response, function(response) {
                    console.log('"responsecallback" in testFetchInvoiceListWithFilter received response', response, 'with rows', util.inspect(response.data.rows, { depth: 10} ));
                    assert.strictEqual(response.data.rows.length, 3);
                    var f = _(response.data.rows[0].fields).find(function(f) { return f.name === 'customerId' });
                    assert.strictEqual(2, f.value);
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
