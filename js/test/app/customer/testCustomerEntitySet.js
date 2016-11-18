
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
const app_CustomerEntitySet = require('app/customer/CustomerEntitySet.js');
const sql_DB = require('sql/DB.js');

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
    it('should load a customer by id', function(done) {
        db1.runSql('INSERT INTO customer (id, name) VALUES(?, ?)', [1, 'aleph']).then(() => { 
            console.log('s1');
            const customerEntitySet = app_CustomerEntitySet.create(db1);
            console.log('sx', customerEntitySet);
            return customerEntitySet.loadEntityById(1)
                .then( (customer1) => { 
            console.log('s2');
                    customer1.get().then( (obj) => {
                        assert.strictEqual(obj.id, 1, 'id should be 1');
                        assert.strictEqual(obj.name, 'aleph', 'name should be aleph');
                        done();
                    }).done();
                }).then( () => {
            console.log('s3');
                    done();
                }).catch((e) => {
                    console.error('error in chain', e);
                    done(e);
                });
        });
    });
    it.skip('should find all customers', function(done) {
        db1.runSql('INSERT INTO customer (id, name) VALUES(?, ?)', [1, 'aleph']).then(() => { 
            const customerEntitySet = app_CustomerEntitySet.create(db1);
            return customerEntitySet.findEntityById(1)
                .then( (customer1) => { 
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
});
