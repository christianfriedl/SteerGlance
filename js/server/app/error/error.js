function error(request, response, respond) {
    response.returnCode = 500;
    response.text = 'internal server error';
    respond(response);
}

exports.error = error;
