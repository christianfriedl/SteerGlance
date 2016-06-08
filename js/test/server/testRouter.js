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

var assert = require('assert');
var router = require('server/router.js');
var m_TestSuite = require('TestSuite.js');

function shouldBe(shouldErr, shouldModule, shouldSubModule, shouldAction, err, module, subModule, action) {
        assert.strictEqual(shouldErr, err);
        assert.strictEqual(shouldModule, module);
        assert.strictEqual(shouldSubModule, subModule);
        assert.strictEqual(shouldAction, action);
}

var tests = {
    '_name': 'testRouter',
    testRouter: function() {
        router.route({ url: '/'}, function(err, module, subModule, action) {
            shouldBe(false, 'index', 'index', 'index', err, module, subModule, action);
        });
        router.route({ url: '/index/index/index'}, function(err, module, subModule, action) {
            shouldBe(false, 'index', 'index', 'index', err, module, subModule, action);
        });
        router.route({ url: '/foo/bar/baz'}, function(err, module, subModule, action) {
            shouldBe(false, 'foo', 'bar', 'baz', err, module, subModule, action);
        });
        router.route({ url: '/foo/bar'}, function(err, module, subModule, action) {
            shouldBe(false, 'foo', 'bar', 'index', err, module, subModule, action);
        });
        router.route({ url: '/foo'}, function(err, module, subModule, action) {
            shouldBe(false, 'foo', 'index', 'index', err, module, subModule, action);
        });
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
