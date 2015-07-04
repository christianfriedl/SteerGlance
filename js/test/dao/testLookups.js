"use strict";

var assert = require('assert');
var async = require('async');

var m_TestSuite = require('TestSuite.js');
var m_sql_table = require(    'sql/table.js');
var m_sql_field = require(    'sql/field.js');
var m_sql_fieldLink = require('sql/fieldLink.js');
var m_sql_lookupField = require('sql/lookupField.js');
var m_sql_db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_dao_primaryDao = require('dao/primaryDao.js');

var tests = {
    _name: 'testTable',
    testLookupField: function() {
        var mainTable = m_sql_table.table('main');
        mainTable.field(m_sql_field.field('id', m_sql_field.DataType.int, 1, 'id'));
        mainTable.field(m_sql_field.field('name', m_sql_field.DataType.string, 1, 'id'));
        var childTable = m_sql_table.table('child');
        var lf = m_sql_lookupField.lookupField('mainId', m_sql_field.DataType.int, 1, 'mainId', mainTable.field('name'));
        childTable.field(lf);
        var link = m_sql_fieldLink.fieldLink(childTable.field('mainId'), mainTable.field('id'), m_sql_fieldLink.Type.manyToOne);
        childTable.field('mainId').link(link);
        var q = childTable.field('mainId').query();
        // TODO assert.notNull(q);

        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var dao1 = m_dao_primaryDao.primaryDao(db1, childTable);
        async.series([
            function(callback) { db1.runSql('CREATE TABLE main (id int, name text)', [], callback); },
            function(callback) { db1.runSql('CREATE TABLE child (id int, mainId int)', [], callback); },
            function(callback) { db1.runSql('INSERT INTO main (id, name) VALUES(1, \'eins\')', [], callback); },
            function(callback) { db1.runSql('INSERT INTO child (mainId, id) VALUES(1, 1)', [], callback); },
            function(callback) {
                dao1.loadById(1, function(err, dao2) {
                    if (err) throw new Error(err);
                    callback();
                });
            }
        ]);

    }
};

function runTests() {
    m_TestSuite.TestSuite.call(tests);
    m_TestSuite.TestSuite.prototype.runTests.call(tests);
}


exports.runTests = runTests;

