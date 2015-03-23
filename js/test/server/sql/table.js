var assert = require('assert');
var table = require('../../../server/sql/table.js');
var field = require('../../../server/sql/field.js');
var fieldLink = require('../../../server/sql/fieldLink.js');

function testTable1() {
    var table1 = new table.Table('table1');
    assert.strictEqual('table1', table1.getName());
    var field1 = new field.Field('field1', field.Type.int);
    table1.addField(field1);
    assert.strictEqual(table1, field1.getTable());
}

function testTable2() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.Type.int);
    table1.addField(field1);
    var table2 = new table.Table('table2');
    var field2 = new field.Field('field2', field.Type.int);
    table2.addField(field2);

    var fieldLink1 = new fieldLink.FieldLink(field1, field2);
    assert.strictEqual(fieldLink.Type.oneToMany, fieldLink1.getType());
}

function testAll() {
    testTable1();
    testTable2();
}

testAll();

