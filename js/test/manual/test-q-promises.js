"use strict";

const q = require('q');
const _ = require('lodash');

function getName() {
    const dfd = q.defer();
    setTimeout(() => { dfd.resolve('Christian'); }, Math.random() * 3000);
    return dfd.promise;
}
function getAddress() {
    const dfd = q.defer();
    setTimeout(() => { dfd.resolve('Tivoligasse'); }, Math.random() * 3000);
    return dfd.promise;
}

const obj = {
    name: 'Christian Friedl',
    address: 'Tivoligasse 43',

    get: function(key) {
        const dfd = q.defer();
        setTimeout(() => { dfd.resolve(this[key]); }, Math.random() * 3000);
        return dfd.promise;
    },
    getKeys: function() { return [ 'name', 'address' ]; }
};

q.all([ getName(), getAddress() ]).then( (res) => {
    console.log('then res', res);
}).done();

q.all([ getName(), getAddress() ]).spread( (name, address) => {
    console.log('name', name);
    console.log('address', address);
}).done();


getAllKeys(obj).then((newObj) => { console.log('object from getAllKeys', newObj); });


function getAllKeys(obj) {
    const dfd = q.defer();
    q.all(_.map(obj.getKeys(), ( key ) => { return obj.get(key); })).then( res => {
        let newObj = {};
        let i=0; _.each(obj.getKeys(), key => { newObj[key] = res[i]; ++i; });
        dfd.resolve(newObj);
    }).done();
    return dfd.promise;
}
