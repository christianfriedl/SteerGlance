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
                    console.log('schtargting', this._cssId); 
                    var table = new LazyTable(` + this._thisFormHtml() + `._cssId, ` + this._thisFormHtml() + `.getFunctionObject());
                    table.render();
                });`);
                // var t = new LazyTable('ui', countRows, fetch, fetchTemplate, saveField);
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

    ListForm.prototype.saveField = function() {
        console.log('will saveField');
    };




    ListForm.Filters = function(data, cssId) {
        Form.call(this, data, cssId);
    };

    ListForm.Filters.prototype.toHtml = function() {
        return Tags.tr({}, [], 
            _(this._data.templateRow.fields).reduce(function(memo, field) { 
                var lfff = new ListForm.FieldFilter(field, this._data.module, this._data.controller, this._cssId);
                return memo 
                + Tags.th({}, [], (field.className !== 'sql.CalcField' ? lfff.toHtml() : '&nbsp;'));
            }.bind(this), '')
        );
    };

    ListForm.FieldFilter = function(field, module, controller, cssId) {
        this._field = field;
        this._module = module;
        this._controller = controller;
        this._cssId = cssId;
    };
    
    ListForm.FieldFilter.prototype.toHtml = function() {
        var filterFieldUrl = '/' + [this._module, this._controller, 'list'].join('/');
        return Tags.select( { 'id': 'filter-op-' + this._field.name }, [
                + Tags.option({ 'value': '' }),
                + Tags.option({ 'value': 'eq' }, [], '='),
                + Tags.option({ 'value': 'lt' }, [], '<'),
                + Tags.option({ 'value': 'gt' }, [], '>')
            ])
            + tag('input', [ attr('type', 'text'), attr('id', 'filter-text-' + this._field.name), attr('size', 10), attr('maxlength', 255) ])
        + tag('script', { type: 'text/javascript' }, [],
                `jQuery(document).ready(function() {
                    jQuery('select#filter-op-` + this._field.name + `,input#filter-text-` + this._field.name + `').change(function(ev) {
                        console.log('inchange', jQuery(this).attr('id'));
                        if ( m = (jQuery(this).attr('id').match(/^filter-(\\w+)-(\\w+)$/)) ) {
                            var data = { conditions: [] };
                            
                            jQuery('select', jQuery(this).parent()).each(function() {
                                var m = jQuery(this).attr('id').match(/^filter-(\\w+)-(\\w+)$/);
                                var opId = 'filter-op-' + m[2];
                                var valueId = 'filter-text-' + m[2];
                                var name = m[2];
                                console.log('opId', opId, jQuery('#'+opId).val());
                                if ( jQuery('#' + valueId).val().length > 0 ) {
                                    var obj = { fieldName: name, opName: jQuery('#' + opId).val(), value: jQuery('#' + valueId).val() };
                                    data.conditions.push(obj);
                                }
                            });

                            jQuery.ajax({
                                type: 'POST', 
                                url: '` + filterFieldUrl + `',
                                data: JSON.stringify(data),
                                dataType: 'json',
                                contentType: 'application/json',
                                success: function(data) {
                                    console.log('filter successs, got data', data);
                                    // TODO OldListForm.refreshData('` + this._cssId + `', data);
                                    // TODO OldListForm.afterCreateHtml('` + this._cssId + `', data);
                                }
                            });
                        }
                    });
                });`
        );
    };

    ListForm.Field = function(id, field, module, controller, rowNr) {
        this._id = id;
        this._field = field;
        this._module = module;
        this._controller = controller;
        this._rowNr = rowNr;
    };
        
    ListForm.Field.prototype.toHtml = function() {
        if ( this._field.isEditable ) {
            return Tags.td({}, [ (new ListForm.EditableField(this._field, this._module, this._controller, this._rowNr).toHtml()) ]);
        } else {
            return Tags.td({}, [
                    new Tags.input({ 'type': 'hidden',
                        'id': [ 'field', this._rowNr, field.name ].join('-'),
                        'name': field.name,
                        'value': ( typeof(this._field.value) !== 'undefined' ? this._field.value : '')
                    }) 
                ]);
        }
    };

    ListForm.EditableField = function(field, module, controller, rowNr) {
        this._field = field;
        this._module = module;
        this._controller = controller;
        this._rowNr = rowNr;
    };

    ListForm.EditableField.prototype.toHtml = function() {
        var fieldId = ListForm.createFieldId(this._rowNr, this._field);
        if ( this._field.className === 'LookupField' ) {
            return Tags.input({ 'id': fieldId,
                    'name': this._field.name,
                    'type': 'hidden',
                    'value': (this._field.value ? this._field.value : '') 
                }) + this._field.value + '&nbsp;'
                + Tags.button({ 'id': 'lookup-opener-' + this._id + '-' + this._field.name }, [], '^')
                + Tags.script({}, [], `jQuery(document).ready(function() {
                         jQuery('#lookup-opener-` + this._id + `-` + this._field.name + `').click(function(ev) {
                             ev.preventDefault();
                             openLookupPopup('` + fieldId + `', '` + JSON.stringify(this._field.options) + `', '` + this._module + `', '` + this._controller + `');
                         });
                    });`
                );
        } else {
            return Tags.input({'class': 'edit-field', 'id' : fieldId,
                    'name': this._field.name, 'type': 'text',
                    'value': ( typeof(this._field.value) !== 'undefined' ? this._field.value : '')
            });
        }
    };

    window.ListForm = ListForm;
})(window);
