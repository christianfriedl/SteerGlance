function edit(request, response) {
        var data = { action: 'edit', firstName: 'ersterserv', lastName: 'letzerserv' };
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(JSON.stringify(data));
        response.end();
}

exports.edit = edit;
