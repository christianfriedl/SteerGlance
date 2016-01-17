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

    function EditForm(data, cssId) {
        Form.call(this, data, cssId);
        this._data = data;
        this._cssId = cssId;
        console.log('ef data', data);
    }
    EditForm.prototype = new Form();

    EditForm.prototype.toHtml = function() {
        return Tags.script({ type: 'text/javascript' }, [], `
            jQuery(document).ready(function() { 
                var table = new SingleRowTable(` + this._thisFormHtml() + `._cssId, ` + this._thisFormHtml() + `._data.row, ` + this._thisFormHtml() + `.getSaveFieldFunc());
                table.render();
            });`);
    };

    EditForm.prototype.countRows = function(callback) {
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

    EditForm.prototype.fetchRow = function(id, callback) {
        console.log('ef fetchrow will call', callback, 'with row', this._data.row);
        callback(false, this._data.row);
        /*
        var fetchUrl = '/' + [ this._data.module, this._data.controller, 'edit'].join('/');
        var data = { id: id };
        console.log('fetchrow sends data', data, JSON.stringify(data));
        jQuery.ajax({
            type: 'GET', 
            url: fetchUrl,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                console.log('fetchRows successs, got data', data);
                callback(false, data.row);
            }
        });
        */
    };

    EditForm.prototype.fetchTemplateRow = function(callback) {
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

    EditForm.prototype.saveField = function(fieldName, row, callback) {
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

    EditForm.prototype.getSaveFieldFunc = function() {
        return this.saveField.bind(this);
    };


    function nononono() {
        var html = Tags.form({ 'id': 'bjo-main-form'}, [
            Tags.table({ 'class': 'card-form' }, [], 
                (new EditForm.Row(this._data.row, this._cssId).toHtml()))
            ]) + Tags.script({ 'type': 'text/javascript' },
                [],
                `jQuery(document).ready(function() {
                    jQuery('#bjo-main-form input').change(function(evt) {
                        console.log('saving...', this.name);
                        evt.preventDefault();
                        var row = {};
                        _(jQuery('#bjo-main-form .edit-field')).map(function(f) { row[f.name] = jQuery(f).val(); });
                        var data = { fieldName: this.name, row: row };
                        console.log('serailize data', data);
                        jQuery.ajax( 
                            {
                                type: 'POST', 
                                url: '/` + [ this._data.module, this._data.controller, 'saveField' ].join('/') + `',
                                data: JSON.stringify(data),
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function(data) {
                                    console.log('success!', data);
                                },
                                error: function (xhr, ajaxOptions, thrownError) {alert("ERROR:" + xhr.responseText+" - "+thrownError);} 
                            }
                        );
                    });
                });
            `);
            return html;
    };

    /*
     * EditForm.Row: returns the html for one data row (row is NOT a tr here!)
     */
    EditForm.Row = function(row) {
        this._row = row;
    };

    EditForm.Row.prototype.toHtml = function() {
        return _(this._row.fields).reduce(function(memo, field) {
                    return memo + Tags.tr({}, [], Tags.th({}, [], field.label) + Tags.td({}, [ Tags.input({ 'name': field.name, 'class': 'edit-field', 'type': 'text', 'value': field.value}) ]));
                }, '');
    };

    window.EditForm = EditForm;
})(window);
