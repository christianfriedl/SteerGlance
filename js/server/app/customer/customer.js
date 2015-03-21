function edit(request, response, respond) {
    var data = { action: 'edit', firstName: 'ersterserv', lastName: 'letzerserv' };
    response.text = JSON.stringify(data);
    respond(response);
}

exports.edit = edit;
