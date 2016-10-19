var assert = require('assert');
var entity_Entity = require('entity/entity.js');

describe('entity_Entity', function() {
    describe('createEntity', function() {
        it('should return an object with getters and setters', function() {
            const object = { 'abc': 'ABC', 'def': 'DEF' };
            const entity = entity_Entity.createEntity(object);
            assert.strictEqual('ABC', entity.getAbc());
            assert.strictEqual('DEF', entity.getDef());

            entity.setAbc('xyz');
            assert.strictEqual('xyz', entity.getAbc());

            // TODO negative test???
        });
    });
});
