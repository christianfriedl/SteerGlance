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

const assert = require('assert');
const sql_Field = require('sql/Field.js');
const sql_ValueField = require('sql/ValueField.js');
const sql_Table = require('sql/Table.js');
const model_EntityModel = require('model/EntityModel.js');
const model_EntitySetModel = require('model/EntityModel.js');
const test_MockObjects = require('MockObjects.js');

describe('sql_ValueField', function() {
    it('should validate value', function() {
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        field1.setValidation((value, field) => {
            throw new Error('invalid'); //TODO use validationexception
        });
        let ok = true;
        try {
            field1.validate(22);
            console.error('no error, NOT OK');
            ok = false;
        } catch(e) {
            console.log('caught error', e, 'that is ok');
        }
        if (!ok) {
            throw new Error('not ok');
        }
    });
    it('should validate value too', function() {
        var field1 = sql_ValueField.create('field1', sql_Field.DataType.int);
        field1.setValidation((value, field) => {
            //ok, no exception
        });
        field1.validate(22);
    });
});
