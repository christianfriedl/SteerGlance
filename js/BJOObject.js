function BJOObject() {
    this._className = 'BJOObject';
}

BJOObject.prototype.className = function() {
    return this._className;
};

exports.BJOObject = BJOObject;
