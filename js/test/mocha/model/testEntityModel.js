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

var _ = require('lodash');
var q = require('q');
const util = require('util');
var assert = require('assert');
var model_EntityModel = require('model/EntityModel.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_LookupField = require('sql/LookupField.js');
const sql_ZoomField = require('sql/ZoomField.js');
const sql_SumField = require('sql/SumField.js');
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
    it('should insert an entity', function(done) {
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
                done();
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });
    it('should update an entity', function(done) {
        db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]).then(function() { 
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);

            const model = model_EntityModel.create(db1, table1);
            model.getTable().getField('id').setValue(1);
            model.getTable().getField('field1').setValue(2);
            model.save().then( function() {
                db1.allSql('SELECT * FROM table1 ORDER BY id', []).then(function(rows) {
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
            return db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [1, 1]);
        }).then(function() {
            let table1, field1, table2, table1Id, table1Lookup, id1, id2, entityModel1, entitySetModel1, entitySetModel2;
            table1 = sql_Table.create('table1');
            table1.addField(sql_ValueField.create('id', sql_Field.DataType.int));
            field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            entityModel1 = model_EntityModel.create(db1, table1);
            entitySetModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            table2 = sql_Table.create('table2');
            table2.addField(sql_ValueField.create('id', sql_Field.DataType.int));
            table1Id = sql_ValueField.create('table1Id', sql_Field.DataType.int);
            table1Lookup = sql_LookupField.create('table1', table1Id, entitySetModel1, 'table 1');
            table2.addField(table1Id);
            table2.addField(table1Lookup);
            entitySetModel2 = model_EntitySetModel.create(db1, table2, model_EntityModel.create);

            return entitySetModel2.findEntityById(1)
                .then( (entity2) => { 
                    const field = entity2.getTable().getField('table1');
                    return field.getValue(); 
                })
                .then( (entity1) => { 
                    const field = entity1.getTable().getField('id');
                    return field.getValue(); 
                })
                .then( (id) => { 
                    assert.strictEqual(id, 1, 'id of table1 entity is 1'); 
                    itdone();
                })
                .catch((e) => {
                    console.error('error in chain', e);
                    itdone(e);
                });
        }).done();
    });
    it('should find entities by zoom field', function(itdone) {
        db1.runSql('CREATE TABLE table2 (id int, table1Id int)', []).then(function() {
            return db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [1, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [2, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [5, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [3, 2]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id) VALUES(?, ?)', [4, 2]);
        }).then(function() {
            let table1, field1, table2, table1Id, table2Zoom, id1, id2, entityModel1, entitySetModel1, entitySetModel2;
            table1 = sql_Table.create('table1');
            field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            entityModel1 = model_EntityModel.create(db1, table1);
            entitySetModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            table2 = sql_Table.create('table2');
            table1Id = sql_ValueField.create('table1Id', sql_Field.DataType.int);
            table2.addField(table1Id);
            entitySetModel2 = model_EntitySetModel.create(db1, table2, model_EntityModel.create);
            table2Zoom = sql_ZoomField.create('table2s', table1.getField('id'), entitySetModel2, table1Id, 'Table 2s');
            table1.addField(table2Zoom);

            return entitySetModel1.findEntityById(1)
                .then( (entity1) => { 
                    const field = entity1.getTable().getField('table2s');
                    return field.getValue(); 
                })
                .then( (entity2s) => { 
                    q.all(_.map(entity2s, ( ent ) => { return ent.getTable().getField('id').getValue(); })).then ( (ids) => {
                        assert.ok(_.includes(ids, 1), 'resulting ids includes 1');
                        assert.ok(_.includes(ids, 2), 'resulting ids includes 2');
                        assert.ok(_.includes(ids, 5), 'resulting ids includes 5');
                    }).catch( (e) => {
                        itdone(e);
                    }).done();
                })
                .then( (entity2s) => { 
                    itdone();
                })
                .catch((e) => {
                    console.error('error in chain', e);
                    itdone(e);
                });
        }).done();
    });
    it('should sum up a sum by a sum field', function(itdone) {
        db1.runSql('CREATE TABLE table2 (id int, table1Id int, amount int)', []).then(function() {
            return db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id, amount) VALUES(?, ?, ?)', [1, 1, 20]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id, amount) VALUES(?, ?, ?)', [2, 1, 20]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id, amount) VALUES(?, ?, ?)', [5, 1, 20]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id, amount) VALUES(?, ?, ?)', [3, 2, 10]);
        }).then(function() {
            return db1.runSql('INSERT INTO table2(id, table1Id, amount) VALUES(?, ?, ?)', [4, 2, 10]);
        }).then(function() {
            let table1, field1, table2, table1Id, table2Zoom, id1, id2, entityModel1, entitySetModel1, entitySetModel2, amount;
            table1 = sql_Table.create('table1');
            field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            entityModel1 = model_EntityModel.create(db1, table1);
            entitySetModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            table2 = sql_Table.create('table2');
            table1Id = sql_ValueField.create('table1Id', sql_Field.DataType.int);
            table2.addField(table1Id);
            amount = sql_ValueField.create('amount', sql_Field.DataType.int);
            table2.addField(amount);
            entitySetModel2 = model_EntitySetModel.create(db1, table2, model_EntityModel.create);
            table2sumAmount = sql_SumField.create('table2sumAmount', table1.getField('id'), entitySetModel2, table1Id, amount, 'Table 2 amount sum');
            table1.addField(table2sumAmount);

            return entitySetModel1.findEntityById(1)
                .then( (entity1) => { 
                    const field = entity1.getTable().getField('table2sumAmount');
                    return field.getValue(); 
                })
                .then( (sumAmount) => { 
                    assert.strictEqual(sumAmount, 80, 'sum of table2.amount should be 80');
                })
                .then( (entity2s) => { 
                    itdone();
                })
                .catch((e) => {
                    console.error('error in chain', e);
                    itdone(e);
                });
        }).done();
    });
});
