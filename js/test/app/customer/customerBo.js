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
                    console.log('id before save', bo1.id(), bo1.fieldValue('id'));
                    bo1.save(function(err) {assert.strictEqual(false, err); });
                    callback();
                },
                function(callback) { 
                    db1.allSql('SELECT * FROM customer', [], function(err, rows) { 
                        assert.strictEqual(1, rows.length);
                        assert.strictEqual(1, rows[0]['id']);
                        assert.strictEqual('Christian', rows[0]['firstName']);
                        assert.strictEqual('Friedl', rows[0]['lastName']);
                        callback(err); 
                    }); 
                },
                function(callback) {
                    var bo2 = m_app_customer_customerBo.customerBo(db1);
                    bo2.loadById(1, function(err, bo3) {
                        assert.strictEqual(false, err);
                        assert.strictEqual('Christian', bo2.firstName());
                        assert.strictEqual('Friedl', bo2.lastName());
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
    },
    testInsert: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var bo1 = m_app_customer_customerBo.customerBo(db1);
        async.series([
                function(callback) { 
                    db1.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], callback); },
                function(callback) { 
                    db1.runSql('INSERT INTO customer (id, firstName, lastName) VALUES(1, \'Hargenbrihl\', \'Zackenbruck\')', [], callback); },
                function(callback) {
                    bo1.firstName('Christian');
                    bo1.lastName('Friedl');
                    bo1.save(function(err) {
                        assert.strictEqual(false, err); 
                        callback();
                    });
                },
                function(callback) { 
                    db1.allSql('SELECT * FROM customer ORDER BY id', [], function(err, rows) { 
                        if ( err ) throw err;
                        assert.strictEqual(2, rows.length);
                        assert.strictEqual(1, rows[0]['id']);
                        assert.strictEqual('Hargenbrihl', rows[0]['firstName']);
                        assert.strictEqual('Zackenbruck', rows[0]['lastName']);
                        assert.strictEqual('Christian', rows[1]['firstName']);
                        assert.strictEqual('Friedl', rows[1]['lastName']);
                        callback(err); 
                    }); 
                },
                function(callback) {
                    db1.close();
                    callback();
                }
           ],
            function(err, result) { if ( err ) throw err; console.log(result); }
        );
    }, testCalcField: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var bo1 = m_app_customer_customerBo.customerBo(db1);
        async.series([
            function(callback) {
                db1._db._db.serialize(function() {
                    db1._db._db.run('CREATE TABLE customer (id int, firstName text, lastName text)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO customer VALUES(1, \'Karenbruck\', \'Hardnebrautz\')', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO customer VALUES(2, \'Christian\', \'Friedl\')', [], function(err, res) { console.log(err, 'done', res); });

                    db1._db._db.run('CREATE TABLE invoice (id int, customerId int, amount decimal)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO invoice VALUES(1, 1, 10.0)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO invoice VALUES(2, 1, 20.0)', [], function(err, res) { console.log(err, 'done', res); });
                    callback(false);
                });
            },
            function (callback) {
                console.log('testCalcField loading starts');
                bo1.loadById(1, function(err, result) {
                    console.log('testCalcField result', result);
                    callback(false);
                });
            }
        ]);
    }
};

var tests2 = {
    _name: 'testCustomerBo',
    testCalcField: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var bo1 = m_app_customer_customerBo.customerBo(db1);
        async.series([
            function(callback) {
                db1._db._db.serialize(function() {
                    db1._db._db.run('CREATE TABLE customer (id int, firstName text, lastName text)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO customer VALUES(1, \'Karenbruck\', \'Hardnebrautz\')', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO customer VALUES(2, \'Christian\', \'Friedl\')', [], function(err, res) { console.log(err, 'done', res); });

                    db1._db._db.run('CREATE TABLE invoice (id int, customerId int, amount decimal)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO invoice VALUES(1, 1, 10.0)', [], function(err, res) { console.log(err, 'done', res); });
                    db1._db._db.run('INSERT INTO invoice VALUES(2, 1, 20.0)', [], function(err, res) { console.log(err, 'done', res); });
                    callback(false);
                });
            },
            function (callback) {
                bo1.loadById(1, function(err, result) {
                    assert.strictEqual(30, bo1.field('sumInvoiceAmount').value());
                    callback(false);
                }, true);
            }
        ]);
    }
};

function runTests() {
    m_TestSuite.TestSuite.call(tests2);
    m_TestSuite.TestSuite.prototype.runTests.call(tests2);
}

exports.runTests = runTests;
