function edit(request, response, responseCallback) {
    var CustomerBo = require('../../bo/CustomerBo.js');
    CustomerBo.loadById(request.query.id, function(err, customer) {
        var data = { action: 'edit', 
            row: [ 
                customer.getField('firstName'),
                customer.getField('lastName'),
            ],
        };
        response.text = JSON.stringify(data);
        responseCallback(response);
    });
}

exports.edit = edit;
