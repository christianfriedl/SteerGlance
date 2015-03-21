function index(request, response) {
    console.log('index');

    var testRouter = require('./testRouter');
    testRouter.testRouter();
}

exports.index = index;
