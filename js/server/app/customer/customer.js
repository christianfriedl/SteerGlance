function edit(request, response, responseCallback) {
    var Customer = require('../../bo/Customer.js');
    var customer = new Customer(request.query.id);
    var data = { action: 'edit', 
        row: [ 
            customer.getField('firstName'),
            customer.getField('lastName'),
        ],
    };
    response.text = JSON.stringify(data);
    responseCallback(response);
}

exports.edit = edit;
