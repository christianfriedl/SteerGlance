"use strict";

const web_server_Server = require('web/server/Server.js');

const config = { web: { server: { port: 8888 } } };

web_server_Server.create(config).run();
