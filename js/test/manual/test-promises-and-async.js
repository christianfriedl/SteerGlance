"use strict";

const async = require('async');
const q = require('q');

const invoices = [ 1, 3, 2, 4, 5, 7, 6, 8 ];

function getInvNr(inv) {
    const dfd = q.defer();
    setTimeout( () => { dfd.resolve(inv); }, Math.random() * 2000);
    return dfd.promise;
}


async.series([ (cb) => {
    // unordered first
    const unorderedInvNrs = [];
    async.each( invoices, (inv, cb) => { getInvNr(inv).then( (nr) => { unorderedInvNrs.push(nr); cb(); } ); }, () => { console.log('unorderedInvNrs', unorderedInvNrs); cb(); });
}, (cb) => {
    // we want them all in order
    const promises = invoices.map(getInvNr);
    setTimeout( () => {
        q.all(promises).then((invNrs) => { console.log('ordered inv nrs', invNrs); cb(); });
    }, 5000);
}]);
