"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var dao = require('dao/dao.js');
var bo = require('bo/bo.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');

function fieldEqual(f1, f2) {
    return f1.name() === f2.name() && f1.dataType() === f2.dataType() && f1.className() === f2.className() && f1.value() === f2.value();
}

var Tests = {
    _name: 'testBo',

    testFields: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('name');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo().dao(dao1);
        assert.equal(true, fieldEqual(id1, bo1.field('id1')));
        assert.equal(true, fieldEqual(name1, bo1.field('name1')));
    },

    testGetters: function() {
        var db1 = db.db(':memory:').open(':memory:');
        var id1 = field.field('id1', field.DataType.int).value(1);
        var name1 = field.field('name1', field.DataType.string).value('one');
        var table1 = table.table().field(id1).field(name1);
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo().dao(dao1);
        console.log(bo1.id1(), bo1.name1());
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
        var bo1 = bo.bo().dao(dao1);
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
                debugger;
                dao1.loadByQuery(select, function(err, dao2) {
                    if ( err ) throw new Error(err);
                    console.log('dao laoded', dao1.id1());
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
        var bo1 = bo.bo().dao(dao1);
        assert.doesNotThrow(function() { bo1.validate(); });
    },
    testSetValidate: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var db1 = db.db(':memory:').open(':memory:');
        var dao1 = dao.dao(db1).table(table1);
        var bo1 = bo.bo().dao(dao1);
        var id1 = field.field('id1', field.DataType.int);
        bo1.id1(1);
        bo1.validation(function() {
            console.log('_validation', 'this', this, this.field('id1'), this.field('id1').value());
            if ( this.field('id1').value() < 2 ) {
                throw new field.ValidationException(id1, "must be at least 2");
            }
        });
        assert.throws(function() { bo1.validate(); },  field.ValidationException, "should throw ValidationException");
        bo1.id1(2);
        assert.doesNotThrow(function() { bo1.validate(); });
    }
};

function runTests() {
    console.log('>', module.filename);
    var f = null;
    for (f in Tests) {
        if ( typeof(Tests[f]) === 'function' && f.substr(0,4) === 'test' ) {
            console.log('>>>', f);
            Tests[f]();
            console.log('<<<', f);
        }
    }
    console.log('<', module.filename);
}

exports.runTests = runTests;
