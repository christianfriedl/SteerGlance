(function(window) {
    var document = window.document;
    function LazyTable(cssId, count, fetchRowsFunc, fetchTemplateRowFunc, saveFieldFunc) {
        this._cssId = cssId;
        this._fetchRowsFunc = fetchRowsFunc;
        this._fetchTemplateRowFunc = fetchTemplateRowFunc;
        this._fetchedRows = [];
        this._count = count;
        this._headerCellRenderFunc = CellRenderer.renderHeaderCell;
        this._bodyCellRenderFunc = CellRenderer.renderBodyCell;
        this._saveFieldFunc = saveFieldFunc;
        this._shouldCheckScroll = true;

        var inputDimensions = this._getDefaultInputDimensions();
        this._rowHeight = inputDimensions.height + 2;
        this._cellWidth = inputDimensions.width + 4;
        this._rowWidth = 1000;
        this._scrollTimeoutMsec = 10;

        this._lastScrollTop = null;
        this._screenSizeGraceRows = 10;
    }

    LazyTable.prototype.constructor = LazyTable;

    LazyTable.prototype._fetchData = function(startIdx, count, callback) {
        //console.log('fetchdata', startIdx, count);
        this._fetchRowsFunc(startIdx, count).done(function(rows) { callback(startIdx, rows); });
    };

    /**
     * initial rendering
     */
    LazyTable.prototype.render = function() {
        this._fetchTemplateRowFunc().done(function(row) {
            this._templateRow = row;
            this._rowWidth = this._templateRow.fields.length * (this._cellWidth + 2);
            var dfd = jQuery.Deferred();
            dfd.resolve();
            return dfd;
        }.bind(this)).done(function() {
            this._tableEl = jQuery('<div/>').attr('id', 'table').css({ position: 'relative',  });
            LazyTable.allWidths(this._tableEl, this._rowWidth);
            LazyTable.allHeights(this._tableEl, (this._rowHeight * (this._count + 1)));

            var headerRowCss = { 
                    height: this._rowHeight + 'px',
                    position: 'fixed',
                    'z-index': 1,
                    border: '1px solid green',
                    overflow: 'hidden'
            };
            this._headerRowEl = jQuery('<div>').attr('id', 'header-row').css(headerRowCss);
            LazyTable.allWidths(this._headerRowEl, this._rowWidth);
            jQuery(this._headerRowEl).addClass('header-row');
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

            this._viewportEl = jQuery('#' + this._cssId);
            this._viewportEl.addClass('lazy-table viewport');
            jQuery(this._viewportEl).css({ height: '100%', position: 'relative', width: '100%', overflow: 'scroll' });
            jQuery(this._viewportEl).attr('id', 'myid');
            var scrollFunc = function() { this._scrollTo(jQuery(this._viewportEl).scrollTop(), jQuery(this._viewportEl).scrollLeft()); }.bind(this);
            jQuery(this._viewportEl).scroll(scrollFunc);
            jQuery(this._viewportEl).resize(scrollFunc);
            jQuery(this._viewportEl).append(this._tableEl);
            jQuery(this._headerRowEl).css({
                top: (jQuery(this._tableEl).offset().top),
                left: (jQuery(this._tableEl).offset().left)
            });
            this._fetchData(0, this._viewportRows() + this._screenSizeGraceRows, function(startIdx, rows) {
                this._mergeFetchedRows(startIdx, rows);
                this._renderFetchedRows();
            }.bind(this)); // TODO interface to outside for templaterow -- we need it now for code below
        }.bind(this));
    };

    LazyTable.prototype._viewportRows = function() {
        var height = jQuery(this._viewportEl).height();
        return Math.floor(height / this._rowHeight);
    };

    LazyTable.prototype._scrollTo = function(scrollTop, scrollLeft) {
        this._lastScrollTop = scrollTop;
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
            var fetchStartIdx = Math.max(startIdx - this._screenSizeGraceRows, 0)
            var fetchCount = Math.min(this._viewportRows() + 2 * this._screenSizeGraceRows, this._count - fetchStartIdx) + 1;
            this._fetchData(fetchStartIdx, fetchCount, function(startIdx, rows) {
                this._mergeFetchedRows(startIdx, rows);
                this._renderFetchedRows();
                this._emptyCache(startIdx);
            }.bind(this));
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
            //console.log('remove', i);
            delete this._fetchedRows[i];
            jQuery('#row-' + i).remove();
        }
        for (i = keepEnd; i < count; ++i) {
            //console.log('remove', i);
            delete this._fetchedRows[i];
            jQuery('#row-' + i).remove();
        }
    };


    LazyTable.prototype._renderFetchedRows = function() {
        var rows = this._fetchedRows;
        var rowsLength = rows.length;
        var rowIdx, fieldIdx;
        for ( rowIdx = 0; rowIdx  < rowsLength; ++rowIdx ) {
            if ( typeof(rows[rowIdx]) !== 'undefined' ) {
                //console.log('render', rowIdx);
                var fieldsLength = rows[rowIdx].fields.length;
                var rowCss = { 
                        top: ((rowIdx + 1) * this._rowHeight) + 'px',
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
                for ( fieldIdx = 0; fieldIdx < fieldsLength; ++fieldIdx ) {
                    this._renderCell(rowDiv, rowIdx, fieldIdx, rows[rowIdx].fields[fieldIdx]);
                }
            }
        }
    };

    LazyTable.prototype._renderCell = function(div, rowIdx, fieldIdx, field) {
        // console.log('_renderCell', rowIdx, fieldIdx);
        var css = { 
                // top: 0,
                // left: (fieldIdx * this._cellWidth) + 'px',
                width: this._cellWidth + 'px',
                height: this._rowHeight + 'px',
                position: 'relative',
                float: 'left',
                overflow: 'hidden'
        };
        var el = jQuery('<div/>').css(css).attr('id', 'cell-' + fieldIdx);
        jQuery(el).addClass('body cell');
        if ( fieldIdx === this._templateRow.fields.length - 1 ) {
            jQuery(el).addClass('last');
        }
        if ( rowIdx % 2 === 0 ) {
            jQuery(el).addClass('even');
        } else {
            jQuery(el).addClass('odd');
        }
        jQuery(div).append(el);
        this._bodyCellRenderFunc(el, rowIdx, fieldIdx, field);
    };

    LazyTable.prototype._mergeFetchedRows = function(startIdx, rows) {
        for ( var i = 0; i < rows.length; ++i ) { // TODO optimize
            //console.log('merge', startIdx + i);
            this._fetchedRows[startIdx + i] = rows[i];
        }
    };

    LazyTable.prototype._getDefaultInputDimensions = function() {
        return { width: 200, height: 25 };
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

    ///////////////////////////////////

    function CellRenderer() {}

    CellRenderer.Editable = function() {}

    CellRenderer.NonEditable = function() {}

    CellRenderer.renderHeaderCell = function(el, fieldIdx, field) {
        jQuery(el).html(field.label);
    };

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
        matrixLine.func.bind(this)(el, rowIdx, fieldIdx, field);
    };

    CellRenderer.Editable.renderStringField = function(el, rowIdx, fieldIdx, field) {
        var input = jQuery('<input type="text" id="' + this._getFieldId + '" name="' + field.name + '" value="' + field.value + '" />');
        jQuery(input).addClass('edit');
        jQuery(el).append(input);
        var self = this;
        jQuery(input).change(function() {
            self._saveFieldFunc({ id: self._fetchedRows[rowIdx].id, field: { name: field.name, value: jQuery(this).val() }}).done(function(resp) { console.log(resp); });
        });
    };

    CellRenderer.Editable.renderBoolField = function(el, rowIdx, fieldIdx, field) {
        var inner = jQuery('<div/>');
        inner.addClass('bool');
        var input = jQuery('<input type="checkbox" id="' + this._getFieldId + '" name="' + field.name + '" value="' + (field.value ? 'checked="checked"' : '' )+ ' />');
        inner.append(input);
        jQuery(el).append(inner);
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

    CellRenderer._getFieldId = function(el, rowIdx, fieldIdx, field) {
        return 'edit-' + field.name + '-' + rowIdx + '-' + fieldIdx;
    };

    CellRenderer.BodyCellRenderingMatrix = [
        { isEditable: true, className: 'Field', dataType: 'string', func: CellRenderer.Editable.renderStringField },
        { isEditable: true, className: 'Field', dataType: 'int', func: CellRenderer.Editable.renderStringField },
        { isEditable: null, className: 'Field', dataType: 'bool', func: CellRenderer.Editable.renderBoolField },
        { isEditable: false, className: 'Field', dataType: 'string', func: CellRenderer.NonEditable.renderStringField },
        { isEditable: false, className: 'Field', dataType: 'int', func: CellRenderer.NonEditable.renderNumberField },
        { isEditable: null, className: null, dataType: null, func: CellRenderer.NonEditable.renderStringField },
        // TODO: date, (time), options, lookup
    ];

    window.LazyTable = LazyTable;
})(window);
