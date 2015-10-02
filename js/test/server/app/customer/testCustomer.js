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
var m_server_app_customer_customer = require('server/app/customer/customer.js');
var m_sql_db = require('sql/db.js');
var assert = require('assert');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'app/customer/testCustomer.js',
    testEdit: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        async.series([
                function(callback) { 
                    db1.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], callback); },
                function(callback) { 
                    db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
                function(callback) {
                    m_server_app_customer_customer.edit({ db: db1, query: { id: 1 } }, { }, function(response) {
                        console.log('response in test', response);
                        callback();
                    });
                },
                function(callback) {
                    db1.close();
                    callback();
                }
            ],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
