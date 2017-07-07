/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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
var server_DefaultController = require('server/DefaultController.js');
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
    });
}

describe('DefaultController', function() {
    let db1, nameField, customerTable, entitySetModel, entitySet;
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
    });

    afterEach(function() {
        db1.close();
    });

    it.skip('should fetch customer edit data', function(done) {
        var request = {
            query: {
                id: 1
            }
        };
        var response = {};
        server_DefaultController.edit(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual('edit', response.action);
            assert.ok(response.row);
            assert.strictEqual(1, response.row.id);
            assert.strictEqual('Christian', response.row.name);

            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });

    it.skip('should not fetch customer edit data for nonexisting customers', function(done) {
        var request = {
            query: {
                id: 1000
            }
        };
        var response = {};
        server_DefaultController.edit(entitySet, request, response).then((response) => {
            console.error('error: should have thrown');
            done('error: should have thrown'); 
        }).catch((e) => {
            console.log('all fine, got error as planned:', e);
            done();
        });
    });

    it.skip('should fetch customer list', function(done) {
        var request = {};
        var response = {};
        server_DefaultController.list(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual('list', response.action);
            assert.ok(response.rows);
            assert.strictEqual(1, response.rows[0].id);
            assert.strictEqual('Christian', response.rows[0].name);

            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });

    it.skip('should save a field from an existing entity', function(done) {
        var request = { body: { id: 1, field: { name: 'name', value: 'Bettina' } } };
        var response = {};
        server_DefaultController.saveField(entitySet, request, response).then((response) => {
            console.log('response', response);
            assert.strictEqual( response.row.id, 1);
            assert.strictEqual(response.row.name, 'Bettina');
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
    it.skip('should save a field and create a new entity', (done) => {
        var request = { body: { fieldName: 'name', row: [ { name: 'name', value: 'Bettina' } ] } };
        var response = {};
        server_DefaultController.saveField(entitySet, request, response).then((response) => {
            assert.strictEqual(2, response.row.id);
            assert.strictEqual('Bettina', response.row.name);
            assert.strictEqual(response.performedAction, 'inserted');

            entitySet.loadEntityById(2).then( (entity) => {
                return entity.getValuesAsObject((obj) => {
                    assert.strictEqual(obj.id, 2);
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
        server_DefaultController.saveField(entitySet, request, response).then((response) => {
            assert.strictEqual(response.row.id, 1);
            assert.strictEqual(response.performedAction, null, 'there should be no action, we did not save it');
            assert.strictEqual(response.messages.length, 1);

            done(new Error('exception was not thrown'));
        }).catch((e) => {
            console.log('error caught -- all is good', e);
            done();
        });
    });
    it.skip('should fetch invoice list', function() {
        var db1 = sql_DB.create(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = {};
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return server_DefaultController.list(boSet, request, response, function(response) {
                        assert.strictEqual(20, response.data.count);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                        assert.strictEqual(1, response.data.rows[0].fields[0].value);
                    });

                }
        ]);
    });
    it.skip('shold fetch invoice list with limit', function() {
        var db1 = sql_DB.create(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 9 } } };
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return server_DefaultController.list(boSet, request, response, function(response) {
                        assert.strictEqual(3, response.data.rows.length);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                    });

                }
        ]);
    });
    it.skip('should fetch invoice list with imits and orderby', function() {
        var db1 = sql_DB.create(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 9, count: 2, orderBy: [ { field: 'id' } ] } } };
        var response = {};
        async.series([
                function(callback) { setupDb(db1, callback); },
                function(callback) {
                    return server_DefaultController.list(boSet, request, response, function(response) {
                        console.log('"responsecallback" received response', response, 'with rows', util.inspect(response.data.rows, { depth: 3} ));
                        assert.strictEqual(3, response.data.rows.length);
                        assert.strictEqual('id', response.data.rows[0].fields[0].name);
                        assert.strictEqual(10, response.data.rows[0].fields[0].value);
                        assert.strictEqual(100, response.data.rows[0].fields[1].value);
                        assert.strictEqual(1, response.data.rows[0].fields[2].value);

                        assert.strictEqual('id', response.data.rows[1].fields[0].name);
                        assert.strictEqual(11, response.data.rows[1].fields[0].value);
                        assert.strictEqual(110, response.data.rows[1].fields[1].value);
                        assert.strictEqual(2, response.data.rows[1].fields[2].value);

                        assert.strictEqual('id', response.data.rows[2].fields[0].name);
                        assert.strictEqual(12, response.data.rows[2].fields[0].value);
                        assert.strictEqual(120, response.data.rows[2].fields[1].value);
                        assert.strictEqual(2, response.data.rows[2].fields[2].value);

                        console.log('"responsecallback" with templateRow', util.inspect(response.data.templateRow, { depth: 3} ));
                        console.log('"responsecallback" with aggregateRow', util.inspect(response.data.aggregateRow, { depth: 3} ));
                    });

                }
        ]);

    });
    it.skip('should fetch invoice list with filter', function() {
        var db1 = sql_DB.create(':memory:').open(':memory:');
        var daoSet = m_dao_daoSet.daoSet(db1, m_app_invoice_invoiceDao.invoiceDao);
        var boSet = m_bo_boSet.boSet(db1, daoSet, m_app_invoice_invoiceBo.invoiceBo);
        var request = { body: { conditions: { limit: 3, offset: 0, orderBy: [ { field: 'id' } ], filters: [ { fieldName: 'customerId', opName: 'eq', value: '2' } ] } } };
        var response = {};
        async.series([
            function(callback) { setupDb(db1, callback); },
            function(callback) {
                return server_DefaultController.list(boSet, request, response, function(response) {
                    console.log('"responsecallback" in testFetchInvoiceListWithFilter received response', response, 'with rows', util.inspect(response.data.rows, { depth: 10} ));
                    assert.strictEqual(response.data.rows.length, 3);
                    var f = _(response.data.rows[0].fields).find(function(f) { return f.name === 'customerId' });
                    assert.strictEqual(2, f.value);
                });
            }
        ]);
    });
});
