var log4js = require('log4js');
log4js.configure({ appenders: [ { type: "console", layout: { type: "basic" } } ], replaceConsole: true })

global.DEBUG = true;

// framework tests

// require('./sql/testField.js').runTests();
// require('./sql/sqlite/testQuery.js').runTests();
// // require('./server/sql/testQuery.js').runTests(); // this one is currently not active, it's all in sqlite/testquery
// require('./dao/testDao.js').runTests();
// require('./bo/testBo.js').runTests();
require('./app/customer/customerBo.js').runTests();

// server tests
// require('./server/app/customer/testCustomer.js').runTests();
