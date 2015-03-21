function edit(request, response, responseCallback) {
    var data = { action: 'edit', firstName: 'ersterserv', lastName: 'letzerserv' };
    response.text = JSON.stringify(data);
    responseCallback(response);
}

exports.edit = edit;
