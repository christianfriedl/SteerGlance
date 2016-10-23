"use strict";

var assert = require('assert');
var model_EntityModel = require('model/EntityModel.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');

describe('model_EntityModel', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.db(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE table1 (id int, field1 int)', [])
            .then(function() { done(); });
    });
    it('should insert an entity', function(done) {
        console.log('start insert entity');
        var table1 = sql_Table.create('table1');
        var field1 = sql_Field.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const model = model_EntityModel.create(db1, table1);
        model.getTable().getField('field1').setValue(1);
        model.save().then( function() {
            console.log('then', arguments);
            db1.allSql('SELECT * FROM table1', []).then(function(rows) {
                console.log('rows', rows);
                done();
            });
        });
    });
});
