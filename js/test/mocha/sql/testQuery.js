"use strict";

var assert = require('assert');
var sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
var sql_ValueField = require('sql/ValueField.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');

describe('model_EntityModel', function() {
    describe('create', function() {
        it('should create a select query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');

            var select = sql_Query.select(field1).from(table1).where(cond);

            assert.strictEqual(1, select.getFields().length, '# of fields');
            assert.strictEqual(1, select.getTables().length, '# of tables');

            assert.strictEqual('field1', select.getFields()[0].getName());
            assert.strictEqual('table1', select.getTables()[0].getName());
            console.log(select);
            // var sqliteQQ = sqlite_Query.create(select);
        });
        it.skip('should create a update query', function() {
            assert.ok(false, 'test is not implemented');
        });
        it.skip('should create a insert query', function() {
            assert.ok(false, 'test is not implemented');
        });
    });
});
