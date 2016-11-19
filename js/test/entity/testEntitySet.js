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

const q = require('q');
const assert = require('assert');
const sql_DB = require('sql/DB.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_Table = require('sql/Table.js');
const sql_ConditionSet = require('sql/ConditionSet.js');
const entity_Entity = require('entity/Entity.js');
const entity_EntitySet = require('entity/EntitySet.js');
const model_EntityModel = require('model/EntityModel.js');
const model_EntitySetModel = require('model/EntitySetModel.js');

describe('entity_Entity', function() {
    let db1 = null;
    beforeEach(function() {
        db1 = sql_DB.create(':memory:').open(':memory:');
    });
    afterEach(function() {
        db1.close();
    });
    it('should load one entity', function(done) {
        db1.runSql('CREATE TABLE table1 (id int)').then( () => {
            return db1.runSql('INSERT INTO table1 (id) VALUES(1)', []);
        }).then( () => {
            const table1 = sql_Table.create('table1');
            const id1 = sql_ValueField.create('id', sql_Field.DataType.int);
            table1.addField(id1);

            const setModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            const entitySet1 = entity_EntitySet.create(setModel1, entity_Entity.create);

            return entitySet1.loadEntityById(1).then( (entity1) => {
                assert.ok(entity1 instanceof entity_Entity.Entity, 'result is an entity');
                return entity1.getId().then( (id1) => {
                    assert.strictEqual(id1, 1, 'resulting id must be 1');
                });
            });
        }).then( () => { 
            done();
        }).catch( (err) => {
            console.error('error in chain', err);
            done(err);
        });
    });
    it('should find one entity', function(done) {
        db1.runSql('CREATE TABLE table1 (id int)').then( () => {
            return db1.runSql('INSERT INTO table1 (id) VALUES(1)', []);
        }).then( () => {
            const table1 = sql_Table.create('table1');
            const id1 = sql_ValueField.create('id', sql_Field.DataType.int);
            table1.addField(id1);

            const setModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            const entitySet1 = entity_EntitySet.create(setModel1, entity_Entity.create);

            return entitySet1.findEntityById(1).then( (entity1) => {
                assert.ok(entity1 instanceof entity_Entity.Entity, 'result is an entity');
                return entity1.getId().then( (id1) => {
                    assert.strictEqual(id1, 1, 'resulting id must be 1');
                });
            });
        }).then( () => { 
            done();
        }).catch( (err) => {
            console.error('error in chain', err);
            done(err);
        });
    });
    it('should find several entities', function(done) {
        db1.runSql('CREATE TABLE table1 (id int)').then( () => {
            return db1.runSql('INSERT INTO table1 (id) VALUES (1),(2),(3)', []);
        }).then( () => {
            const table1 = sql_Table.create('table1');
            const id1 = sql_ValueField.create('id', sql_Field.DataType.int);
            table1.addField(id1);

            const setModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            const entitySet1 = entity_EntitySet.create(setModel1, entity_Entity.create);

            return entitySet1.findEntities(sql_ConditionSet.create()).then( (entities) => {
                assert.strictEqual(entities.length, 3, 'must be 3 entries');
                assert.ok(entities[0] instanceof entity_Entity.Entity, 'result is an entity:' + entities[0]);
                return entities[0].getId().then( (id1) => {
                    assert.strictEqual(id1, 1, 'resulting id must be 1');
                });
            });
        }).then( () => { 
            done();
        }).catch( (err) => {
            console.error('error in chain', err);
            done(err);
        });
    });
});
