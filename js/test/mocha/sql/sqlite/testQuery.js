"use strict";

var assert = require('assert');
var sql_Table = require('sql/Table.js');
var sql_Field = require('sql/Field.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');
var sql_sqlite_Query = require('sql/sqlite/Query.js');

describe('sql_sqlite_Query', function() {
    describe('create', function() {
        it('should create a select query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');

            var select = sql_Query.select(field1).from(table1).where(cond);

            assert.strictEqual(1, select.getFields().length, '# of fields');
            assert.strictEqual(1, select.getTables().length, '# of tables');

            assert.strictEqual('field1', select.getFields()[0].getName());
            assert.strictEqual('table1', select.getTables()[0].getName());
            var sqliteQQ = sql_sqlite_Query.create(select);
            assert.strictEqual('SELECT table1.field1 FROM table1 WHERE table1.field1 = ?', sqliteQQ.getQueryString());
        });
        it('should create a update query', function() {
            assert.ok(false, 'test is not implemented');
        });
        it('should create a insert query', function() {
            assert.ok(false, 'test is not implemented');
        });
    });
});
