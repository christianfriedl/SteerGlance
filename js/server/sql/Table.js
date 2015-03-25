function Table(name) {
    this._className = 'sql.Table';
    this._name = name;
    this._fields = {};
}

Table.prototype.name = function(name) {
    if ( typeof(name) !== 'undefined' ) {
        this._name = name;
        return this;
    }
    return this._name;
};

Table.prototype.field = function(nameOrField) {
    if ( typeof(nameOrField.className) !== 'undefined' && nameOrField.className() === 'sql.Field') {
        console.log('yes', this);
        nameOrField.table(this);
        this._fields[nameOrField.name()] = nameOrField;
        return this;
    }
        console.log('returning field', this._fields[nameOrField]);
    return this._fields[nameOrField];
};

Table.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.field(f); });
};

Table.prototype.fields = function() {
    return this._fields;
};


exports.Table = Table;
