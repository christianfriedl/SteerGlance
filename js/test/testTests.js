/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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

/**
 * test the requir'ing of modules etc
 */

var assert = require('assert');
var m_sql_calcField = require('sql/calcField.js');
var m_sql_field = require('sql/field.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_TestSuite = require('TestSuite.js');

var tests = {
    _name: 'testTests',

    testRequire: function() {
        assert.ok('if we get here, we have included some stuff', true);
    },
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
