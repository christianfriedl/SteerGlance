"use strict";

const web_server_Server = require('web/server/Server.js');
const configReader = require('configReader.js');

const config = configReader.readConfig();

web_server_Server.create(config).run();
