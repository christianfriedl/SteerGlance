function Table(name) {
    this._name = name;
    this._fields = {};
}

Table.prototype.getName = function() {
    return this._name;
};

Table.prototype.setName = function(name) {
    this._name = name;
};

Table.prototype.addField = function(field) {
    field.setTable(this);
    this._fields[field.getName()] = field;
};

Table.prototype.getField = function(name) {
    return this._fields[name];
};

Table.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.addField(f); });
};

Table.prototype.getFields = function() {
    return this._fields;
};


exports.Table = Table;
