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
var model_EntityModel = require('model/EntityModel.js');
const sql_DB = require('sql/DB.js');
const sql_Table = require('sql/Table.js');
const sql_Field = require('sql/Field.js');

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
        console.log('start insert entity');
        var table1 = sql_Table.create('table1');
        var field1 = sql_Field.create('field1', sql_Field.DataType.int);
        table1.addField(field1);

        const model = model_EntityModel.create(db1, table1);
        model.getTable().getField('field1').setValue(1);
        model.save().then( function() {
            db1.allSql('SELECT * FROM table1', []).then(function(rows) {
                assert.strictEqual(rows.length, 1, 'there is exactly 1 row');
                assert.strictEqual(Number.parseInt(rows[0]['id']), 1, 'id is 1');
                assert.strictEqual(Number.parseInt(rows[0]['field1']), 1, 'field1 is 1');
                console.log('rows', rows);
                done();
            }).catch(function(err) {
                done(err);
            });
        }).catch(function(err) {
            done(err);
        });
    });
    it('should update an entity', function(done) {
        console.log('start update entity');
        db1.runSql('INSERT INTO table1 (id, field1) VALUES(?, ?)', [1, 1]).then(function() { 
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', sql_Field.DataType.int);
            table1.addField(field1);

            const model = model_EntityModel.create(db1, table1);
            model.getTable().getField('id').setValue(1);
            model.getTable().getField('field1').setValue(2);
            model.save().then( function() {
                db1.allSql('SELECT * FROM table1 ORDER BY id', []).then(function(rows) {
                    console.log('rows', rows);
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
    it.skip('should find an entity', function(done) {
        done(new Error('test is not implemented'));
    });
});
