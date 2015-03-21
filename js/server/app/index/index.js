var fs = require('fs');

function index(request, response) {
    fs.readFile('html/index.html', function(err, data) {
        if (err) {
            console.log(err);
            throw err;
        }

        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(data);
        response.end();
    });
}

function serveFile(request, response) {
    var url = request.url;
    if ( url.match(/\.\./) ) {
        throw 'du uh, dont walk up my tree';
    }

    var contentType = 'text/plain';
    if ( url.match(/\.js/) ) {
        contentType = 'application/javascript';
    } else if ( url.match(/\.css/) ) {
        contentType = 'text/css';
    } 
    fs.readFile('.' + request.url, function(err, data) {
        if (err) {
            console.log(err);
            response.writeHead(400, {'Message': 'not found'});
            response.write('File not found: ' + url);
        } else {

            response.writeHead(200, {"Content-Type": contentType});
            response.write(data);
        }
        response.end();
    });

}

exports.index = index;
exports.serveFile = serveFile;
