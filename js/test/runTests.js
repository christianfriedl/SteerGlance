var log4js = require('log4js');
log4js.configure({ appenders: [ { type: "console", layout: { type: "basic" } } ], replaceConsole: true })

// framework tests

require('./sql/table.js').runTests();
require('./sql/testField.js').runTests();
require('./sql/sqlite/testQuery.js').runTests();
require('./dao/testDao.js').runTests();
require('./dao/testDaoSet.js').runTests();
require('./dao/testLookups.js').runTests();
require('./bo/testBo.js').runTests();
require('./bo/testBoSet.js').runTests();
// require('./bo/testPrimaryBo.js').runTests(); -- covered via test...customerBo
require('./app/customer/customerBo.js').runTests();

// server tests
require('./server/app/customer/testCustomer.js').runTests();
