var http = require('http');

function start() {
    var fs = require('fs');
    var db = require('./sql/sqlite/db.js');
    db.open();
    http.createServer(function(request, response) {
        console.log('http request', request.url);
        var router = require('./router.js');
        router.route(request, function(err, moduleName, controllerName, actionName, query) {
            console.log('routed: ' + request.url, 'to', err, moduleName, controllerName, actionName, query);

            if ( err ) {
                throw err;
            }

            var controllerFileName = './app/' + moduleName + '/' + controllerName + '.js';
            console.log(controllerFileName);
            var controller = require(controllerFileName);
            if ( !controller ) {
                throw 'controller file ' + controllerFileName + 'not found';
            }

            var method = controller[actionName];
            
            if ( typeof(method) === 'undefined' ) {
                throw 'method not found';
            }

            var internalRequest = { moduleName: moduleName, controllerName: controllerName, actionName: actionName, request: request, url: request.url, query: query };
            var internalResponse = { returnCode: 200, contentType: 'text/html', text: '', response: response };

            method(internalRequest, internalResponse, responseCallback);

        });
    }).listen(8888);
}

function responseCallback(internalResponse) {
    internalResponse.response.writeHead(internalResponse.returnCode, {"Content-Type": internalResponse.contentType});
    internalResponse.response.write(internalResponse.text);
    internalResponse.response.end();

}

exports.start = start;
