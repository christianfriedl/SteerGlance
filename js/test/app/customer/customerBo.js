var customerBo = require('app/customer/customerBo.js');
var db = require('sql/db.js');
var assert = require('assert');

var Tests = {
    test1: function() {
        var db1 = db.db(':memory:').open(':memory:');
        console.log('test1 db', db1);
        var bo1 = customerBo.customerBo(db1);
        bo1.id(1);
        bo1.firstName('Christian');
        bo1.lastName('Friedl');
        bo1.save();
        var bo2 = customerBo.customerBo(db1);
        bo2.loadById(1, function(err) {
            if ( err ) throw err;
            console.log(bo2);
            assert.strictEqual('Christian', bo2.firstName());
            assert.strictEqual('Friedl', bo2.lastName());
        });


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
