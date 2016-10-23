"use strict";

var assert = require('assert');
var model_EntityModel = require('model/EntityModel.js');

describe('model_EntityModel', function() {
    describe('create', function() {
        it('should return an object with getter and setter delegates', function() {
            const object = { 'abc': 'ABC', 'def': 'DEF' };
            const model = model_EntityModel.create(object);
            assert.strictEqual('ABC', model.getAbc());
            assert.strictEqual('DEF', model.getDef());

            model.setAbc('xyz');
            assert.strictEqual('xyz', model.getAbc());

            assert.strictEqual('xyz', model.xyz());

            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', field.DataType.int);
            table1.addField(field1);
            /*
            var cond = filter.filter: function()
                .field(new field.Field('field1'))
                .op(filter.Op.eq)
                .compareTo('haha');
                */
            var select = sql_Query.select(field1).from(table1);
            // var sqliteQQ = sqlite_Query.create(select);
        });
    });
});
