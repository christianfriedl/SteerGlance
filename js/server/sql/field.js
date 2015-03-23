var Type = { int: 1 }

function Field(name, type) {
    this._name = name;
    this._type = type;
}

Field.prototype.getTable = function() {
    return this._table;
};

Field.prototype.setTable = function(table) {
    this._table = table;
};

Field.prototype.getName = function() {
    return this._name;
};

Field.prototype.getType = function() {
    return this._type;
};

exports.Field = Field;
exports.Type = Type;
