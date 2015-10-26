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
        function(callback) { db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
        function(callback) { db1.runSql('CREATE TABLE invoice (id int, amount int, customerId int)', [], callback); },
        function(callback) {
            var i=1; 
            async.whilst(
                function() { return i <= 10 },
                function(callback) { 
                    db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(' + i + ', ' + (i*10) + ', 1)', [], function() { ++i;  callback(); }); 
                },
                function(err) { callback(); }
            );
            var j=11;
            async.whilst(
                function() { return j <= 20 },
                function(callback) { 
                    db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(' + j + ', ' + (j*10) + ', 2)', [], function() { ++j;  callback(); }); 
                },
                function(err) { callback(); }
            );
        }
    ], callback);
}

var tests = {
    _name: 'actAsClient',
    testFetchCustomerList: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_customer_customerDao.customerDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_customer_customerBo.customerBo);
        var request = {};
        var response = {};
        async.series([
                function(callback) { 
                    db1.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], callback); 
                },
                function(callback) { db1.runSql('CREATE TABLE invoice (id int, amount int, customerId int)', [], callback); },
                function(callback) { db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
                function(callback) { db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(1, 10, 1)', [], callback); },
                function(callback) { db1.runSql('INSERT INTO invoice (id, amount, customerId) VALUES(2, 20, 1)', [], callback); },
                function(callback) {
                    return m_controller.list(boSet, request, response, function(response) {
                        assert.strictEqual(1, response.data.rows.length);
                        assert.strictEqual(1, response.data.rows[0].fields[0].value);
                        assert.strictEqual(30, response.data.rows[0].fields[3].value);
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

                        console.log('with templateRow', util.inspect(response.data.templateRow, { depth: 3} ));
                        console.log('with aggregateRow', util.inspect(response.data.aggregateRow, { depth: 3} ));
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
