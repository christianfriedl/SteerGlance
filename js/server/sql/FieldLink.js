var Type = { oneToMany: 1, oneToOne: 2, manyToMany: 3 };

function FieldLink(sourceField, targetField, type) {
    this._sourceField = sourceField;
    this._targetField = targetField;
    if ( typeof(type) === 'undefined' ) {
        type = Type.oneToMany;
    }
    this._type = type;
}

FieldLink.prototype.sourceField = function(field) {
    if ( typeof(field) !== 'undefined' ) {
        this._sourceField = field;
        return this;
    }
    return this._sourceField;
};

FieldLink.prototype.targetField = function(field) {
    if ( typeof(field) !== 'undefined' ) {
        this._targetField = field;
        return this;
    }
    return this._targetField;
};

FieldLink.prototype.type = function(type) {
    if ( typeof(type) !== 'undefined' ) {
        this._type = type;
        return this;
    }
    return this._type;
};

function fieldLink(sourceField, targetField, type) { return new FieldLink(sourceField, targetField, type); }

exports.FieldLink = FieldLink;
exports.fieldLink = fieldLink;
exports.Type = Type;
