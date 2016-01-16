/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
 *
 * Mapitor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

(function(window) {
    "use strict";

    function ListForm(data, cssId) {
        Form.call(this, data, cssId);
    }
    ListForm.prototype = new Form();

    ListForm.fromJson = function(json, cssId) {
            console.log('lfe json', json);
            var js = JSON.parse(json);
            return new ListForm(js, cssId);
    };

    ListForm.createFieldId = function(id, field) {
        return 'field-' + id + '-' + field.name;
    };

    ListForm.prototype.toHtml = function() {
        return Tags.script({ type: 'text/javascript' }, [], `
                jQuery(document).ready(function() { 
                    var table = new LazyTable(` + this._thisFormHtml() + `._cssId, ` + this._thisFormHtml() + `.getFunctionObject());
                    table.render();
                });`);
     };

    ListForm.prototype.getFunctionObject = function() {
        return {
            'count': this.countRows.bind(this),
            'fetchTemplateRow': this.fetchTemplateRow.bind(this),
            'fetchRows': this.fetchRows.bind(this),
            'saveField': this.saveField.bind(this),
        }
    };

    ListForm.prototype.countRows = function(callback) {
        var fetchUrl = '/' + [ this._data.module, this._data.controller, 'count'].join('/');
        var data = { conditions: {} };
        jQuery.ajax({
            type: 'POST', 
            url: fetchUrl,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                console.log('fetchRows successs, got data', data);
                callback(false, data.count);
            }
        });
    };

    ListForm.prototype.fetchRows = function(offset, limit, callback) {
        var fetchUrl = '/' + [ this._data.module, this._data.controller, 'list'].join('/');
        var data = { conditions: { limit: limit, offset: offset } };
        jQuery.ajax({
            type: 'POST', 
            url: fetchUrl,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                console.log('fetchRows successs, got data', data);
                callback(false, data.rows);
            }
        });
    };

    ListForm.prototype.fetchTemplateRow = function(callback) {
        var fetchUrl = '/' + [ this._data.module, this._data.controller, 'templateRow'].join('/');
        jQuery.ajax({
            type: 'POST', 
            url: fetchUrl,
            data: JSON.stringify({}),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                console.log('fetchTemplateRow successs, got data', data);
                callback(false, data);
            }
        });
    };

    ListForm.prototype.saveField = function(fieldName, row, callback) {
        console.log('listform will saveField');
        var url = '/' + [ this._data.module, this._data.controller, 'saveField'].join('/');
        var data = { fieldName: fieldName, row: row };
        jQuery.ajax({
            type: 'POST', 
            url: url,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                console.log('saveField successs, got data', data);
                callback(false, data);
            }
        });
    };

    window.ListForm = ListForm;
})(window);
