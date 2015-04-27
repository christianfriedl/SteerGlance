var async = require('async');
var m_app_customer_customerBo = require('app/customer/customerBo.js');
var m_sql_db = require('sql/db.js');
var assert = require('assert');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'testCustomerBo',
    testUpdate: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var bo1 = m_app_customer_customerBo.customerBo(db1);
        async.series([
            function(callback) { db1.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
            function(callback) {
                bo1.id(1);
                bo1.firstName('Christian');
                bo1.lastName('Friedl');
                bo1.save(function() {});
                var bo2 = m_app_customer_customerBo.customerBo(db1);
                bo2.loadById(1, function(err) {
                    if ( err ) throw err;
                    assert.strictEqual('Christian', bo2.firstName());
                    assert.strictEqual('Friedl', bo2.lastName());
                });
            }],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }
};

function runTests() {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests);
}

exports.runTests = runTests;
