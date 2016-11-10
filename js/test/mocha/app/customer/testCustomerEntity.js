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

const _ = require('lodash');
const q = require('q');
const util = require('util');
const assert = require('assert');
const app_CustomerEntity = require('app/customer/CustomerEntity.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_LookupField = require('sql/LookupField.js');
const sql_ZoomField = require('sql/ZoomField.js');
const sql_SumField = require('sql/SumField.js');
const sql_MinField = require('sql/MinField.js');
const sql_MaxField = require('sql/MaxField.js');
const sql_CountField = require('sql/CountField.js');
const model_EntitySetModel = require('model/EntitySetModel.js');

describe('CustomerEntity', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.create(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE customer (id int, name text)', [])
            .then(function() { done(); });
    });
    afterEach(function() {
        db1.close();
    });
    it('should insert a customer', function(done) {
        const customer = app_CustomerEntity.create(db1);
        customer.setName('aleph');
        customer.save().then( () => {
            db1.allSql('SELECT * FROM customer', []).then(function(rows) {
                console.log('rows in cust ins', rows);
                assert.strictEqual(rows.length, 1, 'there is exactly 1 row');
                assert.strictEqual(rows[0]['name'], 'aleph', 'name is aleph');
                done();
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            console.error('err', err);
            done(err);
        });
    });
    it('should update a customer', function(done) {
        db1.runSql('INSERT INTO customer (id, name) VALUES(?, ?)', [1, 'aleph']).then(() => { 
            const customer = app_CustomerEntity.create(db1);
            customer.setId(1);
            customer.setName('beyt');
            customer.save().then( () => {
                db1.allSql('SELECT * FROM customer', []).then(function(rows) {
                    assert.strictEqual(rows.length, 1, 'there is exactly 1 row');
                    assert.strictEqual(Number.parseInt(rows[0]['id']), 1, 'id is 1');
                    assert.strictEqual(rows[0]['name'], 'beyt', 'name is beyt');
                }).then((err) => {
                    done();
                }).catch((err) => {
                    console.error('err', err);
                    done(err);
                });
            }).catch((err) => {
                console.error('err', err);
                done(err);
            });
        });
    });
    it.skip('should find a customer by id', function(itdone) {
        db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]).then( () => {
            let table1, field1, entityModel1, entitySetModel1;
            table1 = sql_Table.create('table1');
            table1.addField(sql_ValueField.create('id', sql_Field.DataType.int));
            field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);
            entityModel1 = model_EntityModel.create(db1, table1);
            entitySetModel1 = model_EntitySetModel.create(db1, table1, model_EntityModel.create);
            return entitySetModel1.findEntityById(1)
                .then( (entity1) => { 
                    const field1 = entity1.getTable().getField('field1');
                    return field1.getValue().then( ( field1val ) => {
                        assert.strictEqual(field1val, 1, 'field1 should be 1');
                    });
                }).then( () => {
                    itdone();
                }).catch((e) => {
                    console.error('error in chain', e);
                    throw new Error(e);
                });
        }).done();
    });
});
