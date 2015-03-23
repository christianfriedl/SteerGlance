var DAO = function() {
    this._fields = {};
    this.addField({ name: 'id', value: undefined });
};

DAO.prototype.setDao = function(dao) {
    this._dao = dao;
};

DAO.prototype.addField = function(field) {
    if ( !field.hasOwnProperty('value') )
        field.value = undefined;
    this._fields[field.name] = field;
};

DAO.prototype.getField = function(name) {
    return this._fields[name];
};

DAO.prototype.addFields = function(fields) {
    var self = this;
    _.each(fields, function(f) { self.addField(f); });
};

DAO.prototype.getValue = function(name) {
    return this._fields[name].value;
};

DAO.prototype.setValue = function(name, value) {
    this._fields[name].value = value;
};


DAO.prototype.setId = function(id) {
    this._fields['id'].value = id;
};

DAO.prototype.getId = function() {
    return this._fields['id'].value;
}


exports.DAO = DAO;
