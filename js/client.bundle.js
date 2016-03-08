(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

"use strict";

/* we require() our forms here so ui.js can be our entry point for
 * browserify
 */
var m_client_forms_editForm = require('client/forms/editForm.js');
var m_client_forms_listForm = require('client/forms/listForm.js');

function UI() {
};

function ui() {
    return new UI();
}


UI.prototype = {};
UI.prototype.constructor = UI;

/**
 * formName is "editForm", not EditForm!
 */
UI.prototype.displayForm = function(cssId, formName, data) {
    var form = null, formConstructor = null;
    switch ( formName ) { // TODO generizise this
        case 'editForm':
            formConstructor = m_client_forms_editForm.editForm;
            break;
        case 'listForm':
            formConstructor= m_client_forms_listForm.listForm;
            break;
        default:
            throw new Error('no such form as ' + formName);
    }
    data.form = formName;
    form = formConstructor.call({}, data, cssId);

    var html = form.toHtml();
    jQuery('#' + cssId).html(html);
};

exports.UI = UI;
exports.ui = ui;

},{"client/forms/editForm.js":3,"client/forms/listForm.js":5}],2:[function(require,module,exports){
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

"use strict";

var m_client_html = require('client/html.js');

function CellRenderer() {}

CellRenderer.Editable = function() {}

CellRenderer.NonEditable = function() {}

CellRenderer.renderHeaderCell = function(el, fieldIdx, field) {
    jQuery(el).html(field.label);
};

CellRenderer.renderFilterCell = function(el, fieldIdx, field) {
    var opts = [ { 'value': 'eq', 'text': '=' }, { 'value': 'ne', 'text': '<>' } ];
    var html = m_client_html.Tags.select({ id: 'filter-' + field.name + '-op' , 'class': 'filter-op' }, 
            _(opts).map(function(opt) { return m_client_html.Tags.option({ value: opt.value}, [], opt.text); })
    ) + m_client_html.Tags.input({ id: 'filter-' + field.name + '-value', type: 'text', 'class': 'filter-value' });
    jQuery(el).html(html);
};

CellRenderer.fieldValueString = function(v) { return v === null ? '' : v; }

CellRenderer.renderBodyCell = function(el, rowIdx, fieldIdx, field) {
    var matrixLine = _(CellRenderer.BodyCellRenderingMatrix).find(function(desc) {
        var rv = ( desc.isEditable === field.isEditable || desc.isEditable === null )
            && ( desc.className === null || desc.className.toString() === field.className.toString() )
            && ( desc.dataType === field.dataType || desc.dataType === null);
            // console.log('matrix find', field.name, desc, rv);
        return rv;
    });

    if ( typeof(matrixLine) === 'undefined' ) {
        console.error('matrixLine not found', field);
        throw new Error('matrixLine not found for field ' + field.name);
    }
    if ( matrixLine.func === undefined ) {
        console.error('matrixLine func is undef:', field, matrixLine);
        throw new Error('matrixLine func is undef' + field.name);
    }
    var input = matrixLine.func.bind(this)(el, rowIdx, fieldIdx, field);
};

CellRenderer.Editable.renderStringField = function(el, rowIdx, fieldIdx, field) {
    var input = jQuery('<input type="text" id="' + CellRenderer._getFieldId(rowIdx, fieldIdx, field) + '" name="' + field.name + '" value="' + CellRenderer.fieldValueString(field.value) + '" />');
    jQuery(input).addClass('edit');
    jQuery(el).append(input);
    return input;
};

/**
 * also handles noneditable
 */
CellRenderer.Editable.renderBoolField = function(el, rowIdx, fieldIdx, field) {
    var inner = jQuery('<div/>');
    inner.addClass('bool');
    var input = jQuery('<input type="checkbox" id="' + CellRenderer._getFieldId(rowIdx, fieldIdx, field) + '" name="' + field.name + '" value="1"' + (field.value ? ' checked="checked"' : '' )+ ' />');
    inner.append(input);
    if ( !field.isEditable ) {
        jQuery(input).attr('disabled', 'disabled');
    }
    jQuery(el).append(inner);
    return input;
};

CellRenderer.Editable.renderEnumField = function(el, rowIdx, fieldIdx, field) {
    var inner = jQuery('<div/>');
    inner.addClass('enum');
    var html = '<select id="' + CellRenderer._getFieldId(rowIdx, fieldIdx, field) + '" name="' + field.name + '">';
    html += _(field.options).map(function(o) { 
        return '<option value="' + o.value + '"' + (field.value === o.value ? ' selected="selected"' : '') + '>' + o.label + '</option>'; 
    }).join('');
    inner.html(html);

    jQuery(el).append(inner);
    return jQuery('#' + CellRenderer._getFieldId(rowIdx, fieldIdx, field));
};



CellRenderer.NonEditable.renderStringField = function(el, rowIdx, fieldIdx, field) {
    jQuery(el).html(field.value);
};

CellRenderer.NonEditable.renderNumberField = function(el, rowIdx, fieldIdx, field) {
    var inner = jQuery('<div/>');
    inner.html(field.value);
    inner.addClass('number');
    jQuery(el).append(inner);
};

CellRenderer._getFieldId = function(rowIdx, fieldIdx, field) {
    return 'edit-' + field.name + '-' + rowIdx + '-' + fieldIdx;
};

CellRenderer.BodyCellRenderingMatrix = [
    { isEditable: true, className: 'Field', dataType: 'string', func: CellRenderer.Editable.renderStringField },
    { isEditable: true, className: 'Field', dataType: 'int', func: CellRenderer.Editable.renderStringField },
    { isEditable: true, className: 'Field', dataType: 'int', func: CellRenderer.Editable.renderStringField },
    { isEditable: true, className: 'EnumField', dataType: null, func: CellRenderer.Editable.renderEnumField },
    { isEditable: null, className: 'Field', dataType: 'bool', func: CellRenderer.Editable.renderBoolField },
    { isEditable: false, className: 'Field', dataType: 'string', func: CellRenderer.NonEditable.renderStringField },
    { isEditable: false, className: 'Field', dataType: 'int', func: CellRenderer.NonEditable.renderNumberField },
    { isEditable: true, className: null, dataType: null, func: CellRenderer.Editable.renderStringField }, // fallback
    { isEditable: null, className: null, dataType: null, func: CellRenderer.NonEditable.renderStringField }, // fallback
    // TODO: date, (time), options, lookup
];

exports.CellRenderer = CellRenderer;

},{"client/html.js":6}],3:[function(require,module,exports){
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

"use strict";

var m_client_singleRowTable = require('client/singleRowTable.js');
var m_client_forms_form = require('client/forms/form.js');

function EditForm(data, cssId) {
    m_client_forms_form.Form.call(this, data, cssId);
    this._data = data;
    this._cssId = cssId;
    console.log('ef data', data);
}

function editForm(data, cssId) { return new EditForm(data, cssId); }

EditForm.prototype = new m_client_forms_form.Form();
EditForm.prototype.constructor = EditForm;

EditForm.prototype.toHtml = function() {
    this.fetchRow(this._data.id, function(err, row) {
        this._data.row = row;
        var table = new m_client_singleRowTable.SingleRowTable(this._cssId, this._data.row, this.getSaveFieldFunc());
        table.render();
    }.bind(this));
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
    var fetchUrl = '/' + [ this._data.module, this._data.controller, 'edit'].join('/');
    var data = { id: id };
    console.log('fetchrow sends data', data, JSON.stringify(data));
    jQuery.ajax({
        type: 'GET', 
        url: fetchUrl,
        data: data,
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            console.log('fetchRows successs, got data', data);
            callback(false, data.row);
        }
    });
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

exports.EditForm = EditForm;
exports.editForm = editForm;

},{"client/forms/form.js":4,"client/singleRowTable.js":9}],4:[function(require,module,exports){
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

"use strict";

var m_util = require('util.js');

function Form(data, cssId) {
    this._id = m_util.guid();

    this._data = data;
    this._cssId = cssId;
    if ( typeof(window.BJO2) === 'undefined' ) {
        window.BJO2 = { forms: {} };
    }
    if ( typeof(window.BJO2.forms[this._id]) !== 'undefined' ) { console.log('nonu', window.BJO2.forms[this._id]); throw new Error('id not unique'); }
    window.BJO2.forms[this._id] = this;
}

function form(data, cssId) {
    return new Form(data, cssId);
}

Form.prototype = {};
Form.prototype.constructor = Form;

Form.prototype._thisFormHtml = function() {
    return 'window.BJO2.forms[\'' + this._id + '\']';
};

Form.OpenLookupScript = function(data, cssId) {
    Form.call(this, data, cssId);
};

Form.OpenLookupScript.prototype.toHtml = function() {
    return `
        <script>
            function openLookupPopup(hiddenFieldId, optionsJson, module, controller) {
                var options = JSON.parse(optionsJson);
                var html = '<select id="lookup-select-' + hiddenFieldId + '">'
                    + '<option>select...</option>'
                    + _(_(options).keys()).reduce(function(memo, key) {
                        return memo + '<option value="' + key + '">' + options[key] + '</option>';
                    })
                    + '</select>';
                jQuery('#lookupPopup').html(html).dialog();
                jQuery('#lookup-select-' + hiddenFieldId).change(function(ev) {
                    console.log(jQuery(this), jQuery(this).val());
                    jQuery('#' + hiddenFieldId).val(jQuery(this).val());
                    jQuery('#lookupPopup').dialog('close');
                    ListForm.handleFieldChange('` + this._cssId + `', hiddenFieldId, module, controller);
                });
            }
        </script>
    `;
};

exports.Form = Form;
exports.form = form;

},{"util.js":11}],5:[function(require,module,exports){
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

"use strict";

var m_client_lazyTable = require('client/lazyTable.js');
var m_client_forms_form = require('client/forms/form.js');
var m_client_html = require('client/html.js');

/* private constructor, use this for typechecks only */
function ListForm(data, cssId) {
    m_client_forms_form.Form.call(this, data, cssId);
    this._lazyTable = m_client_lazyTable.lazyTable(cssId, this.getFunctionObject());
}

/* public constructor, always use this */
function listForm(data, cssId) {
    return new ListForm(data, cssId);
}

ListForm.prototype = new m_client_forms_form.Form();
ListForm.prototype.constructor = ListForm;

ListForm.prototype.toHtml = function() {
    return m_client_html.Tags.script({ type: 'text/javascript' }, [], `
            jQuery(document).ready(function() { 
                var table = ` + this._thisFormHtml() + `._lazyTable;
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

ListForm.prototype.countRows = function(filters, callback) {
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

ListForm.prototype.fetchRows = function(offset, limit, filters, callback) {
    var fetchUrl = '/' + [ this._data.module, this._data.controller, 'list'].join('/');
    var data = { conditions: { limit: limit, offset: offset, filters: filters } };
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

exports.ListForm = ListForm;
exports.listForm = listForm;

},{"client/forms/form.js":4,"client/html.js":6,"client/lazyTable.js":7}],6:[function(require,module,exports){
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

"use strict";

function attr(name, value) {
    return { name: name, value: value };
}

/*
 * optional object attrs
 * optional array subTags
 * optional string text
 */
function tag(name, attrs, subTags, text) {
    if ( typeof(subTags) === 'undefined' ) {
        subTags = {};
    }
    if ( typeof(text) === 'undefined' ) {
        text = '';
    }
    return '<' + name
        +_(_(attrs).keys()).reduce(function(memo, name) { return memo + ' ' + name + '="' + attrs[name] + '"'; }, '')
        + '>'
        + _(subTags).reduce(function(memo, text) { return memo + text; }, '')
        + text
        + '</' + name + '>';
}

var Tags = {
    form: function(attrs, subTags, text) { return tag('form', attrs, subTags, text); },
    div: function(attrs, subTags, text) { return tag('div', attrs, subTags, text); },
    script: function(attrs, subTags, text) { return tag('script', attrs, subTags, text); },
    table: function(attrs, subTags, text) { return tag('table', attrs, subTags, text); },
    thead: function(attrs, subTags, text) { return tag('thead', attrs, subTags, text); },
    tbody: function(attrs, subTags, text) { return tag('tbody', attrs, subTags, text); },
    tr: function(attrs, subTags, text) { return tag('tr', attrs, subTags, text); },
    th: function(attrs, subTags, text) { return tag('th', attrs, subTags, text); },
    td: function(attrs, subTags, text) { return tag('td', attrs, subTags, text); },
    option: function(attrs, subTags, text) { return tag('option', attrs, subTags, text); },
    select: function(attrs, subTags, text) { return tag('select', attrs, subTags, text); },
    input: function(attrs, subTags, text) { return tag('input', attrs, subTags, text); },
    button: function(attrs, subTags, text) { return tag('button', attrs, subTags, text); },
    a: function(attrs, subTags, text) { return tag('a', attrs, subTags, text); },
};

exports.Tags = Tags;
exports.tag = tag;
exports.attr = attr;

},{}],7:[function(require,module,exports){
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

"use strict";

var m_client_forms_cellRenderer = require('client/forms/cellRenderer.js');
var m_timer = require('timer.js');

function LazyTable(cssId, functionObject) {
    this._cssId = cssId;
    this._countFunc = functionObject.count;
    this._fetchRowsFunc = functionObject.fetchRows; // async
    this._fetchTemplateRowFunc = functionObject.fetchTemplateRow; // async
    this._saveFieldFunc = functionObject.saveField;
    this._fetchedRows = [];
    this._headerCellRenderFunc = m_client_forms_cellRenderer.CellRenderer.renderHeaderCell;
    this._filterCellRenderFunc = m_client_forms_cellRenderer.CellRenderer.renderFilterCell;
    this._bodyCellRenderFunc = m_client_forms_cellRenderer.CellRenderer.renderBodyCell;
    this._shouldCheckScroll = true;

    this._rowWidth = 1000;
    this._scrollTimeoutMsec = 100;

    // largest possible div height:
    //      firefox - 17895697px
    //      chrome -- larger than ff!
    //      ie - 10737418px

    this._maxTableHeight = 10737418;
    this._lastScrollTop = null;
    this._lastScrollLeft = null;
    this._screenSizeGraceRows = 10;
    this._filters = [];
}

function lazyTable(cssId, functionObject) {
    return new LazyTable(cssId, functionObject);
}

LazyTable.prototype = {};
LazyTable.prototype.constructor = LazyTable;

LazyTable.prototype._fetchData = function(startIdx, count, callback) {
    this._fetchRowsFunc(startIdx, count, _(this._filters).values(), function(error, rows) { callback(startIdx, rows); });
};

LazyTable.prototype.render = function() {
    this._countRows(function(err, count) {
        this._count = count;
        this._fetchTemplateRow.bind(this)(this._afterFetchTemplateRow.bind(this))
    }.bind(this));
};

LazyTable.prototype._afterFetchTemplateRow = function(error, row) {
    var self = this;

    this._templateRow = row;
    this._viewportEl = jQuery('#' + this._cssId);
    this._viewportEl.addClass('viewport');
    jQuery(this._viewportEl).css({ height: '100%', position: 'relative', width: '100%', overflow: 'scroll' });
    jQuery(this._viewportEl).attr('id', 'viewport');
    var scrollFunc = function() { this._scrollTo(jQuery(this._viewportEl).scrollTop(), jQuery(this._viewportEl).scrollLeft()); }.bind(this);
    jQuery(this._viewportEl).scroll(scrollFunc);
    jQuery(this._viewportEl).resize(scrollFunc);
    this._tableEl = jQuery('<div/>').attr('id', 'table').css({ position: 'relative',  }).addClass('lazy-table');
    jQuery(this._viewportEl).append(this._tableEl);
    var inputDimensions = this._getDefaultInputDimensions(); // depends on tableEl!
    this._rowHeight = inputDimensions.height + 2;
    this._cellWidth = inputDimensions.width + 4;
    var count = this._count;
    this._heightIsOverflowed = (count * this._rowHeight > this._maxTableHeight);
    this._heightIsOverflowed = false;
    this._rowWidth = this._templateRow.fields.length * (this._cellWidth + 4);
    LazyTable.allWidths(this._tableEl, this._rowWidth);
    if ( this._heightIsOverflowed ) {
        LazyTable.allHeights(this._tableEl, this._maxTableHeight);
    } else {
        LazyTable.allHeights(this._tableEl, (this._rowHeight * (this._count + 1)));
    }

    this._renderHeaderRow();
    this._fetchData(0, this._viewportRows() + this._screenSizeGraceRows, function(startIdx, rows) {
        this._mergeFetchedRows(startIdx, rows);
        this._renderFilterRow();
        this._renderFetchedRows();
        this._renderInsertRow(); // TODO if insert allowed etc
        jQuery('input', this._tableEl)[0].focus();
    }.bind(this)); // TODO interface to outside for templaterow -- we need it now for code below

    jQuery(this._tableEl).change(function(ev) {
        var value;
        console.log('change', ev);
        var input = ev.target;
        var id = jQuery(input).attr('id');
        var parts = id.split('-');
        var type = parts[0];
        var name = parts[1];

        if ( type === 'edit' ) {
            var rowIdx = parts[2];
            var fieldIdx = parts[3];
            var field;
            if ( rowIdx === 'insert' ) {
                field = self._templateRow.fields[fieldIdx];
            } else {
                field = self._fetchedRows[rowIdx].fields[fieldIdx];
            }
            this._handleEditFieldChange(input, rowIdx, fieldIdx, field);
        } else if ( type === 'filter' ) {
            this._handleFilterFieldChange(input, name);
        }
    }.bind(this)).keydown(function(ev) {
        if ( ev.keyCode === 40 ) { // down
            var input = ev.target;
            var id = jQuery(input).attr('id');// todo abstract into func
            var parts = id.split('-');
            var name = parts[1];
            var rowIdx = window.parseInt(parts[2]);
            var fieldIdx = window.parseInt(parts[3]);
            if ( jQuery('#edit-' + name + '-' + (rowIdx + 1) + '-' + fieldIdx).length ) {
                jQuery('#edit-' + name + '-' + (rowIdx + 1) + '-' + fieldIdx).putCursorAtEnd();
            }
        } else if ( ev.keyCode === 38 ) { // up
            var input = ev.target;
            var id = jQuery(input).attr('id');// todo abstract into func
            var parts = id.split('-');
            var name = parts[1];
            var rowIdx = window.parseInt(parts[2]);
            var fieldIdx = window.parseInt(parts[3]);
            if ( jQuery('#edit-' + name + '-' + (rowIdx - 1) + '-' + fieldIdx).length ) {
                jQuery('#edit-' + name + '-' + (rowIdx - 1) + '-' + fieldIdx).putCursorAtEnd();
            }
        }
    });
};

LazyTable.prototype._handleEditFieldChange = function(input, rowIdx, fieldIdx, field) {
    var value = null;
    if ( jQuery(input).attr('type') === 'checkbox' ) {
        value = jQuery(input).prop('checked');
    } else {
        value = jQuery(input).val();
    }
    this._saveField.bind(this);
    this._saveField(field.name, this._createRow(rowIdx), function(err, resp) { 
        if ( resp.flags.hasSaved ) {
            if ( resp.flags.hasInserted ) {
                this._afterInsert();
            } else {
                this._afterUpdate(rowIdx, resp.row);
            }
        }
    }.bind(this));
};

LazyTable.prototype._handleFilterFieldChange = function(input, name) {
    console.log('handle filter field', input, name);
    this._filters[name] = { fieldName: name, value: jQuery(input).val(), opName: jQuery('#filter-' + name + '-op').val() };
    console.log('handle filter - filters', this._filters);
    this._fetchedRows = [];
    jQuery(this._tableEl).empty();
    this.render();
};

LazyTable.prototype._renderHeaderRow = function() {
    var headerRowCss = { 
            height: (this._rowHeight + 4) + 'px',
    };
    this._headerRowEl = jQuery('<div/>').attr('id', 'header-row').css(headerRowCss);
    LazyTable.allWidths(this._headerRowEl, this._rowWidth);
    jQuery(this._headerRowEl).addClass('header row');
    this._tableEl.append(this._headerRowEl);
    for (var i=0; i < this._templateRow.fields.length; ++i ) {
        var css = { 
                width: this._cellWidth + 'px',
                height: this._rowHeight + 'px',
        };
        var el = jQuery('<div/>').css(css).attr('id', 'header-cell-' + i);
        jQuery(el).css(css);
        jQuery(el).addClass('header cell');
        if ( i === this._templateRow.fields.length - 1 ) {
            jQuery(el).addClass('last');
        }
        jQuery(this._headerRowEl).append(el);
        this._headerCellRenderFunc(el, i, this._templateRow.fields[i]);
    }

    jQuery(this._headerRowEl).css({
        top: (jQuery(this._tableEl).offset().top),
        left: (jQuery(this._tableEl).offset().left)
    });
};

LazyTable.prototype._renderFilterRow = function() {
    console.log('will _renderFilterRow');
    var css = { 
            height: (this._rowHeight + 4) + 'px',
    };
    this._filterRowEl = jQuery('<div/>').attr('id', 'filter-row').css(css);
    LazyTable.allWidths(this._filterRowEl, this._rowWidth);
    jQuery(this._filterRowEl).addClass('filter row');
    jQuery(this._tableEl).append(this._filterRowEl);
    for (var i=0; i < this._templateRow.fields.length; ++i ) {
        var css = { 
                width: this._cellWidth + 'px',
                height: this._rowHeight + 'px',
        };
        var el = jQuery('<div/>').css(css).attr('id', 'filter-cell-' + i);
        jQuery(el).css(css);
        jQuery(el).addClass('filter cell');
        if ( i === this._templateRow.fields.length - 1 ) {
            jQuery(el).addClass('last');
        }
        jQuery(this._filterRowEl).append(el);
        this._filterCellRenderFunc(el, i, this._templateRow.fields[i]);
    }

    jQuery(this._filterRowEl).css({
        top: (jQuery(this._tableEl).offset().top + this._rowHeight + 4),
        left: (jQuery(this._tableEl).offset().left)
    });
};

LazyTable.prototype._fetchTemplateRow = function(callback) {
    return this._fetchTemplateRowFunc(callback);
};

LazyTable.prototype._countRows = function(callback) {
    return this._countFunc(_(this._filters).values(), callback);
};

LazyTable.prototype._saveField = function(fieldName, row, callback) {
    return this._saveFieldFunc(fieldName, row, callback);
};

/**
 * creates the row for saveField()
 */
LazyTable.prototype._createRow = function(rowIdx) {
    var tr = this._templateRow.fields;
    var row = { fields: {} };
    for ( var i = 0; i < tr.length; ++i ) {
        if ( rowIdx.toString() !== 'insert'.toString() || tr[i].name.toString() !== 'id'.toString() ) {
            var value = jQuery('#edit-' + tr[i].name + '-' + rowIdx + '-' + i).val();
            if ( typeof(value) !== 'undefined' && value.length > 0 ) {
                row.fields[tr[i].name] = value;
            } else {
                row.fields[tr[i].name] = undefined;
            }
        }
    }
    row.id = row.fields.id;
    return row;
};

LazyTable.prototype._viewportRows = function() {
    var height = jQuery(this._viewportEl).height();
    return Math.floor(height / this._rowHeight);
};

LazyTable.prototype._scrollTo = function(scrollTop, scrollLeft) {
    this._lastScrollTop = scrollTop;
    this._lastScrollLeft = scrollLeft;
    if ( this._shouldCheckScroll ) {
        this._shouldCheckScroll = false;
        window.setTimeout(function() {
            this._innerScrollTo(jQuery(this._viewportEl).scrollTop(), scrollLeft);
            this._shouldCheckScroll = true;
        }.bind(this), this._scrollTimeoutMsec);
    }

};

LazyTable.prototype._innerScrollTo = function(scrollTop, scrollLeft) {
    if ( this._lastScrollTop === scrollTop ) {
        var startIdx = Math.round(scrollTop / this._rowHeight);
        if (this._heightIsOverflowed ) {
            startIdx = Math.round(scrollTop / jQuery(this._tableEl).height() * this._count);
            if ( startIdx >= this._count * 0.9 ) {
                startIdx = this._count - this._viewportRows();
            }
        }
        var fetchStartIdx = Math.max(startIdx - this._screenSizeGraceRows, 0)
        var fetchCount = Math.min(this._viewportRows() + 2 * this._screenSizeGraceRows, this._count - fetchStartIdx) + 1;
        this._fetchData(fetchStartIdx, fetchCount, function(startIdx, rows) {
            this._mergeFetchedRows(startIdx, rows);
            (function(callback) {
                if ( this._heightIsOverflowed ) {
                    this._fetchData(this._count - fetchCount, fetchCount, callback);
                } else {
                    callback();
                }
            }.bind(this)(function() {
                this._renderFetchedRows(scrollLeft === this._lastScrollLeft);
                this._emptyCache(startIdx);
                this._renderInsertRow(); // TODO if...
            }.bind(this)));
        }.bind(this));
    } else {
        this._lastDifferentScrollTop = this._lastScrollTop;
    }
    if ( this._lastScrollLeft !== scrollLeft ) {
        this._lastDifferentScrollLeft = this._lastScrollLeft;
    }
    // TODO I have no clue why the following formula seems to work...!
    var headerLeft = ( jQuery(this._tableEl).offset().left - scrollLeft / (2 * this._templateRow.fields.length * this._templateRow.fields.length) );
    jQuery(this._headerRowEl).css({ left: headerLeft + 'px' });
};

LazyTable.prototype._emptyCache = function(startIdx) {
    var i;
    var count = this._count;
    var startBlockEnd = 2 * this._viewportRows();
    var endBlockStart = Math.max(0, this._count - 2 * this._viewportRows());
    var keepStart = Math.max(0, Math.min(startIdx - 2 * this._screenSizeGraceRows));
    var keepEnd = Math.min(this._count, startIdx + this._viewportRows() + 2 * this._screenSizeGraceRows);
    for (i = 0; i < keepStart; ++i) {
        delete this._fetchedRows[i];
        jQuery('#row-' + i).remove();
    }
    for (i = keepEnd; i < count; ++i) {
        delete this._fetchedRows[i];
        jQuery('#row-' + i).remove();
    }
};


LazyTable.prototype._renderFetchedRows = function(doFocusAfterwards) {
    if ( typeof(doFocusAfterwards) === 'undefined') {
        doFocusAfterwards = false;
    }
    var rows = this._fetchedRows;
    var rowsLength = this._count;
    var rowIdx, fieldIdx;
    m_timer.Timer.start('_renderFetchedRows');
    var activeElId = jQuery(window.document.activeElement).attr('id');
    for ( rowIdx = 0; rowIdx  < rowsLength; ++rowIdx ) {
        if ( typeof(rows[rowIdx]) !== 'undefined' ) {
            var row = rows[rowIdx];
            this._renderRow(rowIdx, row);
        }
    }
    if ( doFocusAfterwards && jQuery('#' + activeElId).length > 0 && this._isElementVisible(jQuery('#' + activeElId)) && false ) {
        jQuery('#' + activeElId).focus();
    }
    m_timer.Timer.end('_renderFetchedRows');
    m_timer.Timer.log('_renderFetchedRows');
}

LazyTable.prototype._renderRow = function(rowIdx, row) {
    console.log('will render row', row, 'rowIdx', rowIdx);
    var fields = row.fields;
    var fieldsLength =fields.length;
    var topPx;
    if ( rowIdx === 'insert' ) { // TODO ahem
        topPx = (5 + (this._count + 2) * this._rowHeight) + 'px';
    } else {
        topPx = (5 + (rowIdx + 2) * this._rowHeight) + 'px';
    }
    if ( this._heightIsOverflowed && rowIdx >= this._count * 0.9) {
        topPx = (5 + jQuery(this._tableEl).height() - ((this._count - rowIdx + 1) * this._rowHeight)) + 'px';
    }
    var rowCss = { 
            top: topPx,
            left: 0,
            position: 'absolute',
            overflow: 'hidden'
    };

    var rowDiv = jQuery('<div/>').attr('id', 'row-' + rowIdx);
    rowDiv.css(rowCss);
    LazyTable.allWidths(rowDiv, this._rowWidth);
    LazyTable.allHeights(rowDiv, this._rowHeight);
    if ( jQuery('#row-' + rowIdx).length ) {
        jQuery('#row-' + rowIdx).replaceWith(rowDiv);
    } else {
        jQuery(this._tableEl).append(rowDiv);
    }
    var tableWidth = jQuery(this._viewportEl).width();
    var fieldIdx = 0;
    var lastEl = null;
    var vEl = jQuery(this._viewportEl);
    var vElWidth = vEl.width();
    while ( fieldIdx === 0 || (fieldIdx > 0 && fieldIdx < fieldsLength && lastEl.offsetLeft <= vEl.scrollLeft() + vElWidth) ) {
        lastEl = this._renderCell(rowDiv[0], rowIdx, fieldIdx, fields[fieldIdx]);
        ++fieldIdx;
    }
};

LazyTable.prototype._renderInsertRow = function() {
    this._renderRow('insert', this._templateRow);
};

LazyTable.prototype._renderCell = function(rowDiv, rowIdx, fieldIdx, field) {
    var css = { 
    };
    var div = window.document.createElement('div');
    div.setAttribute('id', 'cell-' + rowIdx + '-' + fieldIdx);
    var divClass = 'body cell';
    if ( fieldIdx === this._templateRow.fields.length - 1 ) {
        divClass += ' last';
    }
    if ( rowIdx % 2 === 0 ) {
        divClass += ' even';
    } else {
        divClass += ' odd';
    }
    if ( field.isEditable ) {
        divClass += ' editable';
    }
    div.setAttribute('class', divClass);
    div.style.width = this._cellWidth + 'px';
    div.style.height = this._rowHeight + 'px';
    rowDiv.appendChild(div);
    this._bodyCellRenderFunc(div, rowIdx, fieldIdx, field);
    return div;
};

LazyTable.prototype._mergeFetchedRows = function(startIdx, rows) {
    for ( var i = 0; i < rows.length; ++i ) { // TODO optimize
        this._fetchedRows[startIdx + i] = rows[i];
    }
};

LazyTable.prototype._getDefaultInputDimensions = function() {
    var input = jQuery('<input type="text"/>');
    jQuery(this._tableEl).append(input);
    var rv= { width: jQuery(input).width(), height: jQuery(input).height() };
    jQuery(input).remove();
    return rv;
};

LazyTable.prototype._isElementVisible = function(elm, evalType) {
    evalType = evalType || "visible";

    var vpH = jQuery(window).height(), // Viewport Height
        st = jQuery(window).scrollTop(), // Scroll Top
        y = jQuery(elm).offset().top,
        elementHeight = jQuery(elm).height();

    if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
    if (evalType === "above") return ((y < (vpH + st)));
}

LazyTable.prototype._afterInsert = function(row) {
    this._renderFetchedRows(true);
    this._renderInsertRow();
};

LazyTable.prototype._afterUpdate = function(rowIdx, row) {
    this._fetchedRows[rowIdx] = row;
    this._renderFetchedRows(true);
    this._renderInsertRow();
};

/////////////////////////

/*
 * static functions, default renderers...
 */

LazyTable.allWidths = function(el, width) {
    jQuery(el).css({ 'min-width': width + 'px', 'width': width + 'px', 'max-width': width  + 'px'});
};

LazyTable.allHeights = function(el, height) {
    jQuery(el).css({ 'min-height': height + 'px', 'height': height + 'px', 'max-height': height  + 'px'});
};

exports.LazyTable = LazyTable;
exports.lazyTable = lazyTable;

},{"client/forms/cellRenderer.js":2,"timer.js":10}],8:[function(require,module,exports){
var m_ui = require('client/UI.js');

window.loadUI = function(cssId, baseUrl, data) {
    jQuery.ajax(baseUrl + '/' + [ 'client', 'formRouter', 'byRoute' ].join('/'), {
        method: 'get',
        data: data,
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function(routerData) {
            console.log('loaduinew success routerData', routerData, 'data', data);
                var ui = m_ui.ui();
                ui.displayForm(cssId, routerData.formName, data);
        }
    });
};

},{"client/UI.js":1}],9:[function(require,module,exports){
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

"use strict";

var m_client_forms_cellRenderer = require('client/forms/cellRenderer.js');

function SingleRowTable(cssId, row, saveFieldFunc) {
    this._cssId = cssId;
    this._row = row;
    this._headerCellRenderFunc = m_client_forms_cellRenderer.CellRenderer.renderHeaderCell;
    this._bodyCellRenderFunc = m_client_forms_cellRenderer.CellRenderer.renderBodyCell;
    this._saveFieldFunc = saveFieldFunc;
}

function singleRowTable(cssId, row, saveFieldFunc) {
    return new SingleRowTable(cssId, row, saveFieldFunc);
}

SingleRowTable.prototype = {};
SingleRowTable.prototype.constructor = SingleRowTable;

/**
 * initial rendering
 */
SingleRowTable.prototype.render = function() {
    var self = this;
    this._tableEl = jQuery('#' + this._cssId);
    this._tableEl.attr('id', 'table').css({ position: 'relative',  }).addClass('single-row-table');
    this._renderRow();
    this._selectFirstInput();

    jQuery(this._tableEl).change(function(ev) {
        var value;
        console.log('change', ev);
        var input = ev.target;
        var id = jQuery(input).attr('id');
        var parts = id.split('-');
        var fieldIdx = parts[3];

        console.log('change, input id parts fieldIdx', input, id, parts, fieldIdx);

        var field = self._row.fields[fieldIdx];

        if ( jQuery(input).attr('type') === 'checkbox' ) {
            value = jQuery(input).prop('checked');
        } else {
            value = jQuery(input).val();
        }
        self._saveField.bind(self);
        self._saveField(field.name, self._createRow(), function(err, resp) { 
            console.log(resp);
            if ( resp.flags.hasSaved ) {
                if ( resp.flags.hasInserted ) {
                    self._afterInsert();
                } else {
                    self._afterUpdate(resp.row);
                }
            }
        }.bind(self));
    }).keydown(function(ev) {
        console.log(ev.target, ev);
        if ( ev.keyCode === 40 ) { // down
            var input = ev.target;
            var id = jQuery(input).attr('id');// todo abstract into func
            var parts = id.split('-');
            var name = parts[1];
            var fieldIdx = window.parseInt(parts[2]);
            if ( jQuery('#edit-' + name + '-' + fieldIdx).length > 0 ) {
                jQuery('#edit-' + name + '-' + fieldIdx).putCursorAtEnd();
            }
        } else if ( ev.keyCode === 38 ) { // up
            var input = ev.target;
            var id = jQuery(input).attr('id');// todo abstract into func
            var parts = id.split('-');
            var name = parts[1];
            var fieldIdx = window.parseInt(parts[2]);
            if ( jQuery('#edit-' + name + '-' + fieldIdx).length ) {
                jQuery('#edit-' + name + '-' + fieldIdx).putCursorAtEnd();
            }
        }
    });
};

SingleRowTable.prototype._saveField = function(fieldName, row, callback) {
    return this._saveFieldFunc(fieldName, row, callback);
};

/**
 * creates the row for saveField()
 */
SingleRowTable.prototype._createRow = function() {
    var tr = this._row.fields;
    var row = { fields: {} };
    for ( var i = 0; i < tr.length; ++i ) {
        var value = jQuery('#edit-' + tr[i].name + '-undefined-' + i).val();
        if ( typeof(value) !== 'undefined' && value.length > 0 ) {
            row.fields[tr[i].name] = value;
        } else {
            row.fields[tr[i].name] = undefined;
        }
    }
    row.id = row.fields.id;
    return row;
};

SingleRowTable.prototype._renderRow = function(doFocusAfterwards) {
    if ( typeof(doFocusAfterwards) === 'undefined') {
        doFocusAfterwards = false;
    }
    var rowIdx, fieldIdx;
    var activeElId = jQuery(window.document.activeElement).attr('id');
    console.log('rendering', this._row);
    jQuery(this._tableEl).empty();
    var fields = this._row.fields;
    var fieldsLength =fields.length;

    for ( fieldIdx = 0; fieldIdx < fieldsLength; ++fieldIdx ) {
        var trDiv = jQuery('<div/>').addClass('single-row');
        var thDiv = jQuery('<div/>').attr('id', 'header-cell-' + fieldIdx);
        jQuery(thDiv).addClass('header cell');
        var tdDiv = jQuery('<div/>').addClass('single-body');

        this._headerCellRenderFunc(thDiv, undefined, fields[fieldIdx]);
        this._renderCell(tdDiv, fieldIdx, fields[fieldIdx]);

        jQuery(trDiv).append(thDiv);
        jQuery(trDiv).append(tdDiv);
        jQuery(this._tableEl).append(trDiv);
    }
    jQuery('#' + activeElId).focus();
}

SingleRowTable.prototype._renderCell = function(tdDiv, fieldIdx, field) {
    // console.log('_renderCell', rowIdx, fieldIdx);
    var css = { 
    };
    var div = jQuery('<div/>');
    div.attr('id', 'cell-' + fieldIdx);
    var divClass = 'body cell';
    if ( fieldIdx === this._row.fields.length - 1 ) {
        divClass += ' last';
    }
    if ( fieldIdx % 2 === 0 ) {
        divClass += ' even';
    } else {
        divClass += ' odd';
    }
    if ( field.isEditable ) {
        divClass += ' editable';
    }
    div.addClass(divClass);
    /*
    div.style.width = this._cellWidth + 'px';
    div.style.height = this._rowHeight + 'px';
    */
    jQuery(tdDiv).append(div);
    this._bodyCellRenderFunc(div, undefined, fieldIdx, field);
    return div;
};

SingleRowTable.prototype._mergeFetchedRows = function(startIdx, rows) {
    for ( var i = 0; i < rows.length; ++i ) { // TODO optimize
        //console.log('merge', startIdx + i);
        this._fetchedRows[startIdx + i] = rows[i];
    }
};

SingleRowTable.prototype._getDefaultInputDimensions = function() {
    var input = jQuery('<input type="text"/>');
    jQuery(this._tableEl).append(input);
    var rv= { width: jQuery(input).width(), height: jQuery(input).height() };
    jQuery(input).remove();
    return rv;
};

SingleRowTable.prototype._isElementVisible = function(elm, evalType) {
    evalType = evalType || "visible";

    var vpH = jQuery(window).height(), // Viewport Height
        st = jQuery(window).scrollTop(), // Scroll Top
        y = jQuery(elm).offset().top,
        elementHeight = jQuery(elm).height();

    if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
    if (evalType === "above") return ((y < (vpH + st)));
}

SingleRowTable.prototype._afterInsert = function(row) {
    console.log('handle insert row', row);
    this._renderFetchedRow(true);
    this._renderInsertRow();
};

SingleRowTable.prototype._afterUpdate = function(row) {
    console.log('handle update row', row);
    this._row = row;
    this._renderRow(true);
};

SingleRowTable.prototype._selectFirstInput = function() {
    var inputs = jQuery('input', this._tableEl);
    if ( inputs.length > 0 ) inputs[0].focus();
};

/*
 * static functions, default renderers...
 */

SingleRowTable.allWidths = function(el, width) {
    jQuery(el).css({ 'min-width': width + 'px', 'width': width + 'px', 'max-width': width  + 'px'});
};

SingleRowTable.allHeights = function(el, height) {
    jQuery(el).css({ 'min-height': height + 'px', 'height': height + 'px', 'max-height': height  + 'px'});
};

exports.SingleRowTable = SingleRowTable;
exports.singleRowTable = singleRowTable;

},{"client/forms/cellRenderer.js":2}],10:[function(require,module,exports){
Timer = {
    times: {},
    start: function(name) {
        Timer.times[name] = { start: new Date(), end: null, diffMsec: null };
    },
    end: function(name) {
        var time = Timer.times[name];
        time.end = new Date();
        time.diffMsec = time.end - time.start;
    },
    log: function(name) {
        var time = Timer.times[name];
        console.log('Timer', name, 'diffMsec', time.diffMsec);
    }
};

exports.Timer = Timer;

},{}],11:[function(require,module,exports){
/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
 *
 * BJO2 is free software; you can redistribute it and/or modify
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

var _ = require('underscore');

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function isString(s) { return (s instanceof String || typeof(s) === 'string') }

function isInEnum(value, enumeration) { 
            return _(_(enumeration).values()).contains(value);
}

function stringEqual(s1, s2) { return s1.toString() === s2.toString(); }

exports.guid = guid;
exports.isString = isString;
exports.isInEnum = isInEnum;

},{"underscore":12}],12:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9ub2RlX21vZHVsZXMvY2xpZW50L1VJLmpzIiwianMvbm9kZV9tb2R1bGVzL2NsaWVudC9mb3Jtcy9jZWxsUmVuZGVyZXIuanMiLCJqcy9ub2RlX21vZHVsZXMvY2xpZW50L2Zvcm1zL2VkaXRGb3JtLmpzIiwianMvbm9kZV9tb2R1bGVzL2NsaWVudC9mb3Jtcy9mb3JtLmpzIiwianMvbm9kZV9tb2R1bGVzL2NsaWVudC9mb3Jtcy9saXN0Rm9ybS5qcyIsImpzL25vZGVfbW9kdWxlcy9jbGllbnQvaHRtbC5qcyIsImpzL25vZGVfbW9kdWxlcy9jbGllbnQvbGF6eVRhYmxlLmpzIiwianMvbm9kZV9tb2R1bGVzL2NsaWVudC9tYWluLmpzIiwianMvbm9kZV9tb2R1bGVzL2NsaWVudC9zaW5nbGVSb3dUYWJsZS5qcyIsImpzL25vZGVfbW9kdWxlcy90aW1lci5qcyIsImpzL25vZGVfbW9kdWxlcy91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBNYXBpdG9yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKiB3ZSByZXF1aXJlKCkgb3VyIGZvcm1zIGhlcmUgc28gdWkuanMgY2FuIGJlIG91ciBlbnRyeSBwb2ludCBmb3JcclxuICogYnJvd3NlcmlmeVxyXG4gKi9cclxudmFyIG1fY2xpZW50X2Zvcm1zX2VkaXRGb3JtID0gcmVxdWlyZSgnY2xpZW50L2Zvcm1zL2VkaXRGb3JtLmpzJyk7XHJcbnZhciBtX2NsaWVudF9mb3Jtc19saXN0Rm9ybSA9IHJlcXVpcmUoJ2NsaWVudC9mb3Jtcy9saXN0Rm9ybS5qcycpO1xyXG5cclxuZnVuY3Rpb24gVUkoKSB7XHJcbn07XHJcblxyXG5mdW5jdGlvbiB1aSgpIHtcclxuICAgIHJldHVybiBuZXcgVUkoKTtcclxufVxyXG5cclxuXHJcblVJLnByb3RvdHlwZSA9IHt9O1xyXG5VSS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBVSTtcclxuXHJcbi8qKlxyXG4gKiBmb3JtTmFtZSBpcyBcImVkaXRGb3JtXCIsIG5vdCBFZGl0Rm9ybSFcclxuICovXHJcblVJLnByb3RvdHlwZS5kaXNwbGF5Rm9ybSA9IGZ1bmN0aW9uKGNzc0lkLCBmb3JtTmFtZSwgZGF0YSkge1xyXG4gICAgdmFyIGZvcm0gPSBudWxsLCBmb3JtQ29uc3RydWN0b3IgPSBudWxsO1xyXG4gICAgc3dpdGNoICggZm9ybU5hbWUgKSB7IC8vIFRPRE8gZ2VuZXJpemlzZSB0aGlzXHJcbiAgICAgICAgY2FzZSAnZWRpdEZvcm0nOlxyXG4gICAgICAgICAgICBmb3JtQ29uc3RydWN0b3IgPSBtX2NsaWVudF9mb3Jtc19lZGl0Rm9ybS5lZGl0Rm9ybTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbGlzdEZvcm0nOlxyXG4gICAgICAgICAgICBmb3JtQ29uc3RydWN0b3I9IG1fY2xpZW50X2Zvcm1zX2xpc3RGb3JtLmxpc3RGb3JtO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIHN1Y2ggZm9ybSBhcyAnICsgZm9ybU5hbWUpO1xyXG4gICAgfVxyXG4gICAgZGF0YS5mb3JtID0gZm9ybU5hbWU7XHJcbiAgICBmb3JtID0gZm9ybUNvbnN0cnVjdG9yLmNhbGwoe30sIGRhdGEsIGNzc0lkKTtcclxuXHJcbiAgICB2YXIgaHRtbCA9IGZvcm0udG9IdG1sKCk7XHJcbiAgICBqUXVlcnkoJyMnICsgY3NzSWQpLmh0bWwoaHRtbCk7XHJcbn07XHJcblxyXG5leHBvcnRzLlVJID0gVUk7XHJcbmV4cG9ydHMudWkgPSB1aTtcclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBNYXBpdG9yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgbV9jbGllbnRfaHRtbCA9IHJlcXVpcmUoJ2NsaWVudC9odG1sLmpzJyk7XHJcblxyXG5mdW5jdGlvbiBDZWxsUmVuZGVyZXIoKSB7fVxyXG5cclxuQ2VsbFJlbmRlcmVyLkVkaXRhYmxlID0gZnVuY3Rpb24oKSB7fVxyXG5cclxuQ2VsbFJlbmRlcmVyLk5vbkVkaXRhYmxlID0gZnVuY3Rpb24oKSB7fVxyXG5cclxuQ2VsbFJlbmRlcmVyLnJlbmRlckhlYWRlckNlbGwgPSBmdW5jdGlvbihlbCwgZmllbGRJZHgsIGZpZWxkKSB7XHJcbiAgICBqUXVlcnkoZWwpLmh0bWwoZmllbGQubGFiZWwpO1xyXG59O1xyXG5cclxuQ2VsbFJlbmRlcmVyLnJlbmRlckZpbHRlckNlbGwgPSBmdW5jdGlvbihlbCwgZmllbGRJZHgsIGZpZWxkKSB7XHJcbiAgICB2YXIgb3B0cyA9IFsgeyAndmFsdWUnOiAnZXEnLCAndGV4dCc6ICc9JyB9LCB7ICd2YWx1ZSc6ICduZScsICd0ZXh0JzogJzw+JyB9IF07XHJcbiAgICB2YXIgaHRtbCA9IG1fY2xpZW50X2h0bWwuVGFncy5zZWxlY3QoeyBpZDogJ2ZpbHRlci0nICsgZmllbGQubmFtZSArICctb3AnICwgJ2NsYXNzJzogJ2ZpbHRlci1vcCcgfSwgXHJcbiAgICAgICAgICAgIF8ob3B0cykubWFwKGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gbV9jbGllbnRfaHRtbC5UYWdzLm9wdGlvbih7IHZhbHVlOiBvcHQudmFsdWV9LCBbXSwgb3B0LnRleHQpOyB9KVxyXG4gICAgKSArIG1fY2xpZW50X2h0bWwuVGFncy5pbnB1dCh7IGlkOiAnZmlsdGVyLScgKyBmaWVsZC5uYW1lICsgJy12YWx1ZScsIHR5cGU6ICd0ZXh0JywgJ2NsYXNzJzogJ2ZpbHRlci12YWx1ZScgfSk7XHJcbiAgICBqUXVlcnkoZWwpLmh0bWwoaHRtbCk7XHJcbn07XHJcblxyXG5DZWxsUmVuZGVyZXIuZmllbGRWYWx1ZVN0cmluZyA9IGZ1bmN0aW9uKHYpIHsgcmV0dXJuIHYgPT09IG51bGwgPyAnJyA6IHY7IH1cclxuXHJcbkNlbGxSZW5kZXJlci5yZW5kZXJCb2R5Q2VsbCA9IGZ1bmN0aW9uKGVsLCByb3dJZHgsIGZpZWxkSWR4LCBmaWVsZCkge1xyXG4gICAgdmFyIG1hdHJpeExpbmUgPSBfKENlbGxSZW5kZXJlci5Cb2R5Q2VsbFJlbmRlcmluZ01hdHJpeCkuZmluZChmdW5jdGlvbihkZXNjKSB7XHJcbiAgICAgICAgdmFyIHJ2ID0gKCBkZXNjLmlzRWRpdGFibGUgPT09IGZpZWxkLmlzRWRpdGFibGUgfHwgZGVzYy5pc0VkaXRhYmxlID09PSBudWxsIClcclxuICAgICAgICAgICAgJiYgKCBkZXNjLmNsYXNzTmFtZSA9PT0gbnVsbCB8fCBkZXNjLmNsYXNzTmFtZS50b1N0cmluZygpID09PSBmaWVsZC5jbGFzc05hbWUudG9TdHJpbmcoKSApXHJcbiAgICAgICAgICAgICYmICggZGVzYy5kYXRhVHlwZSA9PT0gZmllbGQuZGF0YVR5cGUgfHwgZGVzYy5kYXRhVHlwZSA9PT0gbnVsbCk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtYXRyaXggZmluZCcsIGZpZWxkLm5hbWUsIGRlc2MsIHJ2KTtcclxuICAgICAgICByZXR1cm4gcnY7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoIHR5cGVvZihtYXRyaXhMaW5lKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignbWF0cml4TGluZSBub3QgZm91bmQnLCBmaWVsZCk7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtYXRyaXhMaW5lIG5vdCBmb3VuZCBmb3IgZmllbGQgJyArIGZpZWxkLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgaWYgKCBtYXRyaXhMaW5lLmZ1bmMgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdtYXRyaXhMaW5lIGZ1bmMgaXMgdW5kZWY6JywgZmllbGQsIG1hdHJpeExpbmUpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbWF0cml4TGluZSBmdW5jIGlzIHVuZGVmJyArIGZpZWxkLm5hbWUpO1xyXG4gICAgfVxyXG4gICAgdmFyIGlucHV0ID0gbWF0cml4TGluZS5mdW5jLmJpbmQodGhpcykoZWwsIHJvd0lkeCwgZmllbGRJZHgsIGZpZWxkKTtcclxufTtcclxuXHJcbkNlbGxSZW5kZXJlci5FZGl0YWJsZS5yZW5kZXJTdHJpbmdGaWVsZCA9IGZ1bmN0aW9uKGVsLCByb3dJZHgsIGZpZWxkSWR4LCBmaWVsZCkge1xyXG4gICAgdmFyIGlucHV0ID0galF1ZXJ5KCc8aW5wdXQgdHlwZT1cInRleHRcIiBpZD1cIicgKyBDZWxsUmVuZGVyZXIuX2dldEZpZWxkSWQocm93SWR4LCBmaWVsZElkeCwgZmllbGQpICsgJ1wiIG5hbWU9XCInICsgZmllbGQubmFtZSArICdcIiB2YWx1ZT1cIicgKyBDZWxsUmVuZGVyZXIuZmllbGRWYWx1ZVN0cmluZyhmaWVsZC52YWx1ZSkgKyAnXCIgLz4nKTtcclxuICAgIGpRdWVyeShpbnB1dCkuYWRkQ2xhc3MoJ2VkaXQnKTtcclxuICAgIGpRdWVyeShlbCkuYXBwZW5kKGlucHV0KTtcclxuICAgIHJldHVybiBpbnB1dDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBhbHNvIGhhbmRsZXMgbm9uZWRpdGFibGVcclxuICovXHJcbkNlbGxSZW5kZXJlci5FZGl0YWJsZS5yZW5kZXJCb29sRmllbGQgPSBmdW5jdGlvbihlbCwgcm93SWR4LCBmaWVsZElkeCwgZmllbGQpIHtcclxuICAgIHZhciBpbm5lciA9IGpRdWVyeSgnPGRpdi8+Jyk7XHJcbiAgICBpbm5lci5hZGRDbGFzcygnYm9vbCcpO1xyXG4gICAgdmFyIGlucHV0ID0galF1ZXJ5KCc8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCInICsgQ2VsbFJlbmRlcmVyLl9nZXRGaWVsZElkKHJvd0lkeCwgZmllbGRJZHgsIGZpZWxkKSArICdcIiBuYW1lPVwiJyArIGZpZWxkLm5hbWUgKyAnXCIgdmFsdWU9XCIxXCInICsgKGZpZWxkLnZhbHVlID8gJyBjaGVja2VkPVwiY2hlY2tlZFwiJyA6ICcnICkrICcgLz4nKTtcclxuICAgIGlubmVyLmFwcGVuZChpbnB1dCk7XHJcbiAgICBpZiAoICFmaWVsZC5pc0VkaXRhYmxlICkge1xyXG4gICAgICAgIGpRdWVyeShpbnB1dCkuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcclxuICAgIH1cclxuICAgIGpRdWVyeShlbCkuYXBwZW5kKGlubmVyKTtcclxuICAgIHJldHVybiBpbnB1dDtcclxufTtcclxuXHJcbkNlbGxSZW5kZXJlci5FZGl0YWJsZS5yZW5kZXJFbnVtRmllbGQgPSBmdW5jdGlvbihlbCwgcm93SWR4LCBmaWVsZElkeCwgZmllbGQpIHtcclxuICAgIHZhciBpbm5lciA9IGpRdWVyeSgnPGRpdi8+Jyk7XHJcbiAgICBpbm5lci5hZGRDbGFzcygnZW51bScpO1xyXG4gICAgdmFyIGh0bWwgPSAnPHNlbGVjdCBpZD1cIicgKyBDZWxsUmVuZGVyZXIuX2dldEZpZWxkSWQocm93SWR4LCBmaWVsZElkeCwgZmllbGQpICsgJ1wiIG5hbWU9XCInICsgZmllbGQubmFtZSArICdcIj4nO1xyXG4gICAgaHRtbCArPSBfKGZpZWxkLm9wdGlvbnMpLm1hcChmdW5jdGlvbihvKSB7IFxyXG4gICAgICAgIHJldHVybiAnPG9wdGlvbiB2YWx1ZT1cIicgKyBvLnZhbHVlICsgJ1wiJyArIChmaWVsZC52YWx1ZSA9PT0gby52YWx1ZSA/ICcgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIG8ubGFiZWwgKyAnPC9vcHRpb24+JzsgXHJcbiAgICB9KS5qb2luKCcnKTtcclxuICAgIGlubmVyLmh0bWwoaHRtbCk7XHJcblxyXG4gICAgalF1ZXJ5KGVsKS5hcHBlbmQoaW5uZXIpO1xyXG4gICAgcmV0dXJuIGpRdWVyeSgnIycgKyBDZWxsUmVuZGVyZXIuX2dldEZpZWxkSWQocm93SWR4LCBmaWVsZElkeCwgZmllbGQpKTtcclxufTtcclxuXHJcblxyXG5cclxuQ2VsbFJlbmRlcmVyLk5vbkVkaXRhYmxlLnJlbmRlclN0cmluZ0ZpZWxkID0gZnVuY3Rpb24oZWwsIHJvd0lkeCwgZmllbGRJZHgsIGZpZWxkKSB7XHJcbiAgICBqUXVlcnkoZWwpLmh0bWwoZmllbGQudmFsdWUpO1xyXG59O1xyXG5cclxuQ2VsbFJlbmRlcmVyLk5vbkVkaXRhYmxlLnJlbmRlck51bWJlckZpZWxkID0gZnVuY3Rpb24oZWwsIHJvd0lkeCwgZmllbGRJZHgsIGZpZWxkKSB7XHJcbiAgICB2YXIgaW5uZXIgPSBqUXVlcnkoJzxkaXYvPicpO1xyXG4gICAgaW5uZXIuaHRtbChmaWVsZC52YWx1ZSk7XHJcbiAgICBpbm5lci5hZGRDbGFzcygnbnVtYmVyJyk7XHJcbiAgICBqUXVlcnkoZWwpLmFwcGVuZChpbm5lcik7XHJcbn07XHJcblxyXG5DZWxsUmVuZGVyZXIuX2dldEZpZWxkSWQgPSBmdW5jdGlvbihyb3dJZHgsIGZpZWxkSWR4LCBmaWVsZCkge1xyXG4gICAgcmV0dXJuICdlZGl0LScgKyBmaWVsZC5uYW1lICsgJy0nICsgcm93SWR4ICsgJy0nICsgZmllbGRJZHg7XHJcbn07XHJcblxyXG5DZWxsUmVuZGVyZXIuQm9keUNlbGxSZW5kZXJpbmdNYXRyaXggPSBbXHJcbiAgICB7IGlzRWRpdGFibGU6IHRydWUsIGNsYXNzTmFtZTogJ0ZpZWxkJywgZGF0YVR5cGU6ICdzdHJpbmcnLCBmdW5jOiBDZWxsUmVuZGVyZXIuRWRpdGFibGUucmVuZGVyU3RyaW5nRmllbGQgfSxcclxuICAgIHsgaXNFZGl0YWJsZTogdHJ1ZSwgY2xhc3NOYW1lOiAnRmllbGQnLCBkYXRhVHlwZTogJ2ludCcsIGZ1bmM6IENlbGxSZW5kZXJlci5FZGl0YWJsZS5yZW5kZXJTdHJpbmdGaWVsZCB9LFxyXG4gICAgeyBpc0VkaXRhYmxlOiB0cnVlLCBjbGFzc05hbWU6ICdGaWVsZCcsIGRhdGFUeXBlOiAnaW50JywgZnVuYzogQ2VsbFJlbmRlcmVyLkVkaXRhYmxlLnJlbmRlclN0cmluZ0ZpZWxkIH0sXHJcbiAgICB7IGlzRWRpdGFibGU6IHRydWUsIGNsYXNzTmFtZTogJ0VudW1GaWVsZCcsIGRhdGFUeXBlOiBudWxsLCBmdW5jOiBDZWxsUmVuZGVyZXIuRWRpdGFibGUucmVuZGVyRW51bUZpZWxkIH0sXHJcbiAgICB7IGlzRWRpdGFibGU6IG51bGwsIGNsYXNzTmFtZTogJ0ZpZWxkJywgZGF0YVR5cGU6ICdib29sJywgZnVuYzogQ2VsbFJlbmRlcmVyLkVkaXRhYmxlLnJlbmRlckJvb2xGaWVsZCB9LFxyXG4gICAgeyBpc0VkaXRhYmxlOiBmYWxzZSwgY2xhc3NOYW1lOiAnRmllbGQnLCBkYXRhVHlwZTogJ3N0cmluZycsIGZ1bmM6IENlbGxSZW5kZXJlci5Ob25FZGl0YWJsZS5yZW5kZXJTdHJpbmdGaWVsZCB9LFxyXG4gICAgeyBpc0VkaXRhYmxlOiBmYWxzZSwgY2xhc3NOYW1lOiAnRmllbGQnLCBkYXRhVHlwZTogJ2ludCcsIGZ1bmM6IENlbGxSZW5kZXJlci5Ob25FZGl0YWJsZS5yZW5kZXJOdW1iZXJGaWVsZCB9LFxyXG4gICAgeyBpc0VkaXRhYmxlOiB0cnVlLCBjbGFzc05hbWU6IG51bGwsIGRhdGFUeXBlOiBudWxsLCBmdW5jOiBDZWxsUmVuZGVyZXIuRWRpdGFibGUucmVuZGVyU3RyaW5nRmllbGQgfSwgLy8gZmFsbGJhY2tcclxuICAgIHsgaXNFZGl0YWJsZTogbnVsbCwgY2xhc3NOYW1lOiBudWxsLCBkYXRhVHlwZTogbnVsbCwgZnVuYzogQ2VsbFJlbmRlcmVyLk5vbkVkaXRhYmxlLnJlbmRlclN0cmluZ0ZpZWxkIH0sIC8vIGZhbGxiYWNrXHJcbiAgICAvLyBUT0RPOiBkYXRlLCAodGltZSksIG9wdGlvbnMsIGxvb2t1cFxyXG5dO1xyXG5cclxuZXhwb3J0cy5DZWxsUmVuZGVyZXIgPSBDZWxsUmVuZGVyZXI7XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNSwyMDE2IENocmlzdGlhbiBGcmllZGwgPE1hZy5DaHJpc3RpYW4uRnJpZWRsQGdtYWlsLmNvbT5cclxuICpcclxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQkpPMi5cclxuICpcclxuICogTWFwaXRvciBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XHJcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXHJcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxyXG4gKlxyXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcclxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcclxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxyXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxyXG4gKlxyXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxyXG4gKiBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbTsgaWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxyXG4gKi9cclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxudmFyIG1fY2xpZW50X3NpbmdsZVJvd1RhYmxlID0gcmVxdWlyZSgnY2xpZW50L3NpbmdsZVJvd1RhYmxlLmpzJyk7XHJcbnZhciBtX2NsaWVudF9mb3Jtc19mb3JtID0gcmVxdWlyZSgnY2xpZW50L2Zvcm1zL2Zvcm0uanMnKTtcclxuXHJcbmZ1bmN0aW9uIEVkaXRGb3JtKGRhdGEsIGNzc0lkKSB7XHJcbiAgICBtX2NsaWVudF9mb3Jtc19mb3JtLkZvcm0uY2FsbCh0aGlzLCBkYXRhLCBjc3NJZCk7XHJcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcclxuICAgIHRoaXMuX2Nzc0lkID0gY3NzSWQ7XHJcbiAgICBjb25zb2xlLmxvZygnZWYgZGF0YScsIGRhdGEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBlZGl0Rm9ybShkYXRhLCBjc3NJZCkgeyByZXR1cm4gbmV3IEVkaXRGb3JtKGRhdGEsIGNzc0lkKTsgfVxyXG5cclxuRWRpdEZvcm0ucHJvdG90eXBlID0gbmV3IG1fY2xpZW50X2Zvcm1zX2Zvcm0uRm9ybSgpO1xyXG5FZGl0Rm9ybS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBFZGl0Rm9ybTtcclxuXHJcbkVkaXRGb3JtLnByb3RvdHlwZS50b0h0bWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZmV0Y2hSb3codGhpcy5fZGF0YS5pZCwgZnVuY3Rpb24oZXJyLCByb3cpIHtcclxuICAgICAgICB0aGlzLl9kYXRhLnJvdyA9IHJvdztcclxuICAgICAgICB2YXIgdGFibGUgPSBuZXcgbV9jbGllbnRfc2luZ2xlUm93VGFibGUuU2luZ2xlUm93VGFibGUodGhpcy5fY3NzSWQsIHRoaXMuX2RhdGEucm93LCB0aGlzLmdldFNhdmVGaWVsZEZ1bmMoKSk7XHJcbiAgICAgICAgdGFibGUucmVuZGVyKCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuRWRpdEZvcm0ucHJvdG90eXBlLmNvdW50Um93cyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZmV0Y2hVcmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICdjb3VudCddLmpvaW4oJy8nKTtcclxuICAgIHZhciBkYXRhID0geyBjb25kaXRpb25zOiB7fSB9O1xyXG4gICAgalF1ZXJ5LmFqYXgoe1xyXG4gICAgICAgIHR5cGU6ICdQT1NUJywgXHJcbiAgICAgICAgdXJsOiBmZXRjaFVybCxcclxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2hSb3dzIHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YS5jb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5FZGl0Rm9ybS5wcm90b3R5cGUuZmV0Y2hSb3cgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcclxuICAgIHZhciBmZXRjaFVybCA9ICcvJyArIFsgdGhpcy5fZGF0YS5tb2R1bGUsIHRoaXMuX2RhdGEuY29udHJvbGxlciwgJ2VkaXQnXS5qb2luKCcvJyk7XHJcbiAgICB2YXIgZGF0YSA9IHsgaWQ6IGlkIH07XHJcbiAgICBjb25zb2xlLmxvZygnZmV0Y2hyb3cgc2VuZHMgZGF0YScsIGRhdGEsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgIGpRdWVyeS5hamF4KHtcclxuICAgICAgICB0eXBlOiAnR0VUJywgXHJcbiAgICAgICAgdXJsOiBmZXRjaFVybCxcclxuICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaFJvd3Mgc3VjY2Vzc3MsIGdvdCBkYXRhJywgZGF0YSk7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGZhbHNlLCBkYXRhLnJvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5FZGl0Rm9ybS5wcm90b3R5cGUuZmV0Y2hUZW1wbGF0ZVJvdyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZmV0Y2hVcmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICd0ZW1wbGF0ZVJvdyddLmpvaW4oJy8nKTtcclxuICAgIGpRdWVyeS5hamF4KHtcclxuICAgICAgICB0eXBlOiAnUE9TVCcsIFxyXG4gICAgICAgIHVybDogZmV0Y2hVcmwsXHJcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoe30pLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaFRlbXBsYXRlUm93IHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5FZGl0Rm9ybS5wcm90b3R5cGUuc2F2ZUZpZWxkID0gZnVuY3Rpb24oZmllbGROYW1lLCByb3csIGNhbGxiYWNrKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbGlzdGZvcm0gd2lsbCBzYXZlRmllbGQnKTtcclxuICAgIHZhciB1cmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICdzYXZlRmllbGQnXS5qb2luKCcvJyk7XHJcbiAgICB2YXIgZGF0YSA9IHsgZmllbGROYW1lOiBmaWVsZE5hbWUsIHJvdzogcm93IH07XHJcbiAgICBqUXVlcnkuYWpheCh7XHJcbiAgICAgICAgdHlwZTogJ1BPU1QnLCBcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2F2ZUZpZWxkIHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5FZGl0Rm9ybS5wcm90b3R5cGUuZ2V0U2F2ZUZpZWxkRnVuYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2F2ZUZpZWxkLmJpbmQodGhpcyk7XHJcbn07XHJcblxyXG5leHBvcnRzLkVkaXRGb3JtID0gRWRpdEZvcm07XHJcbmV4cG9ydHMuZWRpdEZvcm0gPSBlZGl0Rm9ybTtcclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBNYXBpdG9yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgbV91dGlsID0gcmVxdWlyZSgndXRpbC5qcycpO1xyXG5cclxuZnVuY3Rpb24gRm9ybShkYXRhLCBjc3NJZCkge1xyXG4gICAgdGhpcy5faWQgPSBtX3V0aWwuZ3VpZCgpO1xyXG5cclxuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xyXG4gICAgdGhpcy5fY3NzSWQgPSBjc3NJZDtcclxuICAgIGlmICggdHlwZW9mKHdpbmRvdy5CSk8yKSA9PT0gJ3VuZGVmaW5lZCcgKSB7XHJcbiAgICAgICAgd2luZG93LkJKTzIgPSB7IGZvcm1zOiB7fSB9O1xyXG4gICAgfVxyXG4gICAgaWYgKCB0eXBlb2Yod2luZG93LkJKTzIuZm9ybXNbdGhpcy5faWRdKSAhPT0gJ3VuZGVmaW5lZCcgKSB7IGNvbnNvbGUubG9nKCdub251Jywgd2luZG93LkJKTzIuZm9ybXNbdGhpcy5faWRdKTsgdGhyb3cgbmV3IEVycm9yKCdpZCBub3QgdW5pcXVlJyk7IH1cclxuICAgIHdpbmRvdy5CSk8yLmZvcm1zW3RoaXMuX2lkXSA9IHRoaXM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm0oZGF0YSwgY3NzSWQpIHtcclxuICAgIHJldHVybiBuZXcgRm9ybShkYXRhLCBjc3NJZCk7XHJcbn1cclxuXHJcbkZvcm0ucHJvdG90eXBlID0ge307XHJcbkZvcm0ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRm9ybTtcclxuXHJcbkZvcm0ucHJvdG90eXBlLl90aGlzRm9ybUh0bWwgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiAnd2luZG93LkJKTzIuZm9ybXNbXFwnJyArIHRoaXMuX2lkICsgJ1xcJ10nO1xyXG59O1xyXG5cclxuRm9ybS5PcGVuTG9va3VwU2NyaXB0ID0gZnVuY3Rpb24oZGF0YSwgY3NzSWQpIHtcclxuICAgIEZvcm0uY2FsbCh0aGlzLCBkYXRhLCBjc3NJZCk7XHJcbn07XHJcblxyXG5Gb3JtLk9wZW5Mb29rdXBTY3JpcHQucHJvdG90eXBlLnRvSHRtbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIGBcclxuICAgICAgICA8c2NyaXB0PlxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvcGVuTG9va3VwUG9wdXAoaGlkZGVuRmllbGRJZCwgb3B0aW9uc0pzb24sIG1vZHVsZSwgY29udHJvbGxlcikge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBKU09OLnBhcnNlKG9wdGlvbnNKc29uKTtcclxuICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxzZWxlY3QgaWQ9XCJsb29rdXAtc2VsZWN0LScgKyBoaWRkZW5GaWVsZElkICsgJ1wiPidcclxuICAgICAgICAgICAgICAgICAgICArICc8b3B0aW9uPnNlbGVjdC4uLjwvb3B0aW9uPidcclxuICAgICAgICAgICAgICAgICAgICArIF8oXyhvcHRpb25zKS5rZXlzKCkpLnJlZHVjZShmdW5jdGlvbihtZW1vLCBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW8gKyAnPG9wdGlvbiB2YWx1ZT1cIicgKyBrZXkgKyAnXCI+JyArIG9wdGlvbnNba2V5XSArICc8L29wdGlvbj4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgKyAnPC9zZWxlY3Q+JztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2xvb2t1cFBvcHVwJykuaHRtbChodG1sKS5kaWFsb2coKTtcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2xvb2t1cC1zZWxlY3QtJyArIGhpZGRlbkZpZWxkSWQpLmNoYW5nZShmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGpRdWVyeSh0aGlzKSwgalF1ZXJ5KHRoaXMpLnZhbCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyMnICsgaGlkZGVuRmllbGRJZCkudmFsKGpRdWVyeSh0aGlzKS52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjbG9va3VwUG9wdXAnKS5kaWFsb2coJ2Nsb3NlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgTGlzdEZvcm0uaGFuZGxlRmllbGRDaGFuZ2UoJ2AgKyB0aGlzLl9jc3NJZCArIGAnLCBoaWRkZW5GaWVsZElkLCBtb2R1bGUsIGNvbnRyb2xsZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICA8L3NjcmlwdD5cclxuICAgIGA7XHJcbn07XHJcblxyXG5leHBvcnRzLkZvcm0gPSBGb3JtO1xyXG5leHBvcnRzLmZvcm0gPSBmb3JtO1xyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUsMjAxNiBDaHJpc3RpYW4gRnJpZWRsIDxNYWcuQ2hyaXN0aWFuLkZyaWVkbEBnbWFpbC5jb20+XHJcbiAqXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJKTzIuXHJcbiAqXHJcbiAqIE1hcGl0b3IgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxyXG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xyXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cclxuICpcclxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXHJcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcclxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICpcclxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcclxuICogYWxvbmcgd2l0aCB0aGlzIHByb2dyYW07IGlmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBtX2NsaWVudF9sYXp5VGFibGUgPSByZXF1aXJlKCdjbGllbnQvbGF6eVRhYmxlLmpzJyk7XHJcbnZhciBtX2NsaWVudF9mb3Jtc19mb3JtID0gcmVxdWlyZSgnY2xpZW50L2Zvcm1zL2Zvcm0uanMnKTtcclxudmFyIG1fY2xpZW50X2h0bWwgPSByZXF1aXJlKCdjbGllbnQvaHRtbC5qcycpO1xyXG5cclxuLyogcHJpdmF0ZSBjb25zdHJ1Y3RvciwgdXNlIHRoaXMgZm9yIHR5cGVjaGVja3Mgb25seSAqL1xyXG5mdW5jdGlvbiBMaXN0Rm9ybShkYXRhLCBjc3NJZCkge1xyXG4gICAgbV9jbGllbnRfZm9ybXNfZm9ybS5Gb3JtLmNhbGwodGhpcywgZGF0YSwgY3NzSWQpO1xyXG4gICAgdGhpcy5fbGF6eVRhYmxlID0gbV9jbGllbnRfbGF6eVRhYmxlLmxhenlUYWJsZShjc3NJZCwgdGhpcy5nZXRGdW5jdGlvbk9iamVjdCgpKTtcclxufVxyXG5cclxuLyogcHVibGljIGNvbnN0cnVjdG9yLCBhbHdheXMgdXNlIHRoaXMgKi9cclxuZnVuY3Rpb24gbGlzdEZvcm0oZGF0YSwgY3NzSWQpIHtcclxuICAgIHJldHVybiBuZXcgTGlzdEZvcm0oZGF0YSwgY3NzSWQpO1xyXG59XHJcblxyXG5MaXN0Rm9ybS5wcm90b3R5cGUgPSBuZXcgbV9jbGllbnRfZm9ybXNfZm9ybS5Gb3JtKCk7XHJcbkxpc3RGb3JtLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpc3RGb3JtO1xyXG5cclxuTGlzdEZvcm0ucHJvdG90eXBlLnRvSHRtbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG1fY2xpZW50X2h0bWwuVGFncy5zY3JpcHQoeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9LCBbXSwgYFxyXG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkgeyBcclxuICAgICAgICAgICAgICAgIHZhciB0YWJsZSA9IGAgKyB0aGlzLl90aGlzRm9ybUh0bWwoKSArIGAuX2xhenlUYWJsZTtcclxuICAgICAgICAgICAgICAgIHRhYmxlLnJlbmRlcigpO1xyXG4gICAgICAgICAgICB9KTtgKTtcclxuIH07XHJcblxyXG5MaXN0Rm9ybS5wcm90b3R5cGUuZ2V0RnVuY3Rpb25PYmplY3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgJ2NvdW50JzogdGhpcy5jb3VudFJvd3MuYmluZCh0aGlzKSxcclxuICAgICAgICAnZmV0Y2hUZW1wbGF0ZVJvdyc6IHRoaXMuZmV0Y2hUZW1wbGF0ZVJvdy5iaW5kKHRoaXMpLFxyXG4gICAgICAgICdmZXRjaFJvd3MnOiB0aGlzLmZldGNoUm93cy5iaW5kKHRoaXMpLFxyXG4gICAgICAgICdzYXZlRmllbGQnOiB0aGlzLnNhdmVGaWVsZC5iaW5kKHRoaXMpLFxyXG4gICAgfVxyXG59O1xyXG5cclxuTGlzdEZvcm0ucHJvdG90eXBlLmNvdW50Um93cyA9IGZ1bmN0aW9uKGZpbHRlcnMsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZmV0Y2hVcmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICdjb3VudCddLmpvaW4oJy8nKTtcclxuICAgIHZhciBkYXRhID0geyBjb25kaXRpb25zOiB7fSB9O1xyXG4gICAgalF1ZXJ5LmFqYXgoe1xyXG4gICAgICAgIHR5cGU6ICdQT1NUJywgXHJcbiAgICAgICAgdXJsOiBmZXRjaFVybCxcclxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmV0Y2hSb3dzIHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YS5jb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5MaXN0Rm9ybS5wcm90b3R5cGUuZmV0Y2hSb3dzID0gZnVuY3Rpb24ob2Zmc2V0LCBsaW1pdCwgZmlsdGVycywgY2FsbGJhY2spIHtcclxuICAgIHZhciBmZXRjaFVybCA9ICcvJyArIFsgdGhpcy5fZGF0YS5tb2R1bGUsIHRoaXMuX2RhdGEuY29udHJvbGxlciwgJ2xpc3QnXS5qb2luKCcvJyk7XHJcbiAgICB2YXIgZGF0YSA9IHsgY29uZGl0aW9uczogeyBsaW1pdDogbGltaXQsIG9mZnNldDogb2Zmc2V0LCBmaWx0ZXJzOiBmaWx0ZXJzIH0gfTtcclxuICAgIGpRdWVyeS5hamF4KHtcclxuICAgICAgICB0eXBlOiAnUE9TVCcsIFxyXG4gICAgICAgIHVybDogZmV0Y2hVcmwsXHJcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZldGNoUm93cyBzdWNjZXNzcywgZ290IGRhdGEnLCBkYXRhKTtcclxuICAgICAgICAgICAgY2FsbGJhY2soZmFsc2UsIGRhdGEucm93cyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5MaXN0Rm9ybS5wcm90b3R5cGUuZmV0Y2hUZW1wbGF0ZVJvdyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgZmV0Y2hVcmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICd0ZW1wbGF0ZVJvdyddLmpvaW4oJy8nKTtcclxuICAgIGpRdWVyeS5hamF4KHtcclxuICAgICAgICB0eXBlOiAnUE9TVCcsIFxyXG4gICAgICAgIHVybDogZmV0Y2hVcmwsXHJcbiAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoe30pLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXHJcbiAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmZXRjaFRlbXBsYXRlUm93IHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5MaXN0Rm9ybS5wcm90b3R5cGUuc2F2ZUZpZWxkID0gZnVuY3Rpb24oZmllbGROYW1lLCByb3csIGNhbGxiYWNrKSB7XHJcbiAgICBjb25zb2xlLmxvZygnbGlzdGZvcm0gd2lsbCBzYXZlRmllbGQnKTtcclxuICAgIHZhciB1cmwgPSAnLycgKyBbIHRoaXMuX2RhdGEubW9kdWxlLCB0aGlzLl9kYXRhLmNvbnRyb2xsZXIsICdzYXZlRmllbGQnXS5qb2luKCcvJyk7XHJcbiAgICB2YXIgZGF0YSA9IHsgZmllbGROYW1lOiBmaWVsZE5hbWUsIHJvdzogcm93IH07XHJcbiAgICBqUXVlcnkuYWpheCh7XHJcbiAgICAgICAgdHlwZTogJ1BPU1QnLCBcclxuICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc2F2ZUZpZWxkIHN1Y2Nlc3NzLCBnb3QgZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICBjYWxsYmFjayhmYWxzZSwgZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5leHBvcnRzLkxpc3RGb3JtID0gTGlzdEZvcm07XHJcbmV4cG9ydHMubGlzdEZvcm0gPSBsaXN0Rm9ybTtcclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBNYXBpdG9yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5mdW5jdGlvbiBhdHRyKG5hbWUsIHZhbHVlKSB7XHJcbiAgICByZXR1cm4geyBuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWUgfTtcclxufVxyXG5cclxuLypcclxuICogb3B0aW9uYWwgb2JqZWN0IGF0dHJzXHJcbiAqIG9wdGlvbmFsIGFycmF5IHN1YlRhZ3NcclxuICogb3B0aW9uYWwgc3RyaW5nIHRleHRcclxuICovXHJcbmZ1bmN0aW9uIHRhZyhuYW1lLCBhdHRycywgc3ViVGFncywgdGV4dCkge1xyXG4gICAgaWYgKCB0eXBlb2Yoc3ViVGFncykgPT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICAgIHN1YlRhZ3MgPSB7fTtcclxuICAgIH1cclxuICAgIGlmICggdHlwZW9mKHRleHQpID09PSAndW5kZWZpbmVkJyApIHtcclxuICAgICAgICB0ZXh0ID0gJyc7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJzwnICsgbmFtZVxyXG4gICAgICAgICtfKF8oYXR0cnMpLmtleXMoKSkucmVkdWNlKGZ1bmN0aW9uKG1lbW8sIG5hbWUpIHsgcmV0dXJuIG1lbW8gKyAnICcgKyBuYW1lICsgJz1cIicgKyBhdHRyc1tuYW1lXSArICdcIic7IH0sICcnKVxyXG4gICAgICAgICsgJz4nXHJcbiAgICAgICAgKyBfKHN1YlRhZ3MpLnJlZHVjZShmdW5jdGlvbihtZW1vLCB0ZXh0KSB7IHJldHVybiBtZW1vICsgdGV4dDsgfSwgJycpXHJcbiAgICAgICAgKyB0ZXh0XHJcbiAgICAgICAgKyAnPC8nICsgbmFtZSArICc+JztcclxufVxyXG5cclxudmFyIFRhZ3MgPSB7XHJcbiAgICBmb3JtOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCdmb3JtJywgYXR0cnMsIHN1YlRhZ3MsIHRleHQpOyB9LFxyXG4gICAgZGl2OiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCdkaXYnLCBhdHRycywgc3ViVGFncywgdGV4dCk7IH0sXHJcbiAgICBzY3JpcHQ6IGZ1bmN0aW9uKGF0dHJzLCBzdWJUYWdzLCB0ZXh0KSB7IHJldHVybiB0YWcoJ3NjcmlwdCcsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRhYmxlOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0YWJsZScsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRoZWFkOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0aGVhZCcsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRib2R5OiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0Ym9keScsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRyOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0cicsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRoOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0aCcsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIHRkOiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCd0ZCcsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIG9wdGlvbjogZnVuY3Rpb24oYXR0cnMsIHN1YlRhZ3MsIHRleHQpIHsgcmV0dXJuIHRhZygnb3B0aW9uJywgYXR0cnMsIHN1YlRhZ3MsIHRleHQpOyB9LFxyXG4gICAgc2VsZWN0OiBmdW5jdGlvbihhdHRycywgc3ViVGFncywgdGV4dCkgeyByZXR1cm4gdGFnKCdzZWxlY3QnLCBhdHRycywgc3ViVGFncywgdGV4dCk7IH0sXHJcbiAgICBpbnB1dDogZnVuY3Rpb24oYXR0cnMsIHN1YlRhZ3MsIHRleHQpIHsgcmV0dXJuIHRhZygnaW5wdXQnLCBhdHRycywgc3ViVGFncywgdGV4dCk7IH0sXHJcbiAgICBidXR0b246IGZ1bmN0aW9uKGF0dHJzLCBzdWJUYWdzLCB0ZXh0KSB7IHJldHVybiB0YWcoJ2J1dHRvbicsIGF0dHJzLCBzdWJUYWdzLCB0ZXh0KTsgfSxcclxuICAgIGE6IGZ1bmN0aW9uKGF0dHJzLCBzdWJUYWdzLCB0ZXh0KSB7IHJldHVybiB0YWcoJ2EnLCBhdHRycywgc3ViVGFncywgdGV4dCk7IH0sXHJcbn07XHJcblxyXG5leHBvcnRzLlRhZ3MgPSBUYWdzO1xyXG5leHBvcnRzLnRhZyA9IHRhZztcclxuZXhwb3J0cy5hdHRyID0gYXR0cjtcclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBNYXBpdG9yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG52YXIgbV9jbGllbnRfZm9ybXNfY2VsbFJlbmRlcmVyID0gcmVxdWlyZSgnY2xpZW50L2Zvcm1zL2NlbGxSZW5kZXJlci5qcycpO1xyXG52YXIgbV90aW1lciA9IHJlcXVpcmUoJ3RpbWVyLmpzJyk7XHJcblxyXG5mdW5jdGlvbiBMYXp5VGFibGUoY3NzSWQsIGZ1bmN0aW9uT2JqZWN0KSB7XHJcbiAgICB0aGlzLl9jc3NJZCA9IGNzc0lkO1xyXG4gICAgdGhpcy5fY291bnRGdW5jID0gZnVuY3Rpb25PYmplY3QuY291bnQ7XHJcbiAgICB0aGlzLl9mZXRjaFJvd3NGdW5jID0gZnVuY3Rpb25PYmplY3QuZmV0Y2hSb3dzOyAvLyBhc3luY1xyXG4gICAgdGhpcy5fZmV0Y2hUZW1wbGF0ZVJvd0Z1bmMgPSBmdW5jdGlvbk9iamVjdC5mZXRjaFRlbXBsYXRlUm93OyAvLyBhc3luY1xyXG4gICAgdGhpcy5fc2F2ZUZpZWxkRnVuYyA9IGZ1bmN0aW9uT2JqZWN0LnNhdmVGaWVsZDtcclxuICAgIHRoaXMuX2ZldGNoZWRSb3dzID0gW107XHJcbiAgICB0aGlzLl9oZWFkZXJDZWxsUmVuZGVyRnVuYyA9IG1fY2xpZW50X2Zvcm1zX2NlbGxSZW5kZXJlci5DZWxsUmVuZGVyZXIucmVuZGVySGVhZGVyQ2VsbDtcclxuICAgIHRoaXMuX2ZpbHRlckNlbGxSZW5kZXJGdW5jID0gbV9jbGllbnRfZm9ybXNfY2VsbFJlbmRlcmVyLkNlbGxSZW5kZXJlci5yZW5kZXJGaWx0ZXJDZWxsO1xyXG4gICAgdGhpcy5fYm9keUNlbGxSZW5kZXJGdW5jID0gbV9jbGllbnRfZm9ybXNfY2VsbFJlbmRlcmVyLkNlbGxSZW5kZXJlci5yZW5kZXJCb2R5Q2VsbDtcclxuICAgIHRoaXMuX3Nob3VsZENoZWNrU2Nyb2xsID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLl9yb3dXaWR0aCA9IDEwMDA7XHJcbiAgICB0aGlzLl9zY3JvbGxUaW1lb3V0TXNlYyA9IDEwMDtcclxuXHJcbiAgICAvLyBsYXJnZXN0IHBvc3NpYmxlIGRpdiBoZWlnaHQ6XHJcbiAgICAvLyAgICAgIGZpcmVmb3ggLSAxNzg5NTY5N3B4XHJcbiAgICAvLyAgICAgIGNocm9tZSAtLSBsYXJnZXIgdGhhbiBmZiFcclxuICAgIC8vICAgICAgaWUgLSAxMDczNzQxOHB4XHJcblxyXG4gICAgdGhpcy5fbWF4VGFibGVIZWlnaHQgPSAxMDczNzQxODtcclxuICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSBudWxsO1xyXG4gICAgdGhpcy5fbGFzdFNjcm9sbExlZnQgPSBudWxsO1xyXG4gICAgdGhpcy5fc2NyZWVuU2l6ZUdyYWNlUm93cyA9IDEwO1xyXG4gICAgdGhpcy5fZmlsdGVycyA9IFtdO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsYXp5VGFibGUoY3NzSWQsIGZ1bmN0aW9uT2JqZWN0KSB7XHJcbiAgICByZXR1cm4gbmV3IExhenlUYWJsZShjc3NJZCwgZnVuY3Rpb25PYmplY3QpO1xyXG59XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlID0ge307XHJcbkxhenlUYWJsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMYXp5VGFibGU7XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9mZXRjaERhdGEgPSBmdW5jdGlvbihzdGFydElkeCwgY291bnQsIGNhbGxiYWNrKSB7XHJcbiAgICB0aGlzLl9mZXRjaFJvd3NGdW5jKHN0YXJ0SWR4LCBjb3VudCwgXyh0aGlzLl9maWx0ZXJzKS52YWx1ZXMoKSwgZnVuY3Rpb24oZXJyb3IsIHJvd3MpIHsgY2FsbGJhY2soc3RhcnRJZHgsIHJvd3MpOyB9KTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9jb3VudFJvd3MoZnVuY3Rpb24oZXJyLCBjb3VudCkge1xyXG4gICAgICAgIHRoaXMuX2NvdW50ID0gY291bnQ7XHJcbiAgICAgICAgdGhpcy5fZmV0Y2hUZW1wbGF0ZVJvdy5iaW5kKHRoaXMpKHRoaXMuX2FmdGVyRmV0Y2hUZW1wbGF0ZVJvdy5iaW5kKHRoaXMpKVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX2FmdGVyRmV0Y2hUZW1wbGF0ZVJvdyA9IGZ1bmN0aW9uKGVycm9yLCByb3cpIHtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICB0aGlzLl90ZW1wbGF0ZVJvdyA9IHJvdztcclxuICAgIHRoaXMuX3ZpZXdwb3J0RWwgPSBqUXVlcnkoJyMnICsgdGhpcy5fY3NzSWQpO1xyXG4gICAgdGhpcy5fdmlld3BvcnRFbC5hZGRDbGFzcygndmlld3BvcnQnKTtcclxuICAgIGpRdWVyeSh0aGlzLl92aWV3cG9ydEVsKS5jc3MoeyBoZWlnaHQ6ICcxMDAlJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIHdpZHRoOiAnMTAwJScsIG92ZXJmbG93OiAnc2Nyb2xsJyB9KTtcclxuICAgIGpRdWVyeSh0aGlzLl92aWV3cG9ydEVsKS5hdHRyKCdpZCcsICd2aWV3cG9ydCcpO1xyXG4gICAgdmFyIHNjcm9sbEZ1bmMgPSBmdW5jdGlvbigpIHsgdGhpcy5fc2Nyb2xsVG8oalF1ZXJ5KHRoaXMuX3ZpZXdwb3J0RWwpLnNjcm9sbFRvcCgpLCBqUXVlcnkodGhpcy5fdmlld3BvcnRFbCkuc2Nyb2xsTGVmdCgpKTsgfS5iaW5kKHRoaXMpO1xyXG4gICAgalF1ZXJ5KHRoaXMuX3ZpZXdwb3J0RWwpLnNjcm9sbChzY3JvbGxGdW5jKTtcclxuICAgIGpRdWVyeSh0aGlzLl92aWV3cG9ydEVsKS5yZXNpemUoc2Nyb2xsRnVuYyk7XHJcbiAgICB0aGlzLl90YWJsZUVsID0galF1ZXJ5KCc8ZGl2Lz4nKS5hdHRyKCdpZCcsICd0YWJsZScpLmNzcyh7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCAgfSkuYWRkQ2xhc3MoJ2xhenktdGFibGUnKTtcclxuICAgIGpRdWVyeSh0aGlzLl92aWV3cG9ydEVsKS5hcHBlbmQodGhpcy5fdGFibGVFbCk7XHJcbiAgICB2YXIgaW5wdXREaW1lbnNpb25zID0gdGhpcy5fZ2V0RGVmYXVsdElucHV0RGltZW5zaW9ucygpOyAvLyBkZXBlbmRzIG9uIHRhYmxlRWwhXHJcbiAgICB0aGlzLl9yb3dIZWlnaHQgPSBpbnB1dERpbWVuc2lvbnMuaGVpZ2h0ICsgMjtcclxuICAgIHRoaXMuX2NlbGxXaWR0aCA9IGlucHV0RGltZW5zaW9ucy53aWR0aCArIDQ7XHJcbiAgICB2YXIgY291bnQgPSB0aGlzLl9jb3VudDtcclxuICAgIHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCA9IChjb3VudCAqIHRoaXMuX3Jvd0hlaWdodCA+IHRoaXMuX21heFRhYmxlSGVpZ2h0KTtcclxuICAgIHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5fcm93V2lkdGggPSB0aGlzLl90ZW1wbGF0ZVJvdy5maWVsZHMubGVuZ3RoICogKHRoaXMuX2NlbGxXaWR0aCArIDQpO1xyXG4gICAgTGF6eVRhYmxlLmFsbFdpZHRocyh0aGlzLl90YWJsZUVsLCB0aGlzLl9yb3dXaWR0aCk7XHJcbiAgICBpZiAoIHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCApIHtcclxuICAgICAgICBMYXp5VGFibGUuYWxsSGVpZ2h0cyh0aGlzLl90YWJsZUVsLCB0aGlzLl9tYXhUYWJsZUhlaWdodCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIExhenlUYWJsZS5hbGxIZWlnaHRzKHRoaXMuX3RhYmxlRWwsICh0aGlzLl9yb3dIZWlnaHQgKiAodGhpcy5fY291bnQgKyAxKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3JlbmRlckhlYWRlclJvdygpO1xyXG4gICAgdGhpcy5fZmV0Y2hEYXRhKDAsIHRoaXMuX3ZpZXdwb3J0Um93cygpICsgdGhpcy5fc2NyZWVuU2l6ZUdyYWNlUm93cywgZnVuY3Rpb24oc3RhcnRJZHgsIHJvd3MpIHtcclxuICAgICAgICB0aGlzLl9tZXJnZUZldGNoZWRSb3dzKHN0YXJ0SWR4LCByb3dzKTtcclxuICAgICAgICB0aGlzLl9yZW5kZXJGaWx0ZXJSb3coKTtcclxuICAgICAgICB0aGlzLl9yZW5kZXJGZXRjaGVkUm93cygpO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlckluc2VydFJvdygpOyAvLyBUT0RPIGlmIGluc2VydCBhbGxvd2VkIGV0Y1xyXG4gICAgICAgIGpRdWVyeSgnaW5wdXQnLCB0aGlzLl90YWJsZUVsKVswXS5mb2N1cygpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTsgLy8gVE9ETyBpbnRlcmZhY2UgdG8gb3V0c2lkZSBmb3IgdGVtcGxhdGVyb3cgLS0gd2UgbmVlZCBpdCBub3cgZm9yIGNvZGUgYmVsb3dcclxuXHJcbiAgICBqUXVlcnkodGhpcy5fdGFibGVFbCkuY2hhbmdlKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgdmFyIHZhbHVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdjaGFuZ2UnLCBldik7XHJcbiAgICAgICAgdmFyIGlucHV0ID0gZXYudGFyZ2V0O1xyXG4gICAgICAgIHZhciBpZCA9IGpRdWVyeShpbnB1dCkuYXR0cignaWQnKTtcclxuICAgICAgICB2YXIgcGFydHMgPSBpZC5zcGxpdCgnLScpO1xyXG4gICAgICAgIHZhciB0eXBlID0gcGFydHNbMF07XHJcbiAgICAgICAgdmFyIG5hbWUgPSBwYXJ0c1sxXTtcclxuXHJcbiAgICAgICAgaWYgKCB0eXBlID09PSAnZWRpdCcgKSB7XHJcbiAgICAgICAgICAgIHZhciByb3dJZHggPSBwYXJ0c1syXTtcclxuICAgICAgICAgICAgdmFyIGZpZWxkSWR4ID0gcGFydHNbM107XHJcbiAgICAgICAgICAgIHZhciBmaWVsZDtcclxuICAgICAgICAgICAgaWYgKCByb3dJZHggPT09ICdpbnNlcnQnICkge1xyXG4gICAgICAgICAgICAgICAgZmllbGQgPSBzZWxmLl90ZW1wbGF0ZVJvdy5maWVsZHNbZmllbGRJZHhdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmllbGQgPSBzZWxmLl9mZXRjaGVkUm93c1tyb3dJZHhdLmZpZWxkc1tmaWVsZElkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlRWRpdEZpZWxkQ2hhbmdlKGlucHV0LCByb3dJZHgsIGZpZWxkSWR4LCBmaWVsZCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZSA9PT0gJ2ZpbHRlcicgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUZpbHRlckZpZWxkQ2hhbmdlKGlucHV0LCBuYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpLmtleWRvd24oZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICBpZiAoIGV2LmtleUNvZGUgPT09IDQwICkgeyAvLyBkb3duXHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IGV2LnRhcmdldDtcclxuICAgICAgICAgICAgdmFyIGlkID0galF1ZXJ5KGlucHV0KS5hdHRyKCdpZCcpOy8vIHRvZG8gYWJzdHJhY3QgaW50byBmdW5jXHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGlkLnNwbGl0KCctJyk7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gcGFydHNbMV07XHJcbiAgICAgICAgICAgIHZhciByb3dJZHggPSB3aW5kb3cucGFyc2VJbnQocGFydHNbMl0pO1xyXG4gICAgICAgICAgICB2YXIgZmllbGRJZHggPSB3aW5kb3cucGFyc2VJbnQocGFydHNbM10pO1xyXG4gICAgICAgICAgICBpZiAoIGpRdWVyeSgnI2VkaXQtJyArIG5hbWUgKyAnLScgKyAocm93SWR4ICsgMSkgKyAnLScgKyBmaWVsZElkeCkubGVuZ3RoICkge1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZWRpdC0nICsgbmFtZSArICctJyArIChyb3dJZHggKyAxKSArICctJyArIGZpZWxkSWR4KS5wdXRDdXJzb3JBdEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICggZXYua2V5Q29kZSA9PT0gMzggKSB7IC8vIHVwXHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IGV2LnRhcmdldDtcclxuICAgICAgICAgICAgdmFyIGlkID0galF1ZXJ5KGlucHV0KS5hdHRyKCdpZCcpOy8vIHRvZG8gYWJzdHJhY3QgaW50byBmdW5jXHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGlkLnNwbGl0KCctJyk7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gcGFydHNbMV07XHJcbiAgICAgICAgICAgIHZhciByb3dJZHggPSB3aW5kb3cucGFyc2VJbnQocGFydHNbMl0pO1xyXG4gICAgICAgICAgICB2YXIgZmllbGRJZHggPSB3aW5kb3cucGFyc2VJbnQocGFydHNbM10pO1xyXG4gICAgICAgICAgICBpZiAoIGpRdWVyeSgnI2VkaXQtJyArIG5hbWUgKyAnLScgKyAocm93SWR4IC0gMSkgKyAnLScgKyBmaWVsZElkeCkubGVuZ3RoICkge1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZWRpdC0nICsgbmFtZSArICctJyArIChyb3dJZHggLSAxKSArICctJyArIGZpZWxkSWR4KS5wdXRDdXJzb3JBdEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9oYW5kbGVFZGl0RmllbGRDaGFuZ2UgPSBmdW5jdGlvbihpbnB1dCwgcm93SWR4LCBmaWVsZElkeCwgZmllbGQpIHtcclxuICAgIHZhciB2YWx1ZSA9IG51bGw7XHJcbiAgICBpZiAoIGpRdWVyeShpbnB1dCkuYXR0cigndHlwZScpID09PSAnY2hlY2tib3gnICkge1xyXG4gICAgICAgIHZhbHVlID0galF1ZXJ5KGlucHV0KS5wcm9wKCdjaGVja2VkJyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhbHVlID0galF1ZXJ5KGlucHV0KS52YWwoKTtcclxuICAgIH1cclxuICAgIHRoaXMuX3NhdmVGaWVsZC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5fc2F2ZUZpZWxkKGZpZWxkLm5hbWUsIHRoaXMuX2NyZWF0ZVJvdyhyb3dJZHgpLCBmdW5jdGlvbihlcnIsIHJlc3ApIHsgXHJcbiAgICAgICAgaWYgKCByZXNwLmZsYWdzLmhhc1NhdmVkICkge1xyXG4gICAgICAgICAgICBpZiAoIHJlc3AuZmxhZ3MuaGFzSW5zZXJ0ZWQgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hZnRlckluc2VydCgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWZ0ZXJVcGRhdGUocm93SWR4LCByZXNwLnJvdyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5faGFuZGxlRmlsdGVyRmllbGRDaGFuZ2UgPSBmdW5jdGlvbihpbnB1dCwgbmFtZSkge1xyXG4gICAgY29uc29sZS5sb2coJ2hhbmRsZSBmaWx0ZXIgZmllbGQnLCBpbnB1dCwgbmFtZSk7XHJcbiAgICB0aGlzLl9maWx0ZXJzW25hbWVdID0geyBmaWVsZE5hbWU6IG5hbWUsIHZhbHVlOiBqUXVlcnkoaW5wdXQpLnZhbCgpLCBvcE5hbWU6IGpRdWVyeSgnI2ZpbHRlci0nICsgbmFtZSArICctb3AnKS52YWwoKSB9O1xyXG4gICAgY29uc29sZS5sb2coJ2hhbmRsZSBmaWx0ZXIgLSBmaWx0ZXJzJywgdGhpcy5fZmlsdGVycyk7XHJcbiAgICB0aGlzLl9mZXRjaGVkUm93cyA9IFtdO1xyXG4gICAgalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLmVtcHR5KCk7XHJcbiAgICB0aGlzLnJlbmRlcigpO1xyXG59O1xyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5fcmVuZGVySGVhZGVyUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaGVhZGVyUm93Q3NzID0geyBcclxuICAgICAgICAgICAgaGVpZ2h0OiAodGhpcy5fcm93SGVpZ2h0ICsgNCkgKyAncHgnLFxyXG4gICAgfTtcclxuICAgIHRoaXMuX2hlYWRlclJvd0VsID0galF1ZXJ5KCc8ZGl2Lz4nKS5hdHRyKCdpZCcsICdoZWFkZXItcm93JykuY3NzKGhlYWRlclJvd0Nzcyk7XHJcbiAgICBMYXp5VGFibGUuYWxsV2lkdGhzKHRoaXMuX2hlYWRlclJvd0VsLCB0aGlzLl9yb3dXaWR0aCk7XHJcbiAgICBqUXVlcnkodGhpcy5faGVhZGVyUm93RWwpLmFkZENsYXNzKCdoZWFkZXIgcm93Jyk7XHJcbiAgICB0aGlzLl90YWJsZUVsLmFwcGVuZCh0aGlzLl9oZWFkZXJSb3dFbCk7XHJcbiAgICBmb3IgKHZhciBpPTA7IGkgPCB0aGlzLl90ZW1wbGF0ZVJvdy5maWVsZHMubGVuZ3RoOyArK2kgKSB7XHJcbiAgICAgICAgdmFyIGNzcyA9IHsgXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy5fY2VsbFdpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5fcm93SGVpZ2h0ICsgJ3B4JyxcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBlbCA9IGpRdWVyeSgnPGRpdi8+JykuY3NzKGNzcykuYXR0cignaWQnLCAnaGVhZGVyLWNlbGwtJyArIGkpO1xyXG4gICAgICAgIGpRdWVyeShlbCkuY3NzKGNzcyk7XHJcbiAgICAgICAgalF1ZXJ5KGVsKS5hZGRDbGFzcygnaGVhZGVyIGNlbGwnKTtcclxuICAgICAgICBpZiAoIGkgPT09IHRoaXMuX3RlbXBsYXRlUm93LmZpZWxkcy5sZW5ndGggLSAxICkge1xyXG4gICAgICAgICAgICBqUXVlcnkoZWwpLmFkZENsYXNzKCdsYXN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGpRdWVyeSh0aGlzLl9oZWFkZXJSb3dFbCkuYXBwZW5kKGVsKTtcclxuICAgICAgICB0aGlzLl9oZWFkZXJDZWxsUmVuZGVyRnVuYyhlbCwgaSwgdGhpcy5fdGVtcGxhdGVSb3cuZmllbGRzW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBqUXVlcnkodGhpcy5faGVhZGVyUm93RWwpLmNzcyh7XHJcbiAgICAgICAgdG9wOiAoalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLm9mZnNldCgpLnRvcCksXHJcbiAgICAgICAgbGVmdDogKGpRdWVyeSh0aGlzLl90YWJsZUVsKS5vZmZzZXQoKS5sZWZ0KVxyXG4gICAgfSk7XHJcbn07XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9yZW5kZXJGaWx0ZXJSb3cgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKCd3aWxsIF9yZW5kZXJGaWx0ZXJSb3cnKTtcclxuICAgIHZhciBjc3MgPSB7IFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICh0aGlzLl9yb3dIZWlnaHQgKyA0KSArICdweCcsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5fZmlsdGVyUm93RWwgPSBqUXVlcnkoJzxkaXYvPicpLmF0dHIoJ2lkJywgJ2ZpbHRlci1yb3cnKS5jc3MoY3NzKTtcclxuICAgIExhenlUYWJsZS5hbGxXaWR0aHModGhpcy5fZmlsdGVyUm93RWwsIHRoaXMuX3Jvd1dpZHRoKTtcclxuICAgIGpRdWVyeSh0aGlzLl9maWx0ZXJSb3dFbCkuYWRkQ2xhc3MoJ2ZpbHRlciByb3cnKTtcclxuICAgIGpRdWVyeSh0aGlzLl90YWJsZUVsKS5hcHBlbmQodGhpcy5fZmlsdGVyUm93RWwpO1xyXG4gICAgZm9yICh2YXIgaT0wOyBpIDwgdGhpcy5fdGVtcGxhdGVSb3cuZmllbGRzLmxlbmd0aDsgKytpICkge1xyXG4gICAgICAgIHZhciBjc3MgPSB7IFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2NlbGxXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX3Jvd0hlaWdodCArICdweCcsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgZWwgPSBqUXVlcnkoJzxkaXYvPicpLmNzcyhjc3MpLmF0dHIoJ2lkJywgJ2ZpbHRlci1jZWxsLScgKyBpKTtcclxuICAgICAgICBqUXVlcnkoZWwpLmNzcyhjc3MpO1xyXG4gICAgICAgIGpRdWVyeShlbCkuYWRkQ2xhc3MoJ2ZpbHRlciBjZWxsJyk7XHJcbiAgICAgICAgaWYgKCBpID09PSB0aGlzLl90ZW1wbGF0ZVJvdy5maWVsZHMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICAgICAgalF1ZXJ5KGVsKS5hZGRDbGFzcygnbGFzdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBqUXVlcnkodGhpcy5fZmlsdGVyUm93RWwpLmFwcGVuZChlbCk7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyQ2VsbFJlbmRlckZ1bmMoZWwsIGksIHRoaXMuX3RlbXBsYXRlUm93LmZpZWxkc1tpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgalF1ZXJ5KHRoaXMuX2ZpbHRlclJvd0VsKS5jc3Moe1xyXG4gICAgICAgIHRvcDogKGpRdWVyeSh0aGlzLl90YWJsZUVsKS5vZmZzZXQoKS50b3AgKyB0aGlzLl9yb3dIZWlnaHQgKyA0KSxcclxuICAgICAgICBsZWZ0OiAoalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLm9mZnNldCgpLmxlZnQpXHJcbiAgICB9KTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX2ZldGNoVGVtcGxhdGVSb3cgPSBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZldGNoVGVtcGxhdGVSb3dGdW5jKGNhbGxiYWNrKTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX2NvdW50Um93cyA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fY291bnRGdW5jKF8odGhpcy5fZmlsdGVycykudmFsdWVzKCksIGNhbGxiYWNrKTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX3NhdmVGaWVsZCA9IGZ1bmN0aW9uKGZpZWxkTmFtZSwgcm93LCBjYWxsYmFjaykge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NhdmVGaWVsZEZ1bmMoZmllbGROYW1lLCByb3csIGNhbGxiYWNrKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBjcmVhdGVzIHRoZSByb3cgZm9yIHNhdmVGaWVsZCgpXHJcbiAqL1xyXG5MYXp5VGFibGUucHJvdG90eXBlLl9jcmVhdGVSb3cgPSBmdW5jdGlvbihyb3dJZHgpIHtcclxuICAgIHZhciB0ciA9IHRoaXMuX3RlbXBsYXRlUm93LmZpZWxkcztcclxuICAgIHZhciByb3cgPSB7IGZpZWxkczoge30gfTtcclxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHRyLmxlbmd0aDsgKytpICkge1xyXG4gICAgICAgIGlmICggcm93SWR4LnRvU3RyaW5nKCkgIT09ICdpbnNlcnQnLnRvU3RyaW5nKCkgfHwgdHJbaV0ubmFtZS50b1N0cmluZygpICE9PSAnaWQnLnRvU3RyaW5nKCkgKSB7XHJcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGpRdWVyeSgnI2VkaXQtJyArIHRyW2ldLm5hbWUgKyAnLScgKyByb3dJZHggKyAnLScgKyBpKS52YWwoKTtcclxuICAgICAgICAgICAgaWYgKCB0eXBlb2YodmFsdWUpICE9PSAndW5kZWZpbmVkJyAmJiB2YWx1ZS5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgICAgcm93LmZpZWxkc1t0cltpXS5uYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcm93LmZpZWxkc1t0cltpXS5uYW1lXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJvdy5pZCA9IHJvdy5maWVsZHMuaWQ7XHJcbiAgICByZXR1cm4gcm93O1xyXG59O1xyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5fdmlld3BvcnRSb3dzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaGVpZ2h0ID0galF1ZXJ5KHRoaXMuX3ZpZXdwb3J0RWwpLmhlaWdodCgpO1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoaGVpZ2h0IC8gdGhpcy5fcm93SGVpZ2h0KTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX3Njcm9sbFRvID0gZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0KSB7XHJcbiAgICB0aGlzLl9sYXN0U2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xyXG4gICAgdGhpcy5fbGFzdFNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xyXG4gICAgaWYgKCB0aGlzLl9zaG91bGRDaGVja1Njcm9sbCApIHtcclxuICAgICAgICB0aGlzLl9zaG91bGRDaGVja1Njcm9sbCA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9pbm5lclNjcm9sbFRvKGpRdWVyeSh0aGlzLl92aWV3cG9ydEVsKS5zY3JvbGxUb3AoKSwgc2Nyb2xsTGVmdCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nob3VsZENoZWNrU2Nyb2xsID0gdHJ1ZTtcclxuICAgICAgICB9LmJpbmQodGhpcyksIHRoaXMuX3Njcm9sbFRpbWVvdXRNc2VjKTtcclxuICAgIH1cclxuXHJcbn07XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9pbm5lclNjcm9sbFRvID0gZnVuY3Rpb24oc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0KSB7XHJcbiAgICBpZiAoIHRoaXMuX2xhc3RTY3JvbGxUb3AgPT09IHNjcm9sbFRvcCApIHtcclxuICAgICAgICB2YXIgc3RhcnRJZHggPSBNYXRoLnJvdW5kKHNjcm9sbFRvcCAvIHRoaXMuX3Jvd0hlaWdodCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCApIHtcclxuICAgICAgICAgICAgc3RhcnRJZHggPSBNYXRoLnJvdW5kKHNjcm9sbFRvcCAvIGpRdWVyeSh0aGlzLl90YWJsZUVsKS5oZWlnaHQoKSAqIHRoaXMuX2NvdW50KTtcclxuICAgICAgICAgICAgaWYgKCBzdGFydElkeCA+PSB0aGlzLl9jb3VudCAqIDAuOSApIHtcclxuICAgICAgICAgICAgICAgIHN0YXJ0SWR4ID0gdGhpcy5fY291bnQgLSB0aGlzLl92aWV3cG9ydFJvd3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZmV0Y2hTdGFydElkeCA9IE1hdGgubWF4KHN0YXJ0SWR4IC0gdGhpcy5fc2NyZWVuU2l6ZUdyYWNlUm93cywgMClcclxuICAgICAgICB2YXIgZmV0Y2hDb3VudCA9IE1hdGgubWluKHRoaXMuX3ZpZXdwb3J0Um93cygpICsgMiAqIHRoaXMuX3NjcmVlblNpemVHcmFjZVJvd3MsIHRoaXMuX2NvdW50IC0gZmV0Y2hTdGFydElkeCkgKyAxO1xyXG4gICAgICAgIHRoaXMuX2ZldGNoRGF0YShmZXRjaFN0YXJ0SWR4LCBmZXRjaENvdW50LCBmdW5jdGlvbihzdGFydElkeCwgcm93cykge1xyXG4gICAgICAgICAgICB0aGlzLl9tZXJnZUZldGNoZWRSb3dzKHN0YXJ0SWR4LCByb3dzKTtcclxuICAgICAgICAgICAgKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mZXRjaERhdGEodGhpcy5fY291bnQgLSBmZXRjaENvdW50LCBmZXRjaENvdW50LCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlbmRlckZldGNoZWRSb3dzKHNjcm9sbExlZnQgPT09IHRoaXMuX2xhc3RTY3JvbGxMZWZ0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtcHR5Q2FjaGUoc3RhcnRJZHgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVySW5zZXJ0Um93KCk7IC8vIFRPRE8gaWYuLi5cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKSk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fbGFzdERpZmZlcmVudFNjcm9sbFRvcCA9IHRoaXMuX2xhc3RTY3JvbGxUb3A7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuX2xhc3RTY3JvbGxMZWZ0ICE9PSBzY3JvbGxMZWZ0ICkge1xyXG4gICAgICAgIHRoaXMuX2xhc3REaWZmZXJlbnRTY3JvbGxMZWZ0ID0gdGhpcy5fbGFzdFNjcm9sbExlZnQ7XHJcbiAgICB9XHJcbiAgICAvLyBUT0RPIEkgaGF2ZSBubyBjbHVlIHdoeSB0aGUgZm9sbG93aW5nIGZvcm11bGEgc2VlbXMgdG8gd29yay4uLiFcclxuICAgIHZhciBoZWFkZXJMZWZ0ID0gKCBqUXVlcnkodGhpcy5fdGFibGVFbCkub2Zmc2V0KCkubGVmdCAtIHNjcm9sbExlZnQgLyAoMiAqIHRoaXMuX3RlbXBsYXRlUm93LmZpZWxkcy5sZW5ndGggKiB0aGlzLl90ZW1wbGF0ZVJvdy5maWVsZHMubGVuZ3RoKSApO1xyXG4gICAgalF1ZXJ5KHRoaXMuX2hlYWRlclJvd0VsKS5jc3MoeyBsZWZ0OiBoZWFkZXJMZWZ0ICsgJ3B4JyB9KTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX2VtcHR5Q2FjaGUgPSBmdW5jdGlvbihzdGFydElkeCkge1xyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgY291bnQgPSB0aGlzLl9jb3VudDtcclxuICAgIHZhciBzdGFydEJsb2NrRW5kID0gMiAqIHRoaXMuX3ZpZXdwb3J0Um93cygpO1xyXG4gICAgdmFyIGVuZEJsb2NrU3RhcnQgPSBNYXRoLm1heCgwLCB0aGlzLl9jb3VudCAtIDIgKiB0aGlzLl92aWV3cG9ydFJvd3MoKSk7XHJcbiAgICB2YXIga2VlcFN0YXJ0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc3RhcnRJZHggLSAyICogdGhpcy5fc2NyZWVuU2l6ZUdyYWNlUm93cykpO1xyXG4gICAgdmFyIGtlZXBFbmQgPSBNYXRoLm1pbih0aGlzLl9jb3VudCwgc3RhcnRJZHggKyB0aGlzLl92aWV3cG9ydFJvd3MoKSArIDIgKiB0aGlzLl9zY3JlZW5TaXplR3JhY2VSb3dzKTtcclxuICAgIGZvciAoaSA9IDA7IGkgPCBrZWVwU3RhcnQ7ICsraSkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLl9mZXRjaGVkUm93c1tpXTtcclxuICAgICAgICBqUXVlcnkoJyNyb3ctJyArIGkpLnJlbW92ZSgpO1xyXG4gICAgfVxyXG4gICAgZm9yIChpID0ga2VlcEVuZDsgaSA8IGNvdW50OyArK2kpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5fZmV0Y2hlZFJvd3NbaV07XHJcbiAgICAgICAgalF1ZXJ5KCcjcm93LScgKyBpKS5yZW1vdmUoKTtcclxuICAgIH1cclxufTtcclxuXHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9yZW5kZXJGZXRjaGVkUm93cyA9IGZ1bmN0aW9uKGRvRm9jdXNBZnRlcndhcmRzKSB7XHJcbiAgICBpZiAoIHR5cGVvZihkb0ZvY3VzQWZ0ZXJ3YXJkcykgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgZG9Gb2N1c0FmdGVyd2FyZHMgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciByb3dzID0gdGhpcy5fZmV0Y2hlZFJvd3M7XHJcbiAgICB2YXIgcm93c0xlbmd0aCA9IHRoaXMuX2NvdW50O1xyXG4gICAgdmFyIHJvd0lkeCwgZmllbGRJZHg7XHJcbiAgICBtX3RpbWVyLlRpbWVyLnN0YXJ0KCdfcmVuZGVyRmV0Y2hlZFJvd3MnKTtcclxuICAgIHZhciBhY3RpdmVFbElkID0galF1ZXJ5KHdpbmRvdy5kb2N1bWVudC5hY3RpdmVFbGVtZW50KS5hdHRyKCdpZCcpO1xyXG4gICAgZm9yICggcm93SWR4ID0gMDsgcm93SWR4ICA8IHJvd3NMZW5ndGg7ICsrcm93SWR4ICkge1xyXG4gICAgICAgIGlmICggdHlwZW9mKHJvd3Nbcm93SWR4XSkgIT09ICd1bmRlZmluZWQnICkge1xyXG4gICAgICAgICAgICB2YXIgcm93ID0gcm93c1tyb3dJZHhdO1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJSb3cocm93SWR4LCByb3cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggZG9Gb2N1c0FmdGVyd2FyZHMgJiYgalF1ZXJ5KCcjJyArIGFjdGl2ZUVsSWQpLmxlbmd0aCA+IDAgJiYgdGhpcy5faXNFbGVtZW50VmlzaWJsZShqUXVlcnkoJyMnICsgYWN0aXZlRWxJZCkpICYmIGZhbHNlICkge1xyXG4gICAgICAgIGpRdWVyeSgnIycgKyBhY3RpdmVFbElkKS5mb2N1cygpO1xyXG4gICAgfVxyXG4gICAgbV90aW1lci5UaW1lci5lbmQoJ19yZW5kZXJGZXRjaGVkUm93cycpO1xyXG4gICAgbV90aW1lci5UaW1lci5sb2coJ19yZW5kZXJGZXRjaGVkUm93cycpO1xyXG59XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9yZW5kZXJSb3cgPSBmdW5jdGlvbihyb3dJZHgsIHJvdykge1xyXG4gICAgY29uc29sZS5sb2coJ3dpbGwgcmVuZGVyIHJvdycsIHJvdywgJ3Jvd0lkeCcsIHJvd0lkeCk7XHJcbiAgICB2YXIgZmllbGRzID0gcm93LmZpZWxkcztcclxuICAgIHZhciBmaWVsZHNMZW5ndGggPWZpZWxkcy5sZW5ndGg7XHJcbiAgICB2YXIgdG9wUHg7XHJcbiAgICBpZiAoIHJvd0lkeCA9PT0gJ2luc2VydCcgKSB7IC8vIFRPRE8gYWhlbVxyXG4gICAgICAgIHRvcFB4ID0gKDUgKyAodGhpcy5fY291bnQgKyAyKSAqIHRoaXMuX3Jvd0hlaWdodCkgKyAncHgnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0b3BQeCA9ICg1ICsgKHJvd0lkeCArIDIpICogdGhpcy5fcm93SGVpZ2h0KSArICdweCc7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRoaXMuX2hlaWdodElzT3ZlcmZsb3dlZCAmJiByb3dJZHggPj0gdGhpcy5fY291bnQgKiAwLjkpIHtcclxuICAgICAgICB0b3BQeCA9ICg1ICsgalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLmhlaWdodCgpIC0gKCh0aGlzLl9jb3VudCAtIHJvd0lkeCArIDEpICogdGhpcy5fcm93SGVpZ2h0KSkgKyAncHgnO1xyXG4gICAgfVxyXG4gICAgdmFyIHJvd0NzcyA9IHsgXHJcbiAgICAgICAgICAgIHRvcDogdG9wUHgsXHJcbiAgICAgICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbidcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHJvd0RpdiA9IGpRdWVyeSgnPGRpdi8+JykuYXR0cignaWQnLCAncm93LScgKyByb3dJZHgpO1xyXG4gICAgcm93RGl2LmNzcyhyb3dDc3MpO1xyXG4gICAgTGF6eVRhYmxlLmFsbFdpZHRocyhyb3dEaXYsIHRoaXMuX3Jvd1dpZHRoKTtcclxuICAgIExhenlUYWJsZS5hbGxIZWlnaHRzKHJvd0RpdiwgdGhpcy5fcm93SGVpZ2h0KTtcclxuICAgIGlmICggalF1ZXJ5KCcjcm93LScgKyByb3dJZHgpLmxlbmd0aCApIHtcclxuICAgICAgICBqUXVlcnkoJyNyb3ctJyArIHJvd0lkeCkucmVwbGFjZVdpdGgocm93RGl2KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLmFwcGVuZChyb3dEaXYpO1xyXG4gICAgfVxyXG4gICAgdmFyIHRhYmxlV2lkdGggPSBqUXVlcnkodGhpcy5fdmlld3BvcnRFbCkud2lkdGgoKTtcclxuICAgIHZhciBmaWVsZElkeCA9IDA7XHJcbiAgICB2YXIgbGFzdEVsID0gbnVsbDtcclxuICAgIHZhciB2RWwgPSBqUXVlcnkodGhpcy5fdmlld3BvcnRFbCk7XHJcbiAgICB2YXIgdkVsV2lkdGggPSB2RWwud2lkdGgoKTtcclxuICAgIHdoaWxlICggZmllbGRJZHggPT09IDAgfHwgKGZpZWxkSWR4ID4gMCAmJiBmaWVsZElkeCA8IGZpZWxkc0xlbmd0aCAmJiBsYXN0RWwub2Zmc2V0TGVmdCA8PSB2RWwuc2Nyb2xsTGVmdCgpICsgdkVsV2lkdGgpICkge1xyXG4gICAgICAgIGxhc3RFbCA9IHRoaXMuX3JlbmRlckNlbGwocm93RGl2WzBdLCByb3dJZHgsIGZpZWxkSWR4LCBmaWVsZHNbZmllbGRJZHhdKTtcclxuICAgICAgICArK2ZpZWxkSWR4O1xyXG4gICAgfVxyXG59O1xyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5fcmVuZGVySW5zZXJ0Um93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLl9yZW5kZXJSb3coJ2luc2VydCcsIHRoaXMuX3RlbXBsYXRlUm93KTtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX3JlbmRlckNlbGwgPSBmdW5jdGlvbihyb3dEaXYsIHJvd0lkeCwgZmllbGRJZHgsIGZpZWxkKSB7XHJcbiAgICB2YXIgY3NzID0geyBcclxuICAgIH07XHJcbiAgICB2YXIgZGl2ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgZGl2LnNldEF0dHJpYnV0ZSgnaWQnLCAnY2VsbC0nICsgcm93SWR4ICsgJy0nICsgZmllbGRJZHgpO1xyXG4gICAgdmFyIGRpdkNsYXNzID0gJ2JvZHkgY2VsbCc7XHJcbiAgICBpZiAoIGZpZWxkSWR4ID09PSB0aGlzLl90ZW1wbGF0ZVJvdy5maWVsZHMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICBkaXZDbGFzcyArPSAnIGxhc3QnO1xyXG4gICAgfVxyXG4gICAgaWYgKCByb3dJZHggJSAyID09PSAwICkge1xyXG4gICAgICAgIGRpdkNsYXNzICs9ICcgZXZlbic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRpdkNsYXNzICs9ICcgb2RkJztcclxuICAgIH1cclxuICAgIGlmICggZmllbGQuaXNFZGl0YWJsZSApIHtcclxuICAgICAgICBkaXZDbGFzcyArPSAnIGVkaXRhYmxlJztcclxuICAgIH1cclxuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgZGl2Q2xhc3MpO1xyXG4gICAgZGl2LnN0eWxlLndpZHRoID0gdGhpcy5fY2VsbFdpZHRoICsgJ3B4JztcclxuICAgIGRpdi5zdHlsZS5oZWlnaHQgPSB0aGlzLl9yb3dIZWlnaHQgKyAncHgnO1xyXG4gICAgcm93RGl2LmFwcGVuZENoaWxkKGRpdik7XHJcbiAgICB0aGlzLl9ib2R5Q2VsbFJlbmRlckZ1bmMoZGl2LCByb3dJZHgsIGZpZWxkSWR4LCBmaWVsZCk7XHJcbiAgICByZXR1cm4gZGl2O1xyXG59O1xyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5fbWVyZ2VGZXRjaGVkUm93cyA9IGZ1bmN0aW9uKHN0YXJ0SWR4LCByb3dzKSB7XHJcbiAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgKytpICkgeyAvLyBUT0RPIG9wdGltaXplXHJcbiAgICAgICAgdGhpcy5fZmV0Y2hlZFJvd3Nbc3RhcnRJZHggKyBpXSA9IHJvd3NbaV07XHJcbiAgICB9XHJcbn07XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9nZXREZWZhdWx0SW5wdXREaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaW5wdXQgPSBqUXVlcnkoJzxpbnB1dCB0eXBlPVwidGV4dFwiLz4nKTtcclxuICAgIGpRdWVyeSh0aGlzLl90YWJsZUVsKS5hcHBlbmQoaW5wdXQpO1xyXG4gICAgdmFyIHJ2PSB7IHdpZHRoOiBqUXVlcnkoaW5wdXQpLndpZHRoKCksIGhlaWdodDogalF1ZXJ5KGlucHV0KS5oZWlnaHQoKSB9O1xyXG4gICAgalF1ZXJ5KGlucHV0KS5yZW1vdmUoKTtcclxuICAgIHJldHVybiBydjtcclxufTtcclxuXHJcbkxhenlUYWJsZS5wcm90b3R5cGUuX2lzRWxlbWVudFZpc2libGUgPSBmdW5jdGlvbihlbG0sIGV2YWxUeXBlKSB7XHJcbiAgICBldmFsVHlwZSA9IGV2YWxUeXBlIHx8IFwidmlzaWJsZVwiO1xyXG5cclxuICAgIHZhciB2cEggPSBqUXVlcnkod2luZG93KS5oZWlnaHQoKSwgLy8gVmlld3BvcnQgSGVpZ2h0XHJcbiAgICAgICAgc3QgPSBqUXVlcnkod2luZG93KS5zY3JvbGxUb3AoKSwgLy8gU2Nyb2xsIFRvcFxyXG4gICAgICAgIHkgPSBqUXVlcnkoZWxtKS5vZmZzZXQoKS50b3AsXHJcbiAgICAgICAgZWxlbWVudEhlaWdodCA9IGpRdWVyeShlbG0pLmhlaWdodCgpO1xyXG5cclxuICAgIGlmIChldmFsVHlwZSA9PT0gXCJ2aXNpYmxlXCIpIHJldHVybiAoKHkgPCAodnBIICsgc3QpKSAmJiAoeSA+IChzdCAtIGVsZW1lbnRIZWlnaHQpKSk7XHJcbiAgICBpZiAoZXZhbFR5cGUgPT09IFwiYWJvdmVcIikgcmV0dXJuICgoeSA8ICh2cEggKyBzdCkpKTtcclxufVxyXG5cclxuTGF6eVRhYmxlLnByb3RvdHlwZS5fYWZ0ZXJJbnNlcnQgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgIHRoaXMuX3JlbmRlckZldGNoZWRSb3dzKHRydWUpO1xyXG4gICAgdGhpcy5fcmVuZGVySW5zZXJ0Um93KCk7XHJcbn07XHJcblxyXG5MYXp5VGFibGUucHJvdG90eXBlLl9hZnRlclVwZGF0ZSA9IGZ1bmN0aW9uKHJvd0lkeCwgcm93KSB7XHJcbiAgICB0aGlzLl9mZXRjaGVkUm93c1tyb3dJZHhdID0gcm93O1xyXG4gICAgdGhpcy5fcmVuZGVyRmV0Y2hlZFJvd3ModHJ1ZSk7XHJcbiAgICB0aGlzLl9yZW5kZXJJbnNlcnRSb3coKTtcclxufTtcclxuXHJcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuXHJcbi8qXHJcbiAqIHN0YXRpYyBmdW5jdGlvbnMsIGRlZmF1bHQgcmVuZGVyZXJzLi4uXHJcbiAqL1xyXG5cclxuTGF6eVRhYmxlLmFsbFdpZHRocyA9IGZ1bmN0aW9uKGVsLCB3aWR0aCkge1xyXG4gICAgalF1ZXJ5KGVsKS5jc3MoeyAnbWluLXdpZHRoJzogd2lkdGggKyAncHgnLCAnd2lkdGgnOiB3aWR0aCArICdweCcsICdtYXgtd2lkdGgnOiB3aWR0aCAgKyAncHgnfSk7XHJcbn07XHJcblxyXG5MYXp5VGFibGUuYWxsSGVpZ2h0cyA9IGZ1bmN0aW9uKGVsLCBoZWlnaHQpIHtcclxuICAgIGpRdWVyeShlbCkuY3NzKHsgJ21pbi1oZWlnaHQnOiBoZWlnaHQgKyAncHgnLCAnaGVpZ2h0JzogaGVpZ2h0ICsgJ3B4JywgJ21heC1oZWlnaHQnOiBoZWlnaHQgICsgJ3B4J30pO1xyXG59O1xyXG5cclxuZXhwb3J0cy5MYXp5VGFibGUgPSBMYXp5VGFibGU7XHJcbmV4cG9ydHMubGF6eVRhYmxlID0gbGF6eVRhYmxlO1xyXG4iLCJ2YXIgbV91aSA9IHJlcXVpcmUoJ2NsaWVudC9VSS5qcycpO1xyXG5cclxud2luZG93LmxvYWRVSSA9IGZ1bmN0aW9uKGNzc0lkLCBiYXNlVXJsLCBkYXRhKSB7XHJcbiAgICBqUXVlcnkuYWpheChiYXNlVXJsICsgJy8nICsgWyAnY2xpZW50JywgJ2Zvcm1Sb3V0ZXInLCAnYnlSb3V0ZScgXS5qb2luKCcvJyksIHtcclxuICAgICAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgYXN5bmM6IHRydWUsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcclxuICAgICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJvdXRlckRhdGEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2xvYWR1aW5ldyBzdWNjZXNzIHJvdXRlckRhdGEnLCByb3V0ZXJEYXRhLCAnZGF0YScsIGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHVpID0gbV91aS51aSgpO1xyXG4gICAgICAgICAgICAgICAgdWkuZGlzcGxheUZvcm0oY3NzSWQsIHJvdXRlckRhdGEuZm9ybU5hbWUsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59O1xyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUsMjAxNiBDaHJpc3RpYW4gRnJpZWRsIDxNYWcuQ2hyaXN0aWFuLkZyaWVkbEBnbWFpbC5jb20+XHJcbiAqXHJcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIEJKTzIuXHJcbiAqXHJcbiAqIE1hcGl0b3IgaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxyXG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xyXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cclxuICpcclxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXHJcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXHJcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcclxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cclxuICpcclxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcclxuICogYWxvbmcgd2l0aCB0aGlzIHByb2dyYW07IGlmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cclxuICovXHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBtX2NsaWVudF9mb3Jtc19jZWxsUmVuZGVyZXIgPSByZXF1aXJlKCdjbGllbnQvZm9ybXMvY2VsbFJlbmRlcmVyLmpzJyk7XHJcblxyXG5mdW5jdGlvbiBTaW5nbGVSb3dUYWJsZShjc3NJZCwgcm93LCBzYXZlRmllbGRGdW5jKSB7XHJcbiAgICB0aGlzLl9jc3NJZCA9IGNzc0lkO1xyXG4gICAgdGhpcy5fcm93ID0gcm93O1xyXG4gICAgdGhpcy5faGVhZGVyQ2VsbFJlbmRlckZ1bmMgPSBtX2NsaWVudF9mb3Jtc19jZWxsUmVuZGVyZXIuQ2VsbFJlbmRlcmVyLnJlbmRlckhlYWRlckNlbGw7XHJcbiAgICB0aGlzLl9ib2R5Q2VsbFJlbmRlckZ1bmMgPSBtX2NsaWVudF9mb3Jtc19jZWxsUmVuZGVyZXIuQ2VsbFJlbmRlcmVyLnJlbmRlckJvZHlDZWxsO1xyXG4gICAgdGhpcy5fc2F2ZUZpZWxkRnVuYyA9IHNhdmVGaWVsZEZ1bmM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNpbmdsZVJvd1RhYmxlKGNzc0lkLCByb3csIHNhdmVGaWVsZEZ1bmMpIHtcclxuICAgIHJldHVybiBuZXcgU2luZ2xlUm93VGFibGUoY3NzSWQsIHJvdywgc2F2ZUZpZWxkRnVuYyk7XHJcbn1cclxuXHJcblNpbmdsZVJvd1RhYmxlLnByb3RvdHlwZSA9IHt9O1xyXG5TaW5nbGVSb3dUYWJsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTaW5nbGVSb3dUYWJsZTtcclxuXHJcbi8qKlxyXG4gKiBpbml0aWFsIHJlbmRlcmluZ1xyXG4gKi9cclxuU2luZ2xlUm93VGFibGUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgdGhpcy5fdGFibGVFbCA9IGpRdWVyeSgnIycgKyB0aGlzLl9jc3NJZCk7XHJcbiAgICB0aGlzLl90YWJsZUVsLmF0dHIoJ2lkJywgJ3RhYmxlJykuY3NzKHsgcG9zaXRpb246ICdyZWxhdGl2ZScsICB9KS5hZGRDbGFzcygnc2luZ2xlLXJvdy10YWJsZScpO1xyXG4gICAgdGhpcy5fcmVuZGVyUm93KCk7XHJcbiAgICB0aGlzLl9zZWxlY3RGaXJzdElucHV0KCk7XHJcblxyXG4gICAgalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLmNoYW5nZShmdW5jdGlvbihldikge1xyXG4gICAgICAgIHZhciB2YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZygnY2hhbmdlJywgZXYpO1xyXG4gICAgICAgIHZhciBpbnB1dCA9IGV2LnRhcmdldDtcclxuICAgICAgICB2YXIgaWQgPSBqUXVlcnkoaW5wdXQpLmF0dHIoJ2lkJyk7XHJcbiAgICAgICAgdmFyIHBhcnRzID0gaWQuc3BsaXQoJy0nKTtcclxuICAgICAgICB2YXIgZmllbGRJZHggPSBwYXJ0c1szXTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ2NoYW5nZSwgaW5wdXQgaWQgcGFydHMgZmllbGRJZHgnLCBpbnB1dCwgaWQsIHBhcnRzLCBmaWVsZElkeCk7XHJcblxyXG4gICAgICAgIHZhciBmaWVsZCA9IHNlbGYuX3Jvdy5maWVsZHNbZmllbGRJZHhdO1xyXG5cclxuICAgICAgICBpZiAoIGpRdWVyeShpbnB1dCkuYXR0cigndHlwZScpID09PSAnY2hlY2tib3gnICkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IGpRdWVyeShpbnB1dCkucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0galF1ZXJ5KGlucHV0KS52YWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5fc2F2ZUZpZWxkLmJpbmQoc2VsZik7XHJcbiAgICAgICAgc2VsZi5fc2F2ZUZpZWxkKGZpZWxkLm5hbWUsIHNlbGYuX2NyZWF0ZVJvdygpLCBmdW5jdGlvbihlcnIsIHJlc3ApIHsgXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3ApO1xyXG4gICAgICAgICAgICBpZiAoIHJlc3AuZmxhZ3MuaGFzU2F2ZWQgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlc3AuZmxhZ3MuaGFzSW5zZXJ0ZWQgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYWZ0ZXJJbnNlcnQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYWZ0ZXJVcGRhdGUocmVzcC5yb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHNlbGYpKTtcclxuICAgIH0pLmtleWRvd24oZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhldi50YXJnZXQsIGV2KTtcclxuICAgICAgICBpZiAoIGV2LmtleUNvZGUgPT09IDQwICkgeyAvLyBkb3duXHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IGV2LnRhcmdldDtcclxuICAgICAgICAgICAgdmFyIGlkID0galF1ZXJ5KGlucHV0KS5hdHRyKCdpZCcpOy8vIHRvZG8gYWJzdHJhY3QgaW50byBmdW5jXHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGlkLnNwbGl0KCctJyk7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gcGFydHNbMV07XHJcbiAgICAgICAgICAgIHZhciBmaWVsZElkeCA9IHdpbmRvdy5wYXJzZUludChwYXJ0c1syXSk7XHJcbiAgICAgICAgICAgIGlmICggalF1ZXJ5KCcjZWRpdC0nICsgbmFtZSArICctJyArIGZpZWxkSWR4KS5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjZWRpdC0nICsgbmFtZSArICctJyArIGZpZWxkSWR4KS5wdXRDdXJzb3JBdEVuZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICggZXYua2V5Q29kZSA9PT0gMzggKSB7IC8vIHVwXHJcbiAgICAgICAgICAgIHZhciBpbnB1dCA9IGV2LnRhcmdldDtcclxuICAgICAgICAgICAgdmFyIGlkID0galF1ZXJ5KGlucHV0KS5hdHRyKCdpZCcpOy8vIHRvZG8gYWJzdHJhY3QgaW50byBmdW5jXHJcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGlkLnNwbGl0KCctJyk7XHJcbiAgICAgICAgICAgIHZhciBuYW1lID0gcGFydHNbMV07XHJcbiAgICAgICAgICAgIHZhciBmaWVsZElkeCA9IHdpbmRvdy5wYXJzZUludChwYXJ0c1syXSk7XHJcbiAgICAgICAgICAgIGlmICggalF1ZXJ5KCcjZWRpdC0nICsgbmFtZSArICctJyArIGZpZWxkSWR4KS5sZW5ndGggKSB7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNlZGl0LScgKyBuYW1lICsgJy0nICsgZmllbGRJZHgpLnB1dEN1cnNvckF0RW5kKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufTtcclxuXHJcblNpbmdsZVJvd1RhYmxlLnByb3RvdHlwZS5fc2F2ZUZpZWxkID0gZnVuY3Rpb24oZmllbGROYW1lLCByb3csIGNhbGxiYWNrKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2F2ZUZpZWxkRnVuYyhmaWVsZE5hbWUsIHJvdywgY2FsbGJhY2spO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGNyZWF0ZXMgdGhlIHJvdyBmb3Igc2F2ZUZpZWxkKClcclxuICovXHJcblNpbmdsZVJvd1RhYmxlLnByb3RvdHlwZS5fY3JlYXRlUm93ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdHIgPSB0aGlzLl9yb3cuZmllbGRzO1xyXG4gICAgdmFyIHJvdyA9IHsgZmllbGRzOiB7fSB9O1xyXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdHIubGVuZ3RoOyArK2kgKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlID0galF1ZXJ5KCcjZWRpdC0nICsgdHJbaV0ubmFtZSArICctdW5kZWZpbmVkLScgKyBpKS52YWwoKTtcclxuICAgICAgICBpZiAoIHR5cGVvZih2YWx1ZSkgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICAgIHJvdy5maWVsZHNbdHJbaV0ubmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByb3cuZmllbGRzW3RyW2ldLm5hbWVdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJvdy5pZCA9IHJvdy5maWVsZHMuaWQ7XHJcbiAgICByZXR1cm4gcm93O1xyXG59O1xyXG5cclxuU2luZ2xlUm93VGFibGUucHJvdG90eXBlLl9yZW5kZXJSb3cgPSBmdW5jdGlvbihkb0ZvY3VzQWZ0ZXJ3YXJkcykge1xyXG4gICAgaWYgKCB0eXBlb2YoZG9Gb2N1c0FmdGVyd2FyZHMpID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGRvRm9jdXNBZnRlcndhcmRzID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgcm93SWR4LCBmaWVsZElkeDtcclxuICAgIHZhciBhY3RpdmVFbElkID0galF1ZXJ5KHdpbmRvdy5kb2N1bWVudC5hY3RpdmVFbGVtZW50KS5hdHRyKCdpZCcpO1xyXG4gICAgY29uc29sZS5sb2coJ3JlbmRlcmluZycsIHRoaXMuX3Jvdyk7XHJcbiAgICBqUXVlcnkodGhpcy5fdGFibGVFbCkuZW1wdHkoKTtcclxuICAgIHZhciBmaWVsZHMgPSB0aGlzLl9yb3cuZmllbGRzO1xyXG4gICAgdmFyIGZpZWxkc0xlbmd0aCA9ZmllbGRzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKCBmaWVsZElkeCA9IDA7IGZpZWxkSWR4IDwgZmllbGRzTGVuZ3RoOyArK2ZpZWxkSWR4ICkge1xyXG4gICAgICAgIHZhciB0ckRpdiA9IGpRdWVyeSgnPGRpdi8+JykuYWRkQ2xhc3MoJ3NpbmdsZS1yb3cnKTtcclxuICAgICAgICB2YXIgdGhEaXYgPSBqUXVlcnkoJzxkaXYvPicpLmF0dHIoJ2lkJywgJ2hlYWRlci1jZWxsLScgKyBmaWVsZElkeCk7XHJcbiAgICAgICAgalF1ZXJ5KHRoRGl2KS5hZGRDbGFzcygnaGVhZGVyIGNlbGwnKTtcclxuICAgICAgICB2YXIgdGREaXYgPSBqUXVlcnkoJzxkaXYvPicpLmFkZENsYXNzKCdzaW5nbGUtYm9keScpO1xyXG5cclxuICAgICAgICB0aGlzLl9oZWFkZXJDZWxsUmVuZGVyRnVuYyh0aERpdiwgdW5kZWZpbmVkLCBmaWVsZHNbZmllbGRJZHhdKTtcclxuICAgICAgICB0aGlzLl9yZW5kZXJDZWxsKHRkRGl2LCBmaWVsZElkeCwgZmllbGRzW2ZpZWxkSWR4XSk7XHJcblxyXG4gICAgICAgIGpRdWVyeSh0ckRpdikuYXBwZW5kKHRoRGl2KTtcclxuICAgICAgICBqUXVlcnkodHJEaXYpLmFwcGVuZCh0ZERpdik7XHJcbiAgICAgICAgalF1ZXJ5KHRoaXMuX3RhYmxlRWwpLmFwcGVuZCh0ckRpdik7XHJcbiAgICB9XHJcbiAgICBqUXVlcnkoJyMnICsgYWN0aXZlRWxJZCkuZm9jdXMoKTtcclxufVxyXG5cclxuU2luZ2xlUm93VGFibGUucHJvdG90eXBlLl9yZW5kZXJDZWxsID0gZnVuY3Rpb24odGREaXYsIGZpZWxkSWR4LCBmaWVsZCkge1xyXG4gICAgLy8gY29uc29sZS5sb2coJ19yZW5kZXJDZWxsJywgcm93SWR4LCBmaWVsZElkeCk7XHJcbiAgICB2YXIgY3NzID0geyBcclxuICAgIH07XHJcbiAgICB2YXIgZGl2ID0galF1ZXJ5KCc8ZGl2Lz4nKTtcclxuICAgIGRpdi5hdHRyKCdpZCcsICdjZWxsLScgKyBmaWVsZElkeCk7XHJcbiAgICB2YXIgZGl2Q2xhc3MgPSAnYm9keSBjZWxsJztcclxuICAgIGlmICggZmllbGRJZHggPT09IHRoaXMuX3Jvdy5maWVsZHMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICBkaXZDbGFzcyArPSAnIGxhc3QnO1xyXG4gICAgfVxyXG4gICAgaWYgKCBmaWVsZElkeCAlIDIgPT09IDAgKSB7XHJcbiAgICAgICAgZGl2Q2xhc3MgKz0gJyBldmVuJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZGl2Q2xhc3MgKz0gJyBvZGQnO1xyXG4gICAgfVxyXG4gICAgaWYgKCBmaWVsZC5pc0VkaXRhYmxlICkge1xyXG4gICAgICAgIGRpdkNsYXNzICs9ICcgZWRpdGFibGUnO1xyXG4gICAgfVxyXG4gICAgZGl2LmFkZENsYXNzKGRpdkNsYXNzKTtcclxuICAgIC8qXHJcbiAgICBkaXYuc3R5bGUud2lkdGggPSB0aGlzLl9jZWxsV2lkdGggKyAncHgnO1xyXG4gICAgZGl2LnN0eWxlLmhlaWdodCA9IHRoaXMuX3Jvd0hlaWdodCArICdweCc7XHJcbiAgICAqL1xyXG4gICAgalF1ZXJ5KHRkRGl2KS5hcHBlbmQoZGl2KTtcclxuICAgIHRoaXMuX2JvZHlDZWxsUmVuZGVyRnVuYyhkaXYsIHVuZGVmaW5lZCwgZmllbGRJZHgsIGZpZWxkKTtcclxuICAgIHJldHVybiBkaXY7XHJcbn07XHJcblxyXG5TaW5nbGVSb3dUYWJsZS5wcm90b3R5cGUuX21lcmdlRmV0Y2hlZFJvd3MgPSBmdW5jdGlvbihzdGFydElkeCwgcm93cykge1xyXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7ICsraSApIHsgLy8gVE9ETyBvcHRpbWl6ZVxyXG4gICAgICAgIC8vY29uc29sZS5sb2coJ21lcmdlJywgc3RhcnRJZHggKyBpKTtcclxuICAgICAgICB0aGlzLl9mZXRjaGVkUm93c1tzdGFydElkeCArIGldID0gcm93c1tpXTtcclxuICAgIH1cclxufTtcclxuXHJcblNpbmdsZVJvd1RhYmxlLnByb3RvdHlwZS5fZ2V0RGVmYXVsdElucHV0RGltZW5zaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlucHV0ID0galF1ZXJ5KCc8aW5wdXQgdHlwZT1cInRleHRcIi8+Jyk7XHJcbiAgICBqUXVlcnkodGhpcy5fdGFibGVFbCkuYXBwZW5kKGlucHV0KTtcclxuICAgIHZhciBydj0geyB3aWR0aDogalF1ZXJ5KGlucHV0KS53aWR0aCgpLCBoZWlnaHQ6IGpRdWVyeShpbnB1dCkuaGVpZ2h0KCkgfTtcclxuICAgIGpRdWVyeShpbnB1dCkucmVtb3ZlKCk7XHJcbiAgICByZXR1cm4gcnY7XHJcbn07XHJcblxyXG5TaW5nbGVSb3dUYWJsZS5wcm90b3R5cGUuX2lzRWxlbWVudFZpc2libGUgPSBmdW5jdGlvbihlbG0sIGV2YWxUeXBlKSB7XHJcbiAgICBldmFsVHlwZSA9IGV2YWxUeXBlIHx8IFwidmlzaWJsZVwiO1xyXG5cclxuICAgIHZhciB2cEggPSBqUXVlcnkod2luZG93KS5oZWlnaHQoKSwgLy8gVmlld3BvcnQgSGVpZ2h0XHJcbiAgICAgICAgc3QgPSBqUXVlcnkod2luZG93KS5zY3JvbGxUb3AoKSwgLy8gU2Nyb2xsIFRvcFxyXG4gICAgICAgIHkgPSBqUXVlcnkoZWxtKS5vZmZzZXQoKS50b3AsXHJcbiAgICAgICAgZWxlbWVudEhlaWdodCA9IGpRdWVyeShlbG0pLmhlaWdodCgpO1xyXG5cclxuICAgIGlmIChldmFsVHlwZSA9PT0gXCJ2aXNpYmxlXCIpIHJldHVybiAoKHkgPCAodnBIICsgc3QpKSAmJiAoeSA+IChzdCAtIGVsZW1lbnRIZWlnaHQpKSk7XHJcbiAgICBpZiAoZXZhbFR5cGUgPT09IFwiYWJvdmVcIikgcmV0dXJuICgoeSA8ICh2cEggKyBzdCkpKTtcclxufVxyXG5cclxuU2luZ2xlUm93VGFibGUucHJvdG90eXBlLl9hZnRlckluc2VydCA9IGZ1bmN0aW9uKHJvdykge1xyXG4gICAgY29uc29sZS5sb2coJ2hhbmRsZSBpbnNlcnQgcm93Jywgcm93KTtcclxuICAgIHRoaXMuX3JlbmRlckZldGNoZWRSb3codHJ1ZSk7XHJcbiAgICB0aGlzLl9yZW5kZXJJbnNlcnRSb3coKTtcclxufTtcclxuXHJcblNpbmdsZVJvd1RhYmxlLnByb3RvdHlwZS5fYWZ0ZXJVcGRhdGUgPSBmdW5jdGlvbihyb3cpIHtcclxuICAgIGNvbnNvbGUubG9nKCdoYW5kbGUgdXBkYXRlIHJvdycsIHJvdyk7XHJcbiAgICB0aGlzLl9yb3cgPSByb3c7XHJcbiAgICB0aGlzLl9yZW5kZXJSb3codHJ1ZSk7XHJcbn07XHJcblxyXG5TaW5nbGVSb3dUYWJsZS5wcm90b3R5cGUuX3NlbGVjdEZpcnN0SW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBpbnB1dHMgPSBqUXVlcnkoJ2lucHV0JywgdGhpcy5fdGFibGVFbCk7XHJcbiAgICBpZiAoIGlucHV0cy5sZW5ndGggPiAwICkgaW5wdXRzWzBdLmZvY3VzKCk7XHJcbn07XHJcblxyXG4vKlxyXG4gKiBzdGF0aWMgZnVuY3Rpb25zLCBkZWZhdWx0IHJlbmRlcmVycy4uLlxyXG4gKi9cclxuXHJcblNpbmdsZVJvd1RhYmxlLmFsbFdpZHRocyA9IGZ1bmN0aW9uKGVsLCB3aWR0aCkge1xyXG4gICAgalF1ZXJ5KGVsKS5jc3MoeyAnbWluLXdpZHRoJzogd2lkdGggKyAncHgnLCAnd2lkdGgnOiB3aWR0aCArICdweCcsICdtYXgtd2lkdGgnOiB3aWR0aCAgKyAncHgnfSk7XHJcbn07XHJcblxyXG5TaW5nbGVSb3dUYWJsZS5hbGxIZWlnaHRzID0gZnVuY3Rpb24oZWwsIGhlaWdodCkge1xyXG4gICAgalF1ZXJ5KGVsKS5jc3MoeyAnbWluLWhlaWdodCc6IGhlaWdodCArICdweCcsICdoZWlnaHQnOiBoZWlnaHQgKyAncHgnLCAnbWF4LWhlaWdodCc6IGhlaWdodCAgKyAncHgnfSk7XHJcbn07XHJcblxyXG5leHBvcnRzLlNpbmdsZVJvd1RhYmxlID0gU2luZ2xlUm93VGFibGU7XHJcbmV4cG9ydHMuc2luZ2xlUm93VGFibGUgPSBzaW5nbGVSb3dUYWJsZTtcclxuIiwiVGltZXIgPSB7XHJcbiAgICB0aW1lczoge30sXHJcbiAgICBzdGFydDogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgIFRpbWVyLnRpbWVzW25hbWVdID0geyBzdGFydDogbmV3IERhdGUoKSwgZW5kOiBudWxsLCBkaWZmTXNlYzogbnVsbCB9O1xyXG4gICAgfSxcclxuICAgIGVuZDogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgIHZhciB0aW1lID0gVGltZXIudGltZXNbbmFtZV07XHJcbiAgICAgICAgdGltZS5lbmQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIHRpbWUuZGlmZk1zZWMgPSB0aW1lLmVuZCAtIHRpbWUuc3RhcnQ7XHJcbiAgICB9LFxyXG4gICAgbG9nOiBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgdmFyIHRpbWUgPSBUaW1lci50aW1lc1tuYW1lXTtcclxuICAgICAgICBjb25zb2xlLmxvZygnVGltZXInLCBuYW1lLCAnZGlmZk1zZWMnLCB0aW1lLmRpZmZNc2VjKTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydHMuVGltZXIgPSBUaW1lcjtcclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE1LDIwMTYgQ2hyaXN0aWFuIEZyaWVkbCA8TWFnLkNocmlzdGlhbi5GcmllZGxAZ21haWwuY29tPlxyXG4gKlxyXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBCSk8yLlxyXG4gKlxyXG4gKiBCSk8yIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcclxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcclxuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXHJcbiAqXHJcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxyXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxyXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXHJcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXHJcbiAqXHJcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXHJcbiAqIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtOyBpZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXHJcbiAqL1xyXG5cclxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XHJcblxyXG5mdW5jdGlvbiBndWlkKCkge1xyXG4gIGZ1bmN0aW9uIHM0KCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKDEgKyBNYXRoLnJhbmRvbSgpKSAqIDB4MTAwMDApXHJcbiAgICAgIC50b1N0cmluZygxNilcclxuICAgICAgLnN1YnN0cmluZygxKTtcclxuICB9XHJcbiAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xyXG4gICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNTdHJpbmcocykgeyByZXR1cm4gKHMgaW5zdGFuY2VvZiBTdHJpbmcgfHwgdHlwZW9mKHMpID09PSAnc3RyaW5nJykgfVxyXG5cclxuZnVuY3Rpb24gaXNJbkVudW0odmFsdWUsIGVudW1lcmF0aW9uKSB7IFxyXG4gICAgICAgICAgICByZXR1cm4gXyhfKGVudW1lcmF0aW9uKS52YWx1ZXMoKSkuY29udGFpbnModmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzdHJpbmdFcXVhbChzMSwgczIpIHsgcmV0dXJuIHMxLnRvU3RyaW5nKCkgPT09IHMyLnRvU3RyaW5nKCk7IH1cclxuXHJcbmV4cG9ydHMuZ3VpZCA9IGd1aWQ7XHJcbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcclxuZXhwb3J0cy5pc0luRW51bSA9IGlzSW5FbnVtO1xyXG4iLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjguM1xuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kLFxuICAgIG5hdGl2ZUNyZWF0ZSAgICAgICA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuOC4zJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIG9wdGltaXplQ2IgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVBc3NpZ25lciA9IGZ1bmN0aW9uKGtleXNGdW5jLCB1bmRlZmluZWRPbmx5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBwcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4gIC8vIHNob3VsZCBiZSBpdGVyYXRlZCBhcyBhbiBhcnJheSBvciBhcyBhbiBvYmplY3RcbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBwcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICBmdW5jdGlvbiBjcmVhdGVSZWR1Y2UoZGlyKSB7XG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAvLyBpbiB0aGUgbWFpbiBmdW5jdGlvbiB3aWxsIGRlb3B0aW1pemUgdGhlLCBzZWUgIzE5OTEuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCkge1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGNyZWF0ZVJlZHVjZSgxKTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBrZXk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGtleSA9IF8uZmluZEluZGV4KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gXy5maW5kS2V5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKGNiKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIGl0ZW0gKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGVzID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCBpdGVtLCBmcm9tSW5kZXgpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcbiAgICAgIHJldHVybiBmdW5jID09IG51bGwgPyBmdW5jIDogZnVuYy5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBzdGFydEluZGV4KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLCBpZHggPSAwO1xuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvL2ZsYXR0ZW4gY3VycmVudCBsZXZlbCBvZiBhcnJheSBvciBhcmd1bWVudHMgb2JqZWN0XG4gICAgICAgIGlmICghc2hhbGxvdykgdmFsdWUgPSBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QpO1xuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgb3V0cHV0Lmxlbmd0aCArPSBsZW47XG4gICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuemlwKGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcbiAgXy51bnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5ICYmIF8ubWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IF8ucGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgobGlzdCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGZpbmRJbmRleCBhbmQgZmluZExhc3RJbmRleCBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoMSk7XG4gIF8uZmluZExhc3RJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKC0xKTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBpbmRleE9mIGFuZCBsYXN0SW5kZXhPZiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlSW5kZXhGaW5kZXIoZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGlkeCA+PSAwID8gTWF0aC5taW4oaWR4ICsgMSwgbGVuZ3RoKSA6IGlkeCArIGxlbmd0aCArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpZHhdID09PSBpdGVtID8gaWR4IDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICBpZHggPSBwcmVkaWNhdGVGaW5kKHNsaWNlLmNhbGwoYXJyYXksIGksIGxlbmd0aCksIF8uaXNOYU4pO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgPyBpZHggKyBpIDogLTE7XG4gICAgICB9XG4gICAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICAgIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBfID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcyA8PSAxKSBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcblxuICAgIC8vIENvbnN0cnVjdG9yIGlzIGEgc3BlY2lhbCBjYXNlLlxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgICBpZiAoXy5oYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdFxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICBfLm1hcE9iamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHRzID0ge30sXG4gICAgICAgICAgY3VycmVudEtleTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXG4gIC8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuICBfLmV4dGVuZE93biA9IF8uYXNzaWduID0gY3JlYXRlQXNzaWduZXIoXy5rZXlzKTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBrZXkgb24gYW4gb2JqZWN0IHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIG9iaiA9IG9iamVjdCwgaXRlcmF0ZWUsIGtleXM7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKG9pdGVyYXRlZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7IHJldHVybiBrZXkgaW4gb2JqOyB9O1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG5cbiAgICB2YXIgYXJlQXJyYXlzID0gY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIGlmICghYXJlQXJyYXlzKSB7XG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzIG9yIGBBcnJheWBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuXG4gICAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIC8vIEl0J3MgZG9uZSBoZXJlIHNpbmNlIHdlIG9ubHkgbmVlZCB0aGVtIGZvciBvYmplY3RzIGFuZCBhcnJheXMgY29tcGFyaXNvbi5cbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XG4gICAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoYXJlQXJyYXlzKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgYVN0YWNrLCBiU3RhY2spKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XG4gICAgICAgIGlmICghKF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbiAgLy8gSUUgMTEgKCMxNjIxKSwgYW5kIGluIFNhZmFyaSA4ICgjMTkyOSkuXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFByZWRpY2F0ZS1nZW5lcmF0aW5nIGZ1bmN0aW9ucy4gT2Z0ZW4gdXNlZnVsIG91dHNpZGUgb2YgVW5kZXJzY29yZS5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IGZ1bmN0aW9uKCl7fSA6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB2b2lkIDAgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiJdfQ==
