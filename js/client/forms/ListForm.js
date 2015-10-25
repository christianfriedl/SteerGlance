/*
 * Copyright (C) 2015 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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

    function Form(data, cssId) {
        this._data = data;
        this._cssId = cssId;
    }

    function ListForm(data, cssId) {
        Form.call(this, data, cssId);
    }

    ListForm.fromJson = function(json, cssId) {
            console.log('lfe json', json);
            var js = JSON.parse(json);
            return new ListForm(js, cssId);
    };

    ListForm.prototype.toHtml = function() {
        console.log('listform tohtml this', this);
        switch (this._data.action) {
            case 'prepare':
                return (new ListForm.Prepare(this._data, this._cssId)).toHtml();
                break;
            case 'list':
                return new ListFormBody(this._data, this._cssId).toHtml();
                break;
        }
    };

    ListForm.createFieldId = function(id, field) {
        return 'field-' + id + '-' + field.name;
    };

    ListForm.Prepare = function(data, cssId) {
        Form.call(this, data, cssId);
    };

    ListForm.Prepare.prototype.toHtml = function() {
        var listUrl = '/' + [this._data.module, this._data.controller, 'list'].join('/');
        var html = Tags.form({ 'id': this._data.cssId }, 
                Tags.div({ 'class': 'list-pane' }, [ 
                    Tags.table({ 'class': 'list-form' }, [ 
                        Tags.thead({}, [], 
                            (new ListForm.Filters(this._data, this._cssId).toHtml())
                            + Tags.tr({'class': 'head'}, [],
                                _(this._data.templateRow.fields).reduce(function(memo, field) { 
                                    return memo + Tags.th({}, [], field.label);
                                }, '')
                            )
                        ),
                        Tags.tbody()
                        ]
                    )
                ])
            ) + Tags.script({'type': 'text/javascript' }, [],
                (new ListForm.DummyListScript(this._data, this._cssId).toHtml()) + (new ListForm.ScrollingScript(this._data, this._cssId).toHtml())
                + `
                    ListForm.ScrollingScript.refreshScrolledData(jQuery('.list-pane'), jQuery('.list-pane').scrollTop(), '` + this._cssId + `','` + this._data.module + `','` + this._data.controller + `');
                `
            );
        return html;
    };

    /*
     * prefill the list with empty "dummy" trs
     */
    ListForm.DummyList = function(cssId, data) {
        this._data = data;
        this._cssId = cssId;
    };

    ListForm.DummyList.prototype.toHtml = function() {
        var html = '';
        _(this._data.count).times(function(n) {
            html += '<tr id="edit-row-' + n + '" class="dummy">' 
                + _(this._data.templateRow.fields.length).times(function() { return '<td><input type="text"/></td>'; }) + '</tr>';
        }.bind(this));
        return html;
    };

    ListForm.DummyListScript = function(data, cssId) {
        this._data = data;
        this._cssId = cssId;
    };

    ListForm.DummyListScript.prototype.toHtml = function() {
        var countUrl = '/' + [this._data.module, this._data.controller, 'count'].join('/');
        var html = `
            jQuery(document).ready(function() {
                var start = new Date().getTime();
                jQuery.ajax('`+ countUrl + `', {
                        success: function(data2) {
                            var datax = JSON.parse(data2);
                            var end = new Date().getTime();
                            jQuery('#` + this._data.cssId + ` tbody').html(new ListForm.DummyList('` + this._data.cssId + `', datax).toHtml());
                            var end2 = new Date().getTime();
                        }
                    }
                );
            });
        `;
        return html;
    };

    ListForm.ScrollingScript = function(data, cssId) {
        this._data = data;
        this._cssId = cssId;
    };

    ListForm.ScrollingScript.getScrollCoords = function(cssId, scrollTop) {
        var overFlow = 30;
        var count = jQuery('.list-pane tr').length;
        var trHeight = jQuery('.list-pane tr:first-child').height();
        var tableHeight = jQuery('table.list-form').height();
        return {
            startPos: Math.max(0, Math.round(scrollTop / tableHeight * count) - overFlow), // TODO this works but is somewhat hacky, the formula is not quite correct
            limit: Math.round(jQuery('#bjo-main-form').height() / trHeight) + 2 * overFlow
        }
    };

    ListForm.ScrollingScript.prototype.toHtml = function() {
        var html = `
            jQuery(document).ready(function() {
                jQuery('.list-pane').scroll(function(ev) {
                    var oldScrollTop = jQuery(this).scrollTop();
                    setTimeout(ListForm.ScrollingScript.refreshScrolledData(this, oldScrollTop, '` + this._cssId + `','` + this._data.module + `','` + this._data.controller + `'), 100);
                });
            });`;
        return html;
    };

    ListForm.ScrollingScript.refreshScrolledData = function(el, oldScrollTop, cssId, module, controller) {
        if ( jQuery(el).scrollTop() == oldScrollTop ) {
            var coords = ListForm.ScrollingScript.getScrollCoords(cssId, oldScrollTop);
            var rowNr = coords.startPos;
            var start = new Date().getTime();
            jQuery.ajax({ url: '/' + [ module, controller, 'list' ].join('/'),
                type: 'POST', 
                data: JSON.stringify({ conditions: { offset: coords.startPos, limit: coords.limit } }),
                dataType: 'json',
                contentType: 'application/json',
                success: function(datax) {
                    _(datax.rows).each(function(row) {
                        if ( jQuery('#edit-row-' + rowNr).hasClass('dummy') ) {
                            jQuery('#edit-row-' + rowNr).replaceWith(new ListForm.Row(row, module, controller, rowNr).toHtml()); // TODO hardcoded invoice
                        }
                        ++rowNr;
                    });
                }
            });
        }
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

    ListForm.Row = function(row, module, controller, rowNr) {
        this._row = row;
        this._module = module;
        this._controller = controller;
        this._rowNr = rowNr;
    };

    ListForm.Row.prototype.toHtml = function() {
         return '<tr class="edit" id="edit-row-' + this._rowNr + '">'
             + _(this._row.fields).reduce(function(memo, field) {
                 return memo + (new ListForm.Field(this._row.id, field, this._module, this._controller, this._rowNr).toHtml())
             }.bind(this), '')
            + Tags.td({}, [
                Tags.a({ 'href': '#', 'onClick': "loadUI('/" + [ this._module, this._controller, 'edit' ].join('/') + "?id=" + this._row.id + "')" }, [], 'Edit')
            ])
         + '</tr>';
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

    window.Form = Form;
    window.ListForm = ListForm;
})(window);
