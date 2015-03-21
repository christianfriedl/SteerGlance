function edit(request, response, responseCallback) {
    var data = { action: 'edit', firstName: 'ersterserv' + request.query.id, lastName: 'letzerserv'  + request.query.id};
    response.text = JSON.stringify(data);
    responseCallback(response);
}

exports.edit = edit;
