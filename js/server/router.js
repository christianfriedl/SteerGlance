function route(request, callback) {
    var module = null;
    var subModule = null;
    var action = null;
    var err = false;

    if ( request.url === '/' ) {
        module = 'index';
        subModule = 'index';
        action = 'index';
    } else if ( request.url.match(new RegExp('\.js$')) ) {
        module = 'index';
        subModule = 'index';
        action = 'serveFile';
    } else {
        module = 'error';
        subModule = 'error';
        action = 'error';
    }

    callback(err, module, subModule, action);
}

exports.route = route;
