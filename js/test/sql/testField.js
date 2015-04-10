var field = require('sql/field.js');
var assert = require('assert');

function testIdentName() {
    var id1 = field.field('id1');
    assert.strictEqual('id1', id1.identifierName());
    var name1 = field.field('name1');
    assert.strictEqual('name1', name1.identifierName());
    // TODO moar tests!!!
}

function testGetterName() {
    var id1 = field.field('id1');
    assert.strictEqual('getId1', id1.getterName());
    var name1 = field.field('name1');
    assert.strictEqual('getName1', name1.getterName());
    // TODO moar tests!!!
}

function testSetterName() {
    var id1 = field.field('id1');
    assert.strictEqual('setId1', id1.setterName());
    var name1 = field.field('name1');
    assert.strictEqual('setName1', name1.setterName());
    // TODO moar tests!!!
}

function runTests() {
    testIdentName();
    testGetterName();
    testSetterName();
}

exports.runTests = runTests;
