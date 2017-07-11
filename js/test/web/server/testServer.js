/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of SteerGlance.
 *
 * Mapitor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const _ = require('lodash');
const async = require('async');
const sql_DB = require('sql/DB.js');
const assert = require('assert');
const util = require('util');
const w_s_Server = require('web/server/Server.js');

const mockHttp = {
    createServer: function(cb) {
        this.cb = cb;
        return {
            listen: function(port) {
            },
        };
    },
    receive: function(req, resp) {
        return this.cb(req, resp);
    },
};

const mockHttpResp = {
    body: '',
    done: null,
    writeHead: function() {
        this.head = Array.prototype.slice.call(arguments);
    },
    write: function(text) {
        this.body += text;
    },
    end: function() {
        this.done();
    },
};

//deps.jsonBody(request, response, (err, body) => {
const mockJsonBody = (req, resp, cb) => {
    cb(false, req);
};



describe('webserver', function() {
    let server;
    beforeEach(function() {
        mockHttpResp.body = '';
        mockHttpResp.done = null;
        w_s_Server.deps.http = mockHttp;
        w_s_Server.deps.jsonBody = mockJsonBody;
        const config = require('configReader.js').readConfig();
        console.log(require('util').inspect(config, { depth: null }));
        server = w_s_Server.create(config);
        server.run();
    });

    it('should resolve / to index.html', function(done) {
        mockHttpResp.done = function() {
            assert.strictEqual(200, mockHttpResp.head[0]);
            assert.ok(mockHttpResp.body.match(/html/));
            done();
        };
        mockHttp.receive({ method: 'GET', url: '/'}, mockHttpResp);
    });
    it('should route /css/site.css to correct file', function(done) {
        mockHttpResp.done = function() {
            assert.strictEqual(200, mockHttpResp.head[0]);
            assert.ok(mockHttpResp.body.match(/\..+\{/));
            done();
        };
        mockHttp.receive({ method: 'GET', url: '/css/site.css'}, mockHttpResp);
    });
    it('should route nonexistent /abla/oida to error page', function(done) {
        mockHttpResp.done = function() {
            assert.strictEqual(400, mockHttpResp.head[0]);
            assert.strictEqual('An error occurred: dir for controller file AblaController.js not found', mockHttpResp.body);
            done();
        };
        mockHttp.receive({ method: 'GET', url: '/abla/oida'}, mockHttpResp);
    });
});
