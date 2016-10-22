"use strict";

const assert = require('assert');
const Errors = require('Errors.js');

describe('Errors', function() {
    describe('ParameterError', function() {
        it('should create correct message', function() {
            const obj = { 'a': 'A', 'b': 'B' };
            assert.equal(new Errors.ParameterError(obj, 'obj', 'MyClass').message, 'asfa');

        });
    });
});
