var assert = require('assert');
var DelegationUtil = require('DelegationUtil.js');

describe('DelegationUtil', function() {
    describe('delegate', function() {
        it('should delegate a function', function() {
            const from = { 
                myval: 'from.myval',
            };
            const to = { 
                myval: 'to.myval',
                myfunc: function() {
                    return this.myval;
                }
            };

            DelegationUtil.delegate(from, to);

            assert.strictEqual('to.myval', from.myfunc(), 'value is from target object');
        });
        it('should delegate a function argument', function() {
            const from = { 
                myval: 'from.myval',
            };
            const to = { 
                myval: 'to.myval',
                myfunc: function(p, q) {
                    return this.myval + p + q;
                }
            };

            DelegationUtil.delegate(from, to);

            assert.strictEqual('to.myval12', from.myfunc(1, 2), 'value is from target object');
        });
        it('should delegate ONLY a function', function() {
            const from = { 
                myval: 'from.myval',
            };
            const to = { 
                myval: 'to.myval',
                myfunc: function() {
                    return this.myval;
                }
            };

            DelegationUtil.delegate(from, to);

            assert.strictEqual('to.myval', from.myfunc(), 'value is from target object');
            assert.strictEqual('from.myval', from.myval, 'value is from source object');
        });
        it('should delegate ONLY a function that does not exist in source object', function() {
            const from = { 
                myval: 'from.myval',
                myfunc1: function() { return this.myval; }
            };
            const to = { 
                myval: 'to.myval',
                myfunc1: function() {
                    return this.myval;
                },
                myfunc2: function() {
                    return this.myval;
                }
            };

            DelegationUtil.delegate(from, to);

            assert.strictEqual('from.myval', from.myfunc1(), 'value is from source object');
            assert.strictEqual('to.myval', from.myfunc2(), 'value is from target object');
        });
    });
});
