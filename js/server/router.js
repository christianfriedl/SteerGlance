function route(request, callback) {
    var module = null;
    var subModule = null;
    var action = null;
    var err = false;
    var matches = null;

    if ( request.url === '/' ) {
        module = 'index';
        subModule = 'index';
        action = 'index';
    } else if ( request.url.match(/\.js$/) ) {
        module = 'index';
        subModule = 'index';
        action = 'serveFile';
    } else if ( matches = request.url.match(/^(\/([\w\-_]+)){1,3}$/) ) {
        console.log('matches', matches);
        matches = request.url.split('/');
        module = typeof(matches[1]) === 'string' ? matches[1] : 'index';
        subModule = typeof(matches[2]) === 'string' ? matches[2] : 'index';
        action = typeof(matches[3]) === 'string' ? matches[3] : 'index';
    } else if ( request.url.match(/\.ico$/) ) {
        console.log('will not route ' + request.url, 'no error');
        module = 'error';
        subModule = 'error';
        action = 'error';
    } else {
        err = 'unable to route: \'' + request.url + '\'';
        module = 'error';
        subModule = 'error';
        action = 'error';
    }

    callback(err, module, subModule, action);
}

exports.route = route;
