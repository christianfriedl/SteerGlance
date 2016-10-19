var assert = require('assert');
var model_Model = require('model/model.js');

describe('model_Model', function() {
    describe('createModel', function() {
        it('should return an object with getters and setters', function() {
            const object = { 'abc': 'ABC', 'def': 'DEF' };
            const model = model_Model.createModel(object);
            assert.strictEqual('ABC', model.getAbc());
            assert.strictEqual('DEF', model.getDef());

            model.setAbc('xyz');
            assert.strictEqual('xyz', model.getAbc());

            // TODO negative test???
        });
    });
});
