var field = require('sql/field.js');
var m_sql_calcField = require('sql/calcField.js');
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
    },
    testCalcField: function() {
        var id1 = m_sql_calcField.calcField('id1', field.DataType.int, m_sql_calcField.CalcType.sum, { label: 'Label' });
        assert.strictEqual('id1', id1.name());
        try {
            id1.value();
        } catch (/*Error*/e) {
            assert.strictEqual('calcField of calcType "sum" requires sumField to be set', e.message);
        }
        var id2 = m_sql_calcField.calcField('id1', field.DataType.int, m_sql_calcField.CalcType.sum, { label: 'Label' });
        assert.strictEqual('id1', id1.name());
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
