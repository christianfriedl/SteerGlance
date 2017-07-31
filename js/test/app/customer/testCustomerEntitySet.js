
/*
 * Copyright (C) 2015-2017 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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
const app_CustomerEntitySet = require('app/customer/CustomerEntitySet.js');
const sql_DB = require('sql/DB.js');

describe('CustomerEntitySet', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.create(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE customer (id int, name text)', [])
            .then(function() { done(); });
    });
    afterEach(function() {
        db1.close();
    });
    it('should instantiate', function() {
        const customerEntitySet = app_CustomerEntitySet.create(db1);
    });
    it('should load a customer by id', function(done) {
        db1.runSql('INSERT INTO customer (id, name) VALUES(?, ?)', [1, 'aleph']).then(() => { 
            const customerEntitySet1 = app_CustomerEntitySet.create(db1);
            return customerEntitySet1.loadEntityById(1)
                .then( (customer1) => { 
                    assert.ok(customer1 instanceof app_CustomerEntity.CustomerEntity, 'customer should be a customer entity: ' + customer1);
                    customer1.get().then( (obj) => {
                        assert.strictEqual(obj.id, 1, 'id should be 1');
                        assert.strictEqual(obj.name, 'aleph', 'name should be aleph');
                    }).done(); 
                }).then( () => {
                    done();
                }).catch((e) => {
                    console.error('error in chain', e);
                    done(e);
                });
        });
    });
    it('should find all customers', function(done) {
        db1.runSql("INSERT INTO customer (id, name) VALUES(1, 'aleph'),(2,'bejt')").then(() => { 
            const customerEntitySet = app_CustomerEntitySet.create(db1);
            return customerEntitySet.findAllEntities()
                .then( (customers) => { 
                    assert.strictEqual(customers.length, 2);
                    assert.ok(customers[0] instanceof app_CustomerEntity.CustomerEntity, 'customer should be a customer entity: ' + customers[0]);
                    customers[0].get().then( (obj) => {
                        assert.strictEqual(obj.id, 1, 'id should be 1');
                        assert.strictEqual(obj.name, 'aleph', 'name should be aleph');
                    }).done();
                }).then( () => {
                    done();
                }).catch((e) => {
                    console.error('error in chain', e);
                    done(e);
                });
        });
    });
});
