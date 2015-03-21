var assert = require('assert');
var router = require('../../server/router.js');

function shouldBe(shouldErr, shouldModule, shouldSubModule, shouldAction, err, module, subModule, action) {
        assert.strictEqual(shouldErr, err);
        assert.strictEqual(shouldModule, module);
        assert.strictEqual(shouldSubModule, subModule);
        assert.strictEqual(shouldAction, action);
}

function testRouter() {
    router.route({ url: '/'}, function(err, module, subModule, action) {
        shouldBe(false, 'index', 'index', 'index', err, module, subModule, action);
    });
    router.route({ url: '/index/index/index'}, function(err, module, subModule, action) {
        shouldBe(false, 'index', 'index', 'index', err, module, subModule, action);
    });
    router.route({ url: '/foo/bar/baz'}, function(err, module, subModule, action) {
        shouldBe(false, 'foo', 'bar', 'baz', err, module, subModule, action);
    });
    router.route({ url: '/foo/bar'}, function(err, module, subModule, action) {
        shouldBe(false, 'foo', 'bar', 'index', err, module, subModule, action);
    });
    router.route({ url: '/foo'}, function(err, module, subModule, action) {
        shouldBe(false, 'foo', 'index', 'index', err, module, subModule, action);
    });
}

testRouter();
