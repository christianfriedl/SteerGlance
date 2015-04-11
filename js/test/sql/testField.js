var field = require('sql/field.js');
var assert = require('assert');

var Tests = {

    testIdentName: function() {
        var id1 = field.field('id1');
        assert.strictEqual('id1', id1.identifierName());
        var name1 = field.field('name1');
        assert.strictEqual('name1', name1.identifierName());
        // TODO moar tests!!!
    },

   testGetterName: function() {
        var id1 = field.field('id1');
        assert.strictEqual('getId1', id1.getterName());
        var name1 = field.field('name1');
        assert.strictEqual('getName1', name1.getterName());
        // TODO moar tests!!!
    },

    testSetterName: function() {
        var id1 = field.field('id1');
        assert.strictEqual('setId1', id1.setterName());
        var name1 = field.field('name1');
        assert.strictEqual('setName1', name1.setterName());
        // TODO moar tests!!!
    }

};

function runTests() {
    console.log('>>>>', module.filename);
    var f = null;
    for (f in Tests) {
        if ( typeof(Tests[f]) === 'function' && f.substr(0,4) === 'test' ) {
            console.log('>>>', f);
            Tests[f]();
            console.log('<<<', f);
        }
    }
    console.log('<<<<', module.filename);
}


exports.runTests = runTests;
