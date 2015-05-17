var assert = require(   'assert');
var table = require(    'sql/table.js');
var field = require(    'sql/field.js');
var fieldLink = require('sql/fieldLink.js');

function testTable1() {
    var table1 = new table.Table('table1');
    assert.strictEqual('table1', table1.name());
    var field1 = new field.Field('field1', field.DataType.int);
    assert.strictEqual('field1', field1.name());
    assert.strictEqual(field.DataType.int, field1.dataType());
    table1.field(field1);
    assert.strictEqual(field1, table1.field('field1'));
    assert.strictEqual(table1, field1.table());
}

function testTable2() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.DataType.int);
    table1.field(field1);
    var table2 = new table.Table('table2');
    var field2 = new field.Field('field2', field.DataType.int);
    table2.field(field2);

    var fieldLink1 = new fieldLink.FieldLink(field1, field2);
    assert.strictEqual(fieldLink.Type.oneToMany, fieldLink1.type());
}

function testTable3() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.DataType.int);
    var field2 = new field.Field('field2', field.DataType.int);
    table1.field(field1);
    assert.strictEqual(0, table1.field('field1').seq());
    table1.field(field2);
    assert.strictEqual(1, table1.field('field2').seq());
    assert.strictEqual(2, table1.fieldsAsList().length);
}

function testAll() {
    testTable1();
    testTable2();
    testTable3();
}

testAll();
