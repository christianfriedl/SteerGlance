/*
 * Copyright (C) 2015 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
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

var _ = require('underscore');
var util = require('util');
var log4js = require('log4js');
log4js.configure({ appenders: [ { type: "console", layout: { type: "basic" } } ], replaceConsole: true })

// framework tests

var testScripts = {
    'server/testRouter.js': { 'enabled': false },
    'sql/table.js': { 'enabled': false },
    'sql/testField.js': { 'enabled': false },
    'sql/sqlite/testQuery.js': { 'enabled': false },
    'dao/testDao.js': { 'enabled': false },
    'dao/testDaoSet.js': { 'enabled': false },
    'bo/testBo.js': { 'enabled': true },
    'bo/testBoSet.js': { 'enabled': false },
    'dao/testLookups.js': { 'enabled': false },
//     'bo/testPrimaryBo.js': { 'enabled': false }, -- covered via test...customerBo
//
// commented-out: { 'enabled': false }, currently is erroneous because of lookupfield test
    'app/customer/customerBo.js': { 'enabled': false },
    'app/invoice/invoiceBo.js': { 'enabled': false },

// server tests
// commented-out: { 'enabled': false }, currently is erroneous because of lookupfield test
//     'server/app/customer/testCustomer.js': { 'enabled': false },
};

_(_(testScripts).keys()).each(function(scriptName) {
    var module = require('./' + scriptName);
    var options = testScripts[scriptName];
    if ( options.enabled === true ) {
        module.runTests();
    } else if ( _.isArray(options.enabled) ) {
        module.runTests(options.enabled);
    } 
});
