/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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

var allTestScripts = {
    'testTests.js': { 'enabled': true },
    'testUtil.js': { 'enabled': true },
    'server/testRouter.js': { 'enabled': true },
    'sql/table.js': { 'enabled': true },
    'sql/testField.js': { 'enabled': true },
    'sql/testCalcField.js': { 'enabled': true },
    'sql/sqlite/testQuery.js': { 'enabled': true },
    'sql/testOrderBy.js': { 'enabled' : true },
    'sql/testLookupField.js': { 'enabled' : true },
    'dao/testDao.js': { 'enabled': true },
    'dao/testDaoSet.js': { 'enabled': true },
    'bo/testBo.js': { 'enabled': true },
    'bo/testBoSet.js': { 'enabled': true },
    'bo/testPrimaryBo.js': { 'enabled': true }, 
    'app/customer/customerBo.js': { 'enabled': true },
    'sql/testLazyFieldLinkManager.js': { 'enabled': true },
    'app/invoice/invoiceBo.js': { 'enabled': false },// TODO there are async-errors in the tests there...!
    'app/actAsClient.js': { 'enabled': true },
};

var focusedTestScripts = {
    'app/actAsClient.js': { 'enabled': ['testFetchInvoiceList'] },
    // 'app/actAsClient.js': { 'enabled': ['testFetchCustomerList'] },
};

var testScripts = allTestScripts;
// var testScripts = focusedTestScripts;

_(_(testScripts).keys()).each(function(scriptName) {
    var module = require('./' + scriptName);
    var options = testScripts[scriptName];
    if ( options.enabled === true ) {
        module.runTests();
    } else if ( _.isArray(options.enabled) ) {
        module.runTests(options.enabled);
    } 
});
