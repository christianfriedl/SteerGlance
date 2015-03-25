/*
 * insert into t ( fields... ) values ( values... )
 * update t set f=v, f=v where f=v
 * delete from t where f=v
 *
 * select f, f from t where f=v
 *
 */

var Type = { select: 'select', update: 'update', 'delete': 'delete', insert: 'insert' };
function Query() {
    this._type = undefined;
    this._fields = [];
    this._tables = [];
    this._conditions = [];
}

Query.prototype.tables = function() {
    return this._tables;
};

Query.prototype.fields = function() {
    return this._fields;
};

Query.prototype.conditions = function() {
    return this._conditions;
};

Query.prototype.select = function() {
    this._type = Type.select;
    this._fields = Array.prototype.slice.call(arguments);
    return this;
};

Query.prototype.update = function() {
    this._type = Type.update;
    this._fields = Array.prototype.slice.call(arguments);
    return this;
};

Query.prototype.insert = function() {
    this._type = Type.insert;
    this._fields = Array.prototype.slice.call(arguments);
    return this;
};

Query.prototype.delete = function() {
    this._type = Type.delete;
    return this;
};

Query.prototype.from = function(tables) {
    this._tables = Array.prototype.slice.call(arguments);
    return this;
};

Query.prototype.into = function(table) {
    this._tables = [ table ];
    return this;
};

Query.prototype.where = function(conditions) {
    this._conditions = Array.prototype.slice.call(arguments);
    return this;
};

function select() {
    return Query.prototype.select.apply(new Query(), Array.prototype.slice.call(arguments));
}

function insert() {
    return Query.prototype.insert.apply(new Query(), Array.prototype.slice.call(arguments));
}

function update() {
    return Query.prototype.update.apply(new Query(), Array.prototype.slice.call(arguments));
}

function remove() {
    return Query.prototype.delete.apply(new Query(), Array.prototype.slice.call(arguments));
}

exports.Type = Type;
exports.Query = Query;
exports.select = select;
exports.insert = insert;
exports.update = update;
exports.delete = remove;


