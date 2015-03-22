function route(request, callback) {
    var module = null;
    var subModule = null;
    var action = null;
    var err = false;
    var query = undefined;

    if ( request.url === '/' ) {
        module = 'index';
        subModule = 'index';
        action = 'index';
    } else if ( request.url.match(/(\.js|\.css)$/) ) {
        module = 'index';
        subModule = 'index';
        action = 'serveFile';
    } else if ( request.url.match(/^(\/([\w\-_]+)){1,3}(\?([\w\-%_&=]+))?$/) ) {
        var parts = request.url.split('?');
        var queryString = null;
        if (parts.length === 2) {
            queryString = parts.pop();
            var qs = require('querystring');
            query = qs.parse(queryString);
        }
        var path = parts[0].split('/');
        console.log('path', path);
        module = typeof(path[1]) === 'string' ? path[1] : 'index';
        subModule = typeof(path[2]) === 'string' ? path[2] : 'index';
        action = typeof(path[3]) === 'string' ? path[3] : 'index';
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

    callback(err, module, subModule, action, query);
}

exports.route = route;
