var fs = require('fs');

function index(request, response, responseCallback) {
    console.log('indexing');
    fs.readFile('html/index.html', function(err, data) {
        if (err) {
            console.log(err);
            throw err;
        } else {
            response.text = data;
        }
        responseCallback(response);
    });
}

function serveFile(request, response, responseCallback) {
    var url = request.url;
    if ( url.match(/\.\./) ) {
        throw 'du uh, dont walk up my tree';
    }

    var contentType = 'text/plain';
    if ( url.match(/\.js/) ) {
        response.contentType = 'application/javascript';
    } else if ( url.match(/\.css/) ) {
        response.contentType = 'text/css';
    } 
    fs.readFile('.' + request.url, function(err, data) {
        if (err) {
            console.log(err);
            throw 'File not found: ' + url;
        } else {
            response.text = data;
            responseCallback(response);
        }
    });

}

exports.index = index;
exports.serveFile = serveFile;
