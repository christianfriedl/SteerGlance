var customerBo = require('app/customer/customerBo.js');
var assert = require('assert');

function test1() {
    var bo1 = customerBo.customerBo();
}

function runTests() {
    test1();
}

exports.runTests = runTests;
