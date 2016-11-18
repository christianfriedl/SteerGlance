"use strict";

const assert = require('assert');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_Query = require('sql/Query.js');
const sql_Filter = require('sql/Filter.js');
const sql_sqlite_Query = require('sql/sqlite/Query.js');

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
        it('should output a sqlite update query', function(done) {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int, 'field1', 1);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');
            var update = sql_Query.update(field1).from(table1).where(cond);

            var sqliteQQ = sql_sqlite_Query.create(update);
            assert.strictEqual('UPDATE table1 SET field1 = ? WHERE table1.field1 = ?', sqliteQQ.getQueryString());
            sqliteQQ.getParams().then( (params) => {
                assert.deepStrictEqual(params, [1, 'haha'], 'parameters for update');
            }).catch( (e) => {
                done(e);
            }).then( () => { done(); });
        });
        it('should output a sqlite insert query', function(done) {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int, 'field1', 1);
            table1.addField(field1);
            var insert = sql_Query.insert(field1).into(table1);

            var sqliteQQ = sql_sqlite_Query.create(insert);
            assert.strictEqual('INSERT INTO table1 (field1) VALUES (?)', sqliteQQ.getQueryString());
            sqliteQQ.getParams().then( (params) => {
                assert.deepStrictEqual(params, [1], 'parameters for insert');
            }).catch( (e) => {
                done(e);
            }).then( () => { done(); });
        });
    });
});
