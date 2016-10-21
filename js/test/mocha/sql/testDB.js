"use strict";

var assert = require('assert');
var sql_DB = require('sql/DB.js');
var sql_Table = require('sql/Table.js');
var sql_Field = require('sql/Field.js');
var sql_ValueField = require('sql/ValueField.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');
var sql_sqlite_Query = require('sql/sqlite/Query.js');

describe('sql_sqlite_Query', function() {
    describe('create', function() {
        var db1;
        beforeEach(function(done) {
            db1 = sql_DB.db(':memory:').open(':memory:');
            db1._db.runSql('CREATE TABLE table1 (field1 int)', [], function(err) {
                done(err);
            });
        });
        it('should run a sqlite update query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var update = sql_Query.update(sql_ValueField.create(field1, 1)).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(update);
            assert.strictEqual('UPDATE table1 SET field1 = ? WHERE table1.field1 = ?', sqliteQQ.getQueryString());
            assert.deepStrictEqual([1, 'haha'], sqliteQQ.getParams());
            db1.run(sqliteQQ, function(err, result) {
                if ( err ) {
                    return done(err);
                }
                console.log(result);
                done();
            });
        });
        it('should run a sqlite insert query', function(done) {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var insert = sql_Query.insert(sql_ValueField.create(field1, 1)).into(table1);

            var sqliteQQ = sql_sqlite_Query.create(insert);
            db1.run(sqliteQQ, function(err, result) {
                if ( err ) {
                    return done(err);
                }
                console.log(result);
                done();
            });
        });
    });
});
