function FieldList() {
    this._fields = [];
}

FieldList.prototype.getFields = function() {
    return this._fields;
}

FieldList.prototype.addField = function(field) {
    this._fields.push(field);
};

function fromTable(table) {
    var fl = new FieldList();
    for (name in table.getFields()) {
        fl.addField(table.getField(name));
    }
    return fl;
}

exports.FieldList = FieldList;
exports.fromTable = fromTable;
