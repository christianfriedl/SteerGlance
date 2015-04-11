var customerBo = require('app/customer/customerBo.js');
var assert = require('assert');

function test1() {
    var bo1 = customerBo.customerBo();
    bo1.firstName('Christian');
    bo1.lastName('Friedl');
    bo1.save();
}

function runTests() {
    test1();
}

exports.runTests = runTests;
