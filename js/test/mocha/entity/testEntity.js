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
var entity_Entity = require('entity/Entity.js');
const mockEntityModel = require('MockObjects.js').mockEntityModel;

describe('entity_Entity', function() {
    describe('create', function() {
        it('should return an object with auto getters and setters', function() {
            const entity = entity_Entity.create();
            entity.setModel(mockEntityModel);
            assert.strictEqual('ABC', entity.getAbc());
            assert.strictEqual('DEF', entity.getDef());

            entity.setAbc('xyz');
            assert.strictEqual('xyz', entity.getAbc());
            /*
            var table1 = sql_Table.create('table1');
            var field1 = sql_Field.create('field1', field.DataType.int);
            table1.addField(field1);
            var cond = filter.filter: function()
                .field(new field.Field('field1'))
                .op(filter.Op.eq)
                .compareTo('haha');
            var select = sql_Query.select(field1).from(table1);
            // var sqliteQQ = sqlite_Query.create(select);
                */
        });
    });
});
