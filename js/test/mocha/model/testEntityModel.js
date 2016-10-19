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
        });
    });
});
