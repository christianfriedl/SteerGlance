var assert = require('assert');
var async = require('async');
var table = require('../../../server/sql/table.js');
var field = require('../../../server/sql/field.js');
var condition = require('../../../server/sql/condition.js');
var query = require('../../../server/sql/query.js');
var dao = require('../../../server/dao/dao.js');
var customerDao = require('../../../server/dao/customerDao.js');
var sqlDb = require('../../../server/sql/db.js');

function testQuery() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.Type.int);
    table1.field(field1);
    var select = query.select(field1).from(table1);
    assert.strictEqual(1, select._fields.length);
    assert.strictEqual(1, select._fields.length);
}
function testQuery2() {
    var cond = condition.condition()
        .field(new field.Field('field1'))
        .op(condition.Op.eq)
        .compareTo('haha');
}

function testLoadById() {
    var db = sqlDb.db().open(':memory:');
    var table1 = new table.Table('table1').field(new field.Field('id', field.Type.int));
    db.runSql('CREATE TABLE table1 (id int)', [], function(err) { 
        console.log(err); 
        var d = new dao.DAO(db, table1);
        d.loadById(20);
    });
}
function testCustomerDao() {
    var db = sqlDb.db().open(':memory:');
    async.series([
            function(callback) {
                db.runSql('CREATE TABLE customer (id int, firstName text, lastName text)', [], function(err) { 
                    if (err) return callback(err);
                    callback();
                });
            },
            function(callback) {
                db.runSql("INSERT INTO customer (id, firstName, lastName) VALUES(20, 'erster', 'zweiter')", [], function(err) { 
                    if (err) return callback(err);
                    callback();
                });
            },
            function(callback) {
                    var d = new customerDao.CustomerDao(db);
                    d.loadById(20, function(err) {
                        if (err) return callback(err);
                        console.log(d);
                        callback();
                    });
            },
            function(callback) {
                db.close();
                callback();
            }
            ], function(err) {
                if ( err ) {
                    console.log('err', err); 
                }
            });
}


/*
testQuery();
testQuery2();
*/
// testLoadById();
testCustomerDao();

