var assert = require(   'assert');
var table = require(    '../../../server/sql/table.js');
var field = require(    '../../../server/sql/field.js');
var fieldLink = require('../../../server/sql/fieldLink.js');
var fieldList = require('../../../server/sql/query/fieldList.js');
var select = require(   '../../../server/sql/query/select.js');

function testTable1() {
    var table1 = new table.Table('table1');
    assert.strictEqual('table1', table1.name());
    var field1 = new field.Field('field1', field.Type.int);
    assert.strictEqual('field1', field1.name());
    assert.strictEqual(field.Type.int, field1.type());
    table1.field(field1);
    assert.strictEqual(field1, table1.field('field1'));
    assert.strictEqual(table1, field1.table());
}

function testTable2() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.Type.int);
    table1.field(field1);
    var table2 = new table.Table('table2');
    var field2 = new field.Field('field2', field.Type.int);
    table2.field(field2);

    var fieldLink1 = new fieldLink.FieldLink(field1, field2);
    assert.strictEqual(fieldLink.Type.oneToMany, fieldLink1.type());
}

function testTable3() {
    var table1 = new table.Table('table1');
    var field1 = new field.Field('field1', field.Type.int);
    var field2 = new field.Field('field2', field.Type.int);
    table1.addField(field1);
    table1.addField(field2);

    var fieldList1 = fieldList.fromTable(table1);

    assert.strictEqual(2, fieldList1.getFields().length);
    assert.strictEqual(field1.getName(), fieldList1.getFields()[0].getName());
}

function testAll() {
    testTable1();
    testTable2();
    testTable3();
}

testAll();
