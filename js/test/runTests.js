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

var log4js = require('log4js');
log4js.configure({ appenders: [ { type: "console", layout: { type: "basic" } } ], replaceConsole: true })

// framework tests


require('./sql/table.js').runTests();
require('./sql/testField.js').runTests();
require('./sql/sqlite/testQuery.js').runTests();
require('./dao/testDaoFactory.js').runTests();
require('./dao/testDao.js').runTests();
require('./dao/testDaoSet.js').runTests();
require('./bo/testBo.js').runTests();
require('./bo/testBoSet.js').runTests();
require('./dao/testLookups.js').runTests();
// require('./bo/testPrimaryBo.js').runTests(); -- covered via test...customerBo
//
// commented-out, currently is erroneous because of lookupfield test
require('./app/customer/customerBo.js').runTests();
require('./app/invoice/invoiceBo.js').runTests();

// server tests
// commented-out, currently is erroneous because of lookupfield test
// require('./server/app/customer/testCustomer.js').runTests();
