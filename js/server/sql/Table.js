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

Table.prototype.fields = function(fields) {
    if ( typeof(fields) !== 'undefined' ) {
        _.each(fields, function(f) { this.field(f); }, this);
	return this;
    }
    return this._fields;
};

function table(name) { return new Table(name); }

exports.Table = Table;
exports.table = table;
