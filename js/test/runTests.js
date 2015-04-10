var testSqlSqliteQuery = require('./server/sql/sqlite/testQuery.js');
// var testQuery = require('./server/sql/testQuery.js');
var testDao = require('./server/testDao.js');
//

testSqlSqliteQuery.runTests();
testDao.runTests();
