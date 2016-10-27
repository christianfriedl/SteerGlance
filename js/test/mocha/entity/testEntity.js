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

const assert = require('assert');
const entity_Entity = require('entity/Entity.js');
const sql_DB = require('sql/DB.js');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_Table = require('sql/Table.js');
const model_EntityModel = require('model/EntityModel.js');
const mockEntityModel = require('MockObjects.js').mockEntityModel;

describe('entity_Entity', function() {
    var db1;
    beforeEach(function(done) {
        db1 = sql_DB.db(':memory:').open(':memory:');
        db1.runSql('CREATE TABLE table1 (id int, field1 int)', [])
            .then(function() { done(); });
    });
    afterEach(function() {
        db1.close();
    });
    describe('create', function() {
        it('should return an entity with auto getters and setters', function() {
            const entity = entity_Entity.create();
            entity.setModel(mockEntityModel);
            assert.strictEqual('ABC', entity.getAbc());
            assert.strictEqual('DEF', entity.getDef());

            entity.setAbc('xyz');
            assert.strictEqual('xyz', entity.getAbc());
        });
        it('should create an entity from a entity model', function() {
            var table1 = sql_Table.create('table1');
            var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
            table1.addField(field1);

            const em1 = model_EntityModel.create(db1, table1);

            const entity1 = entity_Entity.create(em1);

            entity1.setId(1);
            entity1.setField1(1);
            entity1.save().then( function() {
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
    });
});
