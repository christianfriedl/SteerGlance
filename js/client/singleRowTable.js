(function(window) {
    var document = window.document;
    function SingleRowTable(cssId, row, saveFieldFunc) {
        this._cssId = cssId;
        this._row = row;
        this._headerCellRenderFunc = CellRenderer.renderHeaderCell;
        this._bodyCellRenderFunc = CellRenderer.renderBodyCell;
        this._saveFieldFunc = saveFieldFunc;
    }

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

    ///////////////////////////////////

    window.SingleRowTable = SingleRowTable;
})(window);
