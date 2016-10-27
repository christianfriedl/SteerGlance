"use strict";

var assert = require('assert');
var sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
var sql_ValueField = require('sql/ValueField.js');
var sql_Query = require('sql/Query.js');
var sql_Filter = require('sql/Filter.js');

describe('sql_Table', function() {
    describe('create', function() {
        it('should create a table and return its fields', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            var cond = sql_Filter.create(field1, sql_Filter.Op.eq, 'haha');

            var select = sql_Query.select(field1).from(table1).where(cond);
        });
        it('should create a table with value fields', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            const table2 = table1.cloneWithValueFields();
            assert.ok( table2.getField('field1') instanceof sql_ValueField.ValueField, 'should be of type ValueField');

            table2.getField('field1').setValue(23);
            assert.ok( table2.getField('field1').getValue() === 23, 'value should be set');
        });
        it('should do other stuff', function() {
            assert.ok(false, 'needs implementation');
        });
    });
});
