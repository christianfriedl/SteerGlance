"use strict";

const assert = require('assert');

const web_server_router = require('web/server/router.js');

describe('router', function() {
    it('should route / to index/index', function() {
        const desc = web_server_router.route('/');
        assert.strictEqual('index', desc.controllerName);
        assert.strictEqual('index', desc.actionName);
    });
    it('should route .js to index/index/serveFile', function() {
        const desc = web_server_router.route('/a/b/c.js');
        assert.strictEqual('index', desc.controllerName);
        assert.strictEqual('serveFile', desc.actionName);
    });
    it('should route .css to index/index/serveFile', function() {
        const desc = web_server_router.route('/a/b/c.css');
        assert.strictEqual('index', desc.controllerName);
        assert.strictEqual('serveFile', desc.actionName);
    });
    it('should route a/b/c to correct request desc', function() {
        const desc = web_server_router.route('/a/b');
        assert.strictEqual('a', desc.controllerName);
        assert.strictEqual('b', desc.actionName);
    });
    it('should route a/b/c?x=y to correct request desc', function() {
        const desc = web_server_router.route('/a/b?x=y');
        assert.ok(desc.query);
        assert.ok(desc.query.x);
        assert.strictEqual('y', desc.query.x);
    });
});
