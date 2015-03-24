var fieldList = require('./fieldList.js');

function Select() {
    this._fieldList = null;
    this._tables = [];
    this._whereClauseConditions = [];
}

Select.prototype.addConditionToWhereClause

function fromTable(table) {
    this._fieldList = fieldList.fromTable(table);
    this.tables = [ table ];
}

exports.Select = Select;
exports.fromTable = fromTable;
