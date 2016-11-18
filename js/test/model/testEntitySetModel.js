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

var assert = require('assert');
var q = require('q');
var model_EntityModel = require('model/EntityModel.js');
var model_EntitySetModel = require('model/EntitySetModel.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_Filter = require('sql/Filter.js');
const sql_ConditionSet = require('sql/ConditionSet.js');
const sql_OrderBy = require('sql/OrderBy.js');
const sql_OrderByField = require('sql/OrderByField.js');

describe('model_EntitySetModel', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.db(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE table1 (id int, field1 int)', [])
            .then(function() { 
                return db1.runSql('INSERT INTO table1 (id, field1) VALUES(1, 1)');
            }).then(function() { 
                return db1.runSql('INSERT INTO table1 (id, field1) VALUES(2, 2)');
            }).then(function() { 
                return db1.runSql('INSERT INTO table1 (id, field1) VALUES(3, 3)');
            }).done(function() { done(); });
    });
    afterEach(function() {
        db1.close();
    });
    it('should find an entity', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.findEntityById(1).then( function(em) {
            q.all( [ em.getTable().getField('id').getValue(), em.getTable().getField('field1').getValue() ]).spread( (id, field1) => {
                assert.strictEqual(id, 1);
                assert.strictEqual(field1, 1);
                done();
            });
        }).catch(function(err) {
            done(err);
        });
    });
    it('should not find a nonexisting entity', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.findEntityById(257).then( function(em) {
            assert.strictEqual(em, null);
            done();
        }).catch(function(err) {
            done(err);
        });
    });
    it('should load an entity', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.loadEntityById(1).then( function(em) {
            q.all( [ em.getTable().getField('id').getValue(), em.getTable().getField('field1').getValue() ]).spread( (id, field1) => {
                assert.strictEqual(id, 1);
                assert.strictEqual(field1, 1);
                done();
            });
        }).catch(function(err) {
            done(err);
        });
    });
    it('should throw on a nonexisting entity', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.loadEntityById(257).then( () => { done(); }).catch(function(e) { done(); }); // done() is NOT a typo; we're catching the error here
    });
    it('should find all entities', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.findAllEntities().then( function(ems) {
            assert.strictEqual(ems.length, 3);
        q.all([ ems[0].getTable().getField('id').getValue(), ems[0].getTable().getField('field1').getValue() ])
            .spread( (id, field1) => { 
                assert.strictEqual(id, 1);
                assert.strictEqual(field1, 1); 
            });
                
                
            done();
        }).catch(function(err) {
            done(err);
        });
    });
    it('should find entities with filters', function(done) {
        var table1 = sql_Table.create('table1');
        var id1 = sql_ValueField.create('id', sql_Field.DataType.int);
        table1.addField(id1);
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const condSet = sql_ConditionSet.create([ sql_Filter.create(id1, sql_Filter.Op.eq, 1) ], null, null, sql_OrderBy.create([ sql_OrderByField.create(id1, sql_OrderBy.Direction.asc) ]));
        const set = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
        set.findEntities(condSet).then( function(ems) {
            assert.strictEqual(ems.length, 1);
            q.all([ ems[0].getTable().getField('id').getValue(), ems[0].getTable().getField('field1').getValue() ])
                .spread( (id, field1) => { 
                    assert.strictEqual(id, 1);
                    assert.strictEqual(field1, 1); 
                    done();
                });
        }).catch(function(err) {
            done(err);
        });
    });
});
