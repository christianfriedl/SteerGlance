"use strict";

var assert = require('assert');
var sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
var sql_ValueField = require('sql/ValueField.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');
var sql_sqlite_Query = require('sql/sqlite/Query.js');
var sql_DB = require('sql/DB.js');

describe('sql_sqlite_Query', function() {
    describe('create', function() {
        it('should insert and fetch a field', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var select = sql_Query.select(field1).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(select);
            assert.strictEqual('SELECT table1.field1 FROM table1 WHERE table1.field1 = ?', sqliteQQ.getQueryString());
        });
        it('should output a sqlite update query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var update = sql_Query.update(sql_ValueField.create(field1, 1)).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(update);
            assert.strictEqual('UPDATE table1 SET field1 = ? WHERE table1.field1 = ?', sqliteQQ.getQueryString());
            assert.deepStrictEqual([1, 'haha'], sqliteQQ.getParams());
        });
        it('should output a sqlite insert query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var insert = sql_Query.insert(sql_ValueField.create(field1, 1)).into(table1);

            var sqliteQQ = sql_sqlite_Query.create(insert);
            assert.strictEqual('INSERT INTO table1 (field1) VALUES (?)', sqliteQQ.getQueryString());
            assert.deepStrictEqual([1], sqliteQQ.getParams());
        });
    });
});
