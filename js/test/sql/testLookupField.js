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

const _ = require('lodash');
const sql_DB = require('sql/DB.js');
const assert = require('assert');
const util = require('util');
const server_DefaultController = require('server/DefaultController.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_LookupField = require('sql/LookupField.js');
const sql_Field = require('sql/Field.js');
const sql_Table = require('sql/Table.js');
const model_EntitySetModel = require('model/EntitySetModel.js');
const model_EntityModel = require('model/EntityModel.js');
const entity_EntitySet = require('entity/EntitySet.js');
const entity_Entity = require('entity/Entity.js');

function setupDb(db1) {
    return db1.runSql('CREATE TABLE customer (id int, name text)', []).then( () => {
        return db1.runSql('INSERT INTO customer (id, name) VALUES(1, \'Christian\')', []);
    }).then( () => {
        return db1.runSql('INSERT INTO customer (id, name) VALUES(2, \'Magdalena\')', []);
    }).then( () => {
        return db1.runSql('CREATE TABLE invoice (id, customerId)', []);
    }).then( () => {
        return db1.runSql('INSERT INTO invoice (id, customerId) VALUES(1, 2)', []);
    });
}

describe('sql_LookupField', function() {
    let db1, nameField, customerTable, customerEntitySetModel, customerEntitySet, customerIdField, customerField, invoiceTable, invoiceEntitySetModel, invoiceEntitySet;
    beforeEach(function(done) {
        db1 = sql_DB.create(':memory:').open(':memory:');
        setupDb(db1).then(() => { done(); });

        nameField = sql_ValueField.create('name', sql_Field.DataType.int); // HHHHMMM int!!!
        customerTable = sql_Table.create('customer');
        customerTable.addField(nameField);
        customerEntitySetModel = model_EntitySetModel.create(db1, customerTable, model_EntityModel.create);
        customerEntitySet = entity_EntitySet.create(customerEntitySetModel, entity_Entity.create);

        customerIdField = sql_ValueField.create('customerId', sql_Field.DataType.int);
        customerField = sql_LookupField.create('customer', customerIdField, customerEntitySet, 'Customer');
        invoiceTable = sql_Table.create('invoice');
        invoiceTable.addField(customerIdField);
        invoiceTable.addField(customerField);
        invoiceEntitySetModel = model_EntitySetModel.create(db1, invoiceTable, model_EntityModel.create);
        invoiceEntitySet = entity_EntitySet.create(invoiceEntitySetModel, entity_Entity.create);
    });

    afterEach(function() {
        db1.close();
    });

    it('should fetch correct customer data', function(done) {
        invoiceEntitySet.loadEntityById(1).then((invoice) => {
            invoice.getCustomer().then((customer) => {
                assert.ok(customer);
                customer.getValuesAsObject().then((obj) => {
                    assert.strictEqual(2, obj.id);
                    assert.strictEqual('Magdalena', obj.name);
                    done(); 
                }).catch((e) => {
                    console.error('error in chain', e);
                    done(e);
                });
            });
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });
});
