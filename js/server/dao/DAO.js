var DAO = function() {
    this._className = 'dao.DAO';
    this._fields = {};
    this.addField({ name: 'id', value: undefined });
};

DAO.prototype.setDao = function(dao) {
    this._dao = dao;
};

DAO.prototype.field = function(fieldOrName) {
    if ( typeof(fieldOrName) !== 'undefined' ) {
        this._fields[field.name] = fieldOrName;
        return this;
    }
    return this._fields[fieldOrName];
};

DAO.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.field(f); });
};

DAO.prototype.fieldValue = function(name, value) {
    if ( typeof(value) !== 'undefined' ) {
        this.field(name).value(value);
        return this;
    }
    return this._fields[name].value();
};

DAO.prototype.id = function(id) {
    if ( typeof(id) !== 'undefined' ) {
        this._fields['id'].value = id;
        return this;
    }
    return this.field('id').value();
};

exports.DAO = DAO;
