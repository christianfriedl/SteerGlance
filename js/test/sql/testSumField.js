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
const sql_ValueField = require('sql/ValueField.js');
const sql_LookupField = require('sql/LookupField.js');
const sql_Field = require('sql/Field.js');
const sql_SumField = require('sql/SumField.js');
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
        return db1.runSql('CREATE TABLE invoice (id, customerId, amount)', []);
    }).then( () => {
        return db1.runSql('INSERT INTO invoice (id, customerId, amount) VALUES(1, 2, 10)', []);
    }).then( () => {
        return db1.runSql('INSERT INTO invoice (id, customerId, amount) VALUES(2, 2, 20)', []);
    });
}

describe('sql_SumField', function() {
    let db1, nameField, customerTable, customerEntitySetModel, customerEntitySet, customerIdField, invoiceCustomerIdField, customerField, invoiceTable, invoiceEntitySetModel, invoiceEntitySet, amountField, invoiceAmountField;
    beforeEach(function(done) {
        db1 = sql_DB.create(':memory:').open(':memory:');
        setupDb(db1).then(() => { done(); });

        customerTable = sql_Table.create('customer');
        nameField = sql_ValueField.create('name', sql_Field.DataType.int); // HHHHMMM int!!!
        customerTable.addField(nameField);
        customerEntitySetModel = model_EntitySetModel.create(db1, customerTable, model_EntityModel.create);
        customerEntitySet = entity_EntitySet.create(customerEntitySetModel, entity_Entity.create);

        invoiceCustomerIdField = sql_ValueField.create('customerId', sql_Field.DataType.int);
        amountField = sql_ValueField.create('amount', sql_Field.DataType.int);
        invoiceTable = sql_Table.create('invoice');
        invoiceTable.addField(invoiceCustomerIdField);
        invoiceTable.addField(amountField);
        invoiceEntitySetModel = model_EntitySetModel.create(db1, invoiceTable, model_EntityModel.create);
        invoiceEntitySet = entity_EntitySet.create(invoiceEntitySetModel, entity_Entity.create);

        invoiceAmountField = sql_SumField.create('invoiceAmount', customerEntitySet.createEntity().getField('id'), invoiceEntitySetModel, invoiceCustomerIdField, amountField, 'Invoice Amount');
        customerTable.addField(invoiceAmountField);
    });

    afterEach(function() {
        db1.close();
    });

    it('should fetch amount sum if there are detail records', function(done) {
        customerEntitySet.loadEntityById(2).then((customer) => {
            return customer.getInvoiceAmount();
        })
        .then((amount) => {
            assert.strictEqual(30, amount, 'amount should be correct');
            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });

    it('should fetch null amount sum if there are no detail records', function(done) {
        // TODO do we really want NULL, not ZERO?
        customerEntitySet.loadEntityById(1).then((customer) => {
            return customer.getInvoiceAmount();
        })
        .then((amount) => {
            assert.strictEqual(null, amount, 'amount should be null: ' + amount);
            done(); 
        }).catch((e) => {
            console.error('error in chain', e);
            done(e);
        });
    });
});
