function edit(request, response, responseCallback) {
    var Customer = require('../../bo/Customer.js');
    var customer = new Customer(request.query.id);
    var data = { action: 'edit', 
        row: [ 
            { name: customer.getFirstName().name, value: customer.getFirstName().value, label: customer.getFirstName().label },
            { name: customer.getLastName().name, value: customer.getLastName().value, label: customer.getLastName().label },
        ],
    };
    response.text = JSON.stringify(data);
    responseCallback(response);
}

exports.edit = edit;
