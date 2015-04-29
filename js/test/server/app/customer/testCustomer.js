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

function runTests() {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests);
}

exports.runTests = runTests;
