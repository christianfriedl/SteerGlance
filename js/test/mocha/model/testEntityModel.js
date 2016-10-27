/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of SteerGlance.
 *
 * SteerGlance is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var q = require('q');
var assert = require('assert');
var model_EntityModel = require('model/EntityModel.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_LookupField = require('sql/LookupField.js');
const sql_LookupIdField = require('sql/LookupIdField.js');
const model_EntitySetModel = require('model/EntitySetModel.js');

describe('model_EntityModel', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.db(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE table1 (id int, field1 int)', [])
            .then(function() { done(); });
    });
    afterEach(function() {
        db1.close();
    });
    it.skip('should insert an entity', function(done) {
        console.log('start insert entity');
        var table1 = sql_Table.create('table1');
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const model = model_EntityModel.create(db1, table1);
        model.getTable().getField('field1').setValue(1);
        model.save().then( function() {
            db1.allSql('SELECT * FROM table1', []).then(function(rows) {
                assert.strictEqual(rows.length, 1, 'there is exactly 1 row');
                assert.strictEqual(Number.parseInt(rows[0]['id']), 1, 'id is 1');
                assert.strictEqual(Number.parseInt(rows[0]['field1']), 1, 'field1 is 1');
                console.log('rows', rows);
                done();
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });
    it.skip('should update an entity', function(done) {
        console.log('start update entity');
        db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]).then(function() { 
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);

            const model = model_EntityModel.create(db1, table1);
            model.getTable().getField('id').setValue(1);
            model.getTable().getField('field1').setValue(2);
            model.save().then( function() {
                db1.allSql('SELECT * FROM table1 ORDER BY id', []).then(function(rows) {
                    console.log('rows', rows);
                    assert.strictEqual(rows.length, 1, 'there is exactly 1 row');
                    assert.strictEqual(Number.parseInt(rows[0]['id']), 1, 'id is 1');
                    assert.strictEqual(Number.parseInt(rows[0]['field1']), 2, 'field1 is 2');
                    done();
                }).catch(function(err) {
                    done(err);
                });
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
            throw new Error(err);
        });
    });
    it('should find an entity by lookup field', function(itdone) {
            db1.runSql('CREATE TABLE table2 (id int, table1Id int)', []).then(function() {
                console.log('oida1');
                return db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]);
            }).then(function() {
                console.log('oida2');
                return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [1, 1]);
            }).then(function() {
                console.log('oida3');
                let table1, field1, table2, table1Id, table1Ref, id1, id2, entityModel1, entitySetModel1, entitySetModel2;
                table1 = sql_Table.create('table1');
                field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
                table1.addField(field1);
                entityModel1 = model_EntityModel.create(db1, table1);
                entitySetModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
                table2 = sql_Table.create('table2');
                table2.addField(sql_ValueField.create('id', sql_Field.DataType.int));
                table1Id = sql_ValueField.create('table1Id', sql_Field.DataType.int);
                table1Ref = sql_LookupField.create('table1', table1Id, entitySetModel1, 'table 1');
                console.log('table1Ref is field', table1Ref);
                table2.addField(table1Id);
                table2.addField(table1Ref);
                entitySetModel2 = model_EntitySetModel.create(db1, table2, model_EntityModel.create);

                return entitySetModel2.findEntityById(1)
                    .then( (entity2) => { console.log('start it all done done 1', entity2, 'field:::', entity2.getTable().getField('table1'));return entity2.getTable().getField('table1').getValue(); })
                    .then( (entity1) => { console.log('start it all done done 2:', entity1);return entity1.getTable().getField('id').getValue(); })
                    .then( (id) => { 
                        assert.ok(false);
                        assert.strictEqual(id, 1, 'id of table1 entity is 1'); 
                        console.log('will done done 3');
                        done();
                    })
                    .done();
            }).then( (em) => {
                console.log(em);
                itdone();
            }).catch( (err) => {
                console.error(err);
            }).done();
    });
});
