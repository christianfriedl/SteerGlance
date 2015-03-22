function edit(request, response, responseCallback) {
    var data = { action: 'edit', 
        row: [ 
            { name: 'firstName', value: 'ersterserv' + request.query.id, label: 'First Name' },
            { name: 'lastName', value: 'letzterserv' + request.query.id, label: 'Last Name' },
        ],
    };
    response.text = JSON.stringify(data);
    responseCallback(response);
}

exports.edit = edit;
