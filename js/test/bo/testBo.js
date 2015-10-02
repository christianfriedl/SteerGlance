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

"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var dao = require('dao/dao.js');
var primaryDao = require('dao/primaryDao.js');
var bo = require('bo/bo.js');
var primaryBo = require('bo/primaryBo.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var fieldLink = require('sql/fieldLink.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');
var boField = require('sql/boField.js');

var m_TestSuite = require('TestSuite.js');

function fieldEqual(f1, f2) {
    return f1.name() === f2.name() && f1.dataType() === f2.dataType() && f1.className() === f2.className() && f1.value() === f2.value();
}

var tests = {
    _name: 'testBo',

    testFields: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('name');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo(db1).dao(dao1);
        assert.equal(true, fieldEqual(id1, bo1.field('id1')));
        assert.equal(true, fieldEqual(name1, bo1.field('name1')));
    },

    testGetters: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('one');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo(db1).dao(dao1);
        assert.strictEqual(1, bo1.id1());
        assert.strictEqual('one', bo1.name1());
    },

    testSetters: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var id1 = field.field('id1', field.DataType.int);
        assert.strictEqual('id1', id1.accessorName());
        var name1 = field.field('name1', field.DataType.string);
        assert.strictEqual('name1', name1.accessorName());
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo(db1).dao(dao1);
        assert.strictEqual(bo1, bo1.id1(1));
        assert.strictEqual(bo1, bo1.name1('name'));
        assert.strictEqual(1, bo1.id1());
        assert.strictEqual('name', bo1.name1());
    },

    testLoadByQuery: function() { // TODO this tests the dao, not the bo, and should be moved + replaced!
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var cond = condition.condition()
            .field(id1)
            .op(condition.Op.eq)
            .compareTo(1);
        var select = query.select(id1).from(table1).where(cond);
        var db1 = db.db(':memory:').open(':memory:');
        db1._db.runSql('CREATE TABLE table1 (id1 int)', [], function(err) {
            if ( err ) throw err;
            db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], function(err) {
                if ( err ) throw err;
                var dao1 = dao.dao(db1).table(table1);
                dao1.loadByQuery(select, function(err, dao2) {
                    if ( err ) throw new Error(err);
                    assert.strictEqual(1, dao1.id1());
                    assert.strictEqual(dao1, dao2);
                });
            });
        });
    },
    testDefaultValidate: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo(db1).dao(dao1);
        assert.doesNotThrow(function() { bo1.validate(); });
    },
    testSetValidate: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo(db1).dao(dao1);
        var id1 = field.field('id1', field.DataType.int);
        bo1.id1(1);
        bo1.validation(function() {
            if ( this.field('id1').value() < 2 ) {
                throw new field.ValidationException(id1, "must be at least 2");
            }
        });
        assert.throws(function() { bo1.validate(); },  field.ValidationException, "should throw ValidationException");
        bo1.id1(2);
        assert.doesNotThrow(function() { bo1.validate(); });
    },
    testBoFieldGet: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var tCust = table.table('customer');
        var fCustId = field.field('id', field.DataType.int);
        tCust.field(fCustId);
        var daoCust = primaryDao.primaryDao(db1).table(tCust);
        var boCust = primaryBo.primaryBo(db1).dao(daoCust);

        var custCons = function(db) { return boCust; }

        var tInv = table.table('invoice');
        var fInvId = field.field('id', field.DataType.int);
        tInv.field(fInvId);
        var fInvCustId = field.field('customerId', field.DataType.int);
        tInv.field(fInvCustId);
        var fInvCustBo = boField.boField('customer', null, 'customer', db1, custCons, fInvCustId);
        tInv.field(fInvCustBo);
        var daoInv = primaryDao.primaryDao(db1).table(tInv);
        var boInv = primaryBo.primaryBo(db1).dao(daoInv);
        tInv.field('customerId').link(fieldLink.fieldLink(fInvCustId, fCustId, fieldLink.Type.manyToOne));
        // boInv.field('customer').idField(boInv.field('customerId'));


        async.series([
            function(callback) { db1.runSql('CREATE TABLE customer (id int)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE invoice (id int, customerId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO customer VALUES(1)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO invoice VALUES(1, 1)', [], callback); },
            function(callback) { 
                boInv.loadById(1, function(err, bo2) {
                    var c = boInv.customer();
                    assert(c.id() === 1);
                    callback();
                });
            },
        ]);
    },
    testBoFieldSet: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var tCust = table.table('customer');
        var fCustId = field.field('id', field.DataType.int);
        tCust.field(fCustId);
        var daoCust = primaryDao.primaryDao(db1).table(tCust);
        var boCust = primaryBo.primaryBo(db1).dao(daoCust);

        var custCons = function(db) { return boCust; }

        var tInv = table.table('invoice');
        var fInvId = field.field('id', field.DataType.int);
        tInv.field(fInvId);
        var fInvCustId = field.field('customerId', field.DataType.int);
        tInv.field(fInvCustId);
        var fInvCustBo = boField.boField('customer', null, 'customer', db1, custCons, fInvCustId);
        tInv.field(fInvCustBo);
        var daoInv = primaryDao.primaryDao(db1).table(tInv);
        var boInv = primaryBo.primaryBo(db1).dao(daoInv);
        tInv.field('customerId').link(fieldLink.fieldLink(fInvCustId, fCustId, fieldLink.Type.manyToOne));
        // boInv.field('customer').idField(boInv.field('customerId'));


        async.series([
            function(callback) { db1.runSql('CREATE TABLE customer (id int)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE invoice (id int, customerId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO customer VALUES(1)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO invoice VALUES(1, 1)', [], callback); },
            function(callback) { 
                boInv.loadById(1, function(err, bo2) {
                    var c = boInv.customer();
                    assert(c.id() === 1);
                    c.id(2);
                    assert(c.id() === 2);
                    debugger;
                    boInv.customer(c);
                    assert.equal(2, boInv.customerId());
                    boInv.save(function(err, boInv2) {
                        db1.allSql('SELECT * FROM invoice', [], function(err, rows) {
                            if ( err ) throw new Error(err);
                            assert.strictEqual(2, rows[0].customerId);
                        });
                    });
                    callback();
                });
            },
        ]);
    }
};

function runTests(testNames) {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests, testNames);
}

exports.runTests = runTests;
