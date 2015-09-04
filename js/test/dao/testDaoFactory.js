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

var m_sql_db = require('sql/db.js');
var m_dao_dao = require('dao/dao.js');
var m_dao_daoFactory = require('dao/daoFactory.js');
var m_dao_dao = require('dao/dao.js');
var m_dao_primaryDao = require('dao/primaryDao.js');
var m_app_invoice_invoiceDao = require('app/invoice/invoiceDao.js');
var m_app_customer_customerDao = require('app/customer/customerDao.js');


var Tests = {
    _name: 'testDaoFactory',

    testForName: function() {
        var db1 = m_sql_db.db(':memory:').open(':memory:');
        var df1 = m_dao_daoFactory.daoFactory(db1);
        debugger;
        assert.ok('for name dao', df1.forName('dao.DAO') instanceof m_dao_dao.DAO);
        assert.ok('for name primary dao', df1.forName('dao.PrimaryDao') instanceof m_dao_primaryDao.PrimaryDao);
        assert.ok('for name invoice dao', df1.forName('app.InvoiceDao') instanceof m_app_invoice_invoiceDao.InvoiceDao);
        assert.ok('for name customer dao', df1.forName('app.CustomerDao') instanceof m_app_customer_customerDao.CustomerDao);
    },
    testByName: function() {
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
