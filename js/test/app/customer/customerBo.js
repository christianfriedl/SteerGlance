var customerBo = require('app/customer/customerBo.js');
var assert = require('assert');

var Tests = {
    test1: function() {
        var bo1 = customerBo.customerBo();
        bo1.firstName('Christian');
        bo1.lastName('Friedl');
        bo1.save();
    }
};

function runTests() {
    console.log('>', module.filename);
    var f = null;
    for (f in Tests) {
        if ( typeof(Tests[f]) === 'function' && f.substr(0,4) === 'test' ) {
            console.log('>>>', f);
            Tests[f]();
            console.log('<<<', f);
        }
    }
    console.log('<', module.filename);
}

exports.runTests = runTests;
