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
var q = require('q');
const sql_LookupField = require('sql/LookupField.js');
const MO = require('MockObjects.js');

describe('model_EntitySetModel', function() {
    it.skip('should return the entity', function(done) {
        throw 'not implemented';
        const lf = sql_LookupField.create('lookup', MO.mockEntitySetModel);
    });
});
