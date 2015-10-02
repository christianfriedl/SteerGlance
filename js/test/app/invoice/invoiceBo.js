var async = require('async');
var m_app_invoice_invoiceDao = require('app/invoice/invoiceDao.js');
var m_app_invoice_invoiceBo = require('app/invoice/invoiceBo.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var m_sql_db = require('sql/db.js');
var assert = require('assert');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'testInvoiceBo',
    testUpdate: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var bo1 = m_app_invoice_invoiceBo.invoiceBo(db1);
        async.series([
                function(callback) { db1.runSql('CREATE TABLE invoice (id int, customerId int, amount decimal)', [], callback); },
                function(callback) { db1.runSql('INSERT INTO invoice VALUES(1, 1, 10.0)', [], callback); },
                function(callback) { db1.runSql('INSERT INTO invoice VALUES(2, 1, 20.0)', [], callback); },
                function(callback) {
                    bo1.id(1);
                    bo1.customerId(1);
                    bo1.amount(12.0);
                    bo1.save(function(err, bo2) {
                        console.log('_save', bo1, bo2);
                        assert.strictEqual(false, err); 
                        assert.strictEqual(1, bo1.id());
                        assert.strictEqual(12, bo1.amount());
                        assert.strictEqual(1, bo2.id());
                        assert.strictEqual(12, bo2.amount());
                    });
                    callback();
                },
                function(callback) { 
                    db1.allSql('SELECT * FROM invoice', [], function(err, rows) { 
                        assert.strictEqual(2, rows.length);
                        assert.strictEqual(1, rows[0]['id']);
                        assert.strictEqual(12, rows[0]['amount']);
                        callback(err); 
                    }); 
                },
                function(callback) {
                    var bo2 = m_app_invoice_invoiceBo.invoiceBo(db1);
                    bo2.loadById(1, function(err, bo3) {
                        assert.strictEqual(false, err);
                        assert.strictEqual(12, bo2.amount());
                        assert.strictEqual(bo2, bo3);
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
