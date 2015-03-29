function error(request, response, responseCallback) {
    response.returnCode = 500;
    response.text = 'internal server error';
    responseCallback(response);
}

exports.error = error;
