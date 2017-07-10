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
        console.log('createserver called', cb);
        this.cb = cb;
        return {
            listen: function(port) {
            },
        };
    },
    receive: function(req, resp) {
        console.log('receive', req, resp);
        return this.cb(req, resp);
    },
};

const mockHttpResp = {
    done: null,
    writeHead: function() {
        console.log('writeHead', arguments);
    },
    write: function() {
        console.log('write', arguments);
    },
    end: function() {
        console.log('mockHttpResp done');
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
        w_s_Server.deps.http = mockHttp;
        w_s_Server.deps.jsonBody = mockJsonBody;
        server = w_s_Server.create({ web: { server: { port: 8888 } } });
        server.run();
    });

    /*
    afterEach(function() {
    });
    */

    it('should route / to index', function(done) {
        mockHttpResp.done = function(text) {
            console.log('routetest done', text);
            done();
        };
        mockHttp.receive({ method: 'GET', url: '/'}, mockHttpResp);
    });
});
