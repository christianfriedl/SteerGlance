function error(request, response) {
    response.writeHead(500);
    response.write('internal server error');
}

exports.error = error;
