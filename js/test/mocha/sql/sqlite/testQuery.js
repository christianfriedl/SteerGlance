"use strict";

var assert = require('assert');
var sql_Table = require('sql/Table.js');
var sql_Field = require('sql/Field.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');
var sql_sqlite_Query = require('sql/sqlite/Query.js');

describe('sql_sqlite_Query', function() {
    describe('create', function() {
        it('should output a sqlite select query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var select = sql_Query.select(field1).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(select);
            assert.strictEqual('SELECT table1.field1 FROM table1 WHERE table1.field1 = ?', sqliteQQ.getQueryString());
        });
        it('should output a sqlite update query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            field1.setValue(1);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var select = sql_Query.update(field1).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(select);
            assert.strictEqual('UPDATE table1 SET field1 = ? WHERE table1.field1 = ?', sqliteQQ.getQueryString());
            assert.deepStrictEqual([1, 'haha'], sqliteQQ.getParams());
        });
        it('should output a sqlite insert query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            field1.setValue(1);
            table1.addField(field1);
            var insert = sql_Query.insert(field1).into(table1);

            var sqliteQQ = sql_sqlite_Query.create(insert);
            assert.strictEqual('INSERT INTO table1 (field1) VALUES (?)', sqliteQQ.getQueryString());
            assert.deepStrictEqual([1], sqliteQQ.getParams());
        });
    });
});
