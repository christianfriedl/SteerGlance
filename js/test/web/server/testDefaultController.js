/*
 * Copyright (C) 2015-2017 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of SteerGlance.
 *
 * Mapitor is free software; you can redistribute it and/or modify
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
var async = require('async');
var sql_DB = require('sql/DB.js');
var assert = require('assert');
var util = require('util');
var w_s_c_DefaultController = require('web/server/controller/DefaultController.js');
var sql_ValueField = require('sql/ValueField.js');
var sql_Field = require('sql/Field.js');
var sql_Table = require('sql/Table.js');
var model_EntitySetModel = require('model/EntitySetModel.js');
var model_EntityModel = require('model/EntityModel.js');
var entity_EntitySet = require('entity/EntitySet.js');
var entity_Entity = require('entity/Entity.js');

function setupDb(db1) {
    return db1.runSql('CREATE TABLE customer (id int, name text)', []).then( () => {
        return db1.runSql('INSERT INTO customer (id, name) VALUES(1, \'Christian\')', []);
    }).then( () => {
        return db1.runSql('INSERT INTO customer (id, name) VALUES(2, \'Magdalena\')', []);
    }).then( () => {
        return db1.runSql('INSERT INTO customer (id, name) VALUES(3, \'Eva\')', []);
    });
}

describe('DefaultController', function() {
    let db1, nameField, customerTable, entitySetModel, entitySet, defaultController;
    beforeEach(function(done) {
        db1 = sql_DB.create(':memory:').open(':memory:');
        setupDb(db1).then(() => { done(); });

        nameField = sql_ValueField.create('name', sql_Field.DataType.int); // HHHHMMM
        nameField.setValidation(( value, field ) => {
            if ( !value || value.length === 0 ) {
                throw new Error('name must be set.');
            }
        });
        customerTable = sql_Table.create('customer');
        customerTable.addField(nameField);
        entitySetModel = model_EntitySetModel.create(db1, customerTable, model_EntityModel.create);
        entitySet = entity_EntitySet.create(entitySetModel, entity_Entity.create);
        defaultController = w_s_c_DefaultController.create();
    });

    afterEach(function() {
        db1.close();
    });

    it('should fetch customer edit data', function(done) {
        let request = {
            query: {
                id: 1
            }
        };
        let response = {};
        defaultController.edit(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual('edit', response.action);
            assert.ok(response.row);
            assert.strictEqual(1, _.find(response.row.fields, (field) => { return field.name === 'id'; }).value, 'id field has value in response');
            assert.strictEqual('Christian', _.find(response.row.fields, (field) => { return field.name === 'name'; }).value, 'id field has value in response');

            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });

    it('should not fetch customer edit data for nonexisting customers', function(done) {
        var request = {
            query: {
                id: 1000
            }
        };
        var response = {};
        defaultController.edit(entitySet, request, response).then((response) => {
            console.error('error: should have thrown');
            done('error: should have thrown'); 
        }).catch((e) => {
            console.log('all fine, got error as planned:', e);
            done();
        });
    });

    it('should fetch customer list', function(done) {
        var request = {};
        var response = {};
        defaultController.list(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual('list', response.action);
            assert.ok(response.rows);
            assert.strictEqual(1, _.find(response.rows[0].fields, (field) => { return field.name === 'id'; }).value, 'id field has value in response');
            assert.strictEqual('Christian', _.find(response.rows[0].fields, (field) => { return field.name === 'name'; }).value, 'id field has value in response');

            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });

    it('should save a field from an existing entity', function(done) {
        var request = { body: { id: 1, field: { name: 'name', value: 'Bettina' } } };
        var response = {};
        defaultController.saveField(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual(1, _.find(response.row.fields, (field) => { return field.name === 'id'; }).value, 'id field has value in response');
            assert.strictEqual('Bettina', _.find(response.row.fields, (field) => { return field.name === 'name'; }).value, 'id field has value in response');
            assert.strictEqual(response.performedAction, 'updated');

            entitySet.loadEntityById(1).then( (entity) => {
                entity.getValuesAsObject((obj) => {
                    assert.strictEqual(obj.id, 1);
                    assert.strictEqual(obj.name, 'Bettina');
                });
            }).then(() => { done(); });
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });
    it('should save a field and create a new entity', (done) => {
        var request = { body: { fieldName: 'name', row: [ { name: 'name', value: 'Bettina' } ] } };
        var response = {};
        defaultController.saveField(entitySet, request, response).then((response) => {
            assert.strictEqual(4, _.find(response.row.fields, (field) => { return field.name === 'id'; }).value, 'id field has value in response');
            assert.strictEqual('Bettina', _.find(response.row.fields, (field) => { return field.name === 'name'; }).value, 'id field has value in response');
            assert.strictEqual(response.performedAction, 'inserted');

            entitySet.loadEntityById(4).then( (entity) => {
                return entity.getValuesAsObject((obj) => {
                    assert.strictEqual(obj.id, 4);
                    assert.strictEqual(obj.name, 'Bettina');
                });
            }).then(() => { done(); });
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });
    it('should not save a field but return a message', (done) => {
        var request = { body: { id: 1, field: { name: 'name', value: '' } } }; // 'name cannot be empty' or sth
        var response = {};
        defaultController.saveField(entitySet, request, response).then((response) => {
            assert.strictEqual(response.performedAction, null, 'there should be no action, we did not save it');
            assert.strictEqual(response.errors.length, 1);
            console.log('response', response);

            done();
        }).catch((e) => {
            console.log('error caught -- not good, should be a message in the response', e);
            done(e);
        });
    });
    it('should fetch a list', function(done) {
        var request = {};
        var response = {};
        defaultController.list(entitySet, request, response).then( (response) => {
            assert.ok(_.find(response.rows[0].fields, (field) => { return field.name === 'id'; }), 'id field should exist in response');
            assert.strictEqual(1, _.find(response.rows[0].fields, (field) => { return field.name === 'id'; }).value, 'id field has value response');

            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('shold fetch a list with limit', function(done) {
        var request = { body: { conditions: { limit: 2 } } };
        var response = {};
        defaultController.list(entitySet, request, response).then( (response) => {
            assert.strictEqual(2, response.rows.length, 'should be 2 rows');

            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('should fetch a list with orderby', function(done) {
        const request = { body: { conditions: { orderBy: [ { field: 'name' } ] } } };
        const response = {};
        defaultController.list(entitySet, request, response).then( (response) => {
            console.log('response is', response);
            assert.strictEqual(3, response.rows.length, 'should be 3 rows');
            assert.strictEqual(3, _.find(response.rows[1].fields, (field) => { return field.name === 'id'; }).value, 'id field has correct value ');
            assert.strictEqual('Eva', _.find(response.rows[1].fields, (field) => { return field.name === 'name'; }).value, 'id field has correct value ');

            done();
        }).catch((e) => {
            done(e);
        });
    });
    it('should fetch a list with filter', function(done) {
        var request = { body: { conditions: { filters: [ { fieldName: 'name', opName: 'eq', value: 'Eva' } ] } } };
        var response = {};
        defaultController.list(entitySet, request, response).then( (response) => {
            console.log('response is', response);
            assert.strictEqual(1, response.rows.length, 'should be 1 row');
            assert.strictEqual(3, _.find(response.rows[0].fields, (field) => { return field.name === 'id'; }).value, 'id field has correct value ');
            assert.strictEqual('Eva', _.find(response.rows[0].fields, (field) => { return field.name === 'name'; }).value, 'id field has correct value ');

            done();
        }).catch((e) => {
            done(e);
        });
    });
});
