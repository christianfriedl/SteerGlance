"use strict";

var assert = require('assert');
var model_EntityModel = require('model/EntityModel.js');

describe('model_EntityModel', function() {
    describe('create', function() {
        it('should create a basic query', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            /*
            var cond = filter.filter: function()
                .field(new field.Field('field1'))
                .op(filter.Op.eq)
                .compareTo('haha');
                */
            var select = sql_Query.select(field1).from(table1);

            assert.strictEqual(1, select.getFields().length);
            // var sqliteQQ = sqlite_Query.create(select);
        });
    });
});
