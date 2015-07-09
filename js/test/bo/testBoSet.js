
"use strict";

var _ = require('underscore');
var assert = require('assert');
var async = require('async');
var db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_bo_bo = require('bo/bo.js');
var m_dao_daoSet = require('dao/daoSet.js');
var m_bo_boSet = require('bo/boSet.js');
var table = require('sql/table.js');
var field = require('sql/field.js');
var index = require('sql/index.js');
var condition = require('sql/condition.js');
var aggregate = require('sql/aggregate.js');
var query = require('sql/query.js');
var ddl = require('sql/ddl.js');
var sqliteQuery = require('sql/sqlite/query.js');

var Tests = {
    _name: 'testBoSet',

    testLoadAllByConditions: function() {
        var table1 = table.table('table1');
        var id1 = field.field('id1', field.DataType.int);
        table1.field(id1);
        var cond = condition.condition()
            .field(id1)
            .op(condition.Op.eq)
            .compareTo(1);
        var db1 = db.db(':memory:').open(':memory:');
        db1._db.runSql('CREATE TABLE table1 (id1 int)', [], function(err) {
            if ( err ) throw err;
            db1._db.runSql('INSERT INTO table1 (id1) VALUES(1)', [], function(err) {
                if ( err ) throw err;
                var daoSet1 = m_dao_daoSet.daoSet(db1, m_dao_dao.dao).table(table1);
                var boSet1 = m_bo_boSet.boSet(db1, daoSet1, m_bo_bo.bo);
                boSet1.loadAllByConditions([], function(err, bos) {
                    assert.strictEqual(false, err);
                    assert.strictEqual(1, bos.length);
                    assert.strictEqual(1, bos[0].id1());
                    console.log('row laoded id1', bos[0].id1());
                });
            });
        });
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
