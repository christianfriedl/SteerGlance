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

// server tests
// commented-out, currently is erroneous because of lookupfield test
// require('./server/app/customer/testCustomer.js').runTests();
