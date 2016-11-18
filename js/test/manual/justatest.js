"use strict";

const async = require('async');
const q = require('q');

q.all([ 5, () => { const dfd = q.defer(); dfd.resolve(8); return dfd.promise; }() ]).spread( (i, j) => { console.log(i, j); });
() => { const dfd = q.defer(); dfd.resolve(98); return dfd.promise; }().then( (i) => { console.log(i); });
