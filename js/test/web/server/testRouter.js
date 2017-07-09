"use strict";

const assert = require('assert');

const web_server_router = require('web/server/router.js');

describe('router', function() {
    it('should route / to index/index', function() {
        const desc = web_server_router.route('/');
        assert.strictEqual('index', desc.module);
        assert.strictEqual('index', desc.subModule);
        assert.strictEqual('index', desc.action);
    });
    it('should route .js to index/index/serveFile', function() {
        const desc = web_server_router.route('/a/b/c.js');
        assert.strictEqual('index', desc.module);
        assert.strictEqual('index', desc.subModule);
        assert.strictEqual('serveFile', desc.action);
    });
    it('should route .css to index/index/serveFile', function() {
        const desc = web_server_router.route('/a/b/c.css');
        assert.strictEqual('index', desc.module);
        assert.strictEqual('index', desc.subModule);
        assert.strictEqual('serveFile', desc.action);
    });
    it('should route a/b/c to correct request desc', function() {
        const desc = web_server_router.route('/a/b/c');
        assert.strictEqual('a', desc.module);
        assert.strictEqual('b', desc.subModule);
        assert.strictEqual('c', desc.action);
    });
    it('should route a/b/c?x=y to correct request desc', function() {
        const desc = web_server_router.route('/a/b/c?x=y');
        assert.ok(desc.query);
        assert.ok(desc.query.x);
        assert.strictEqual('y', desc.query.x);
    });
});
