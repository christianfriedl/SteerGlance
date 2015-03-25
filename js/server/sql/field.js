var Type = { int: 'int', string: 'string' }

function Field(name, type) {
    this._className = 'sql.Field';
    this._name = name;
    this._type = type;
    this._value = null;
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

Field.prototype.getValue = function() {
    return this._value;
};

Field.prototype.setValue = function(value) {
    this._value = value;
};

exports.Field = Field;
exports.Type = Type;
