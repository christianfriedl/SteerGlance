var Type = { oneToMany: 1, oneToOne: 2, manyToMany: 3 };

function FieldLink(sourceField, targetField, type) {
    this._sourceField = sourceField;
    this._targetField = targetField;
    if ( typeof(type) === 'undefined' ) {
        type = Type.oneToMany;
    }
    this._type = type;
}

FieldLink.prototype.getSourceField = function() {
    return this._sourceField;
};

FieldLink.prototype.getTargetField = function() {
    return this._targetField;
};

FieldLink.prototype.getType = function() {
    return this._type;
};

exports.FieldLink = FieldLink;
exports.Type = Type;
