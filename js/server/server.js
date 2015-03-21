var http = require('http');

function start() {
    var fs = require('fs');
    http.createServer(function(request, response) {
        var router = require('./router.js');
        router.route(request, function(err, moduleName, controllerName, actionName) {
            console.log('routed: ' + request.url, 'to', err, moduleName, controllerName, actionName);

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

            method(request, response);

        });
        return;

        var Customer = require('./bo/Customer.js');
        var customer = new Customer.Customer();
        console.log(request.url);
        if ( request.url.match(/\.html$/) ) {
            fs.readFile('.' + request.url, function(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }

                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(data);
                response.end();
            });
        } else if ( request.url.match(/\.js$/) ) {
            fs.readFile('.' + request.url, function(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }

                response.writeHead(200, {"Content-Type": "application/javascript"});
                response.write(data);
                response.end();
            });
        } else {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(JSON.stringify({firstName: customer.getFirstName(), 'lastName': customer.getLastName()}));
            response.end();
        }
    }).listen(8888);
}

exports.start = start;
