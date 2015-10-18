/*
 * Copyright (C) 2015 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
 *
 * Mapitor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var db = new sqlite3.Database('test.db');
db.serialize(function() {
    db.run('DROP TABLE IF EXISTS customer', [], function(err, res) { console.log(err, 'done', res); });
    db.run('CREATE TABLE customer (id int, firstName text, lastName text)', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO customer VALUES(1, \'Karenbruck\', \'Hardnebrautz\')', [], function(err, res) { console.log(err, 'done', res); });
    db.run('INSERT INTO customer VALUES(2, \'Christian\', \'Friedl\')', [], function(err, res) { console.log(err, 'done', res); });

    db.run('DROP TABLE IF EXISTS invoice', [], function(err, res) { console.log(err, 'done', res); });
    db.run('CREATE TABLE invoice (id int, customerId int, amount decimal)', [], function(err, res) { console.log(err, 'done', res); });

    i = 0;
    async.whilst(
        function() { return i < 20000; },
        function(callback) {
            db.run('INSERT INTO invoice VALUES(?, ?, ?)', [i, Math.floor(Math.random() * 2) + 1, Math.round(Math.random() * 20000) / 100], function(err, res) { console.log(err, 'done', res); callback(); });
            ++i;
        }, function(err) {
            console.log('all done');
        });
});


