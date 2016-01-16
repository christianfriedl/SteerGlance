(function(window) {
    var document = window.document;
    function SingleRowTable(cssId, functionObject) {
        this._cssId = cssId;
        this._countFunc = functionObject.count;
        this._fetchRowFunc = functionObject.fetchRows;
        this._fetchTemplateRowFunc = functionObject.fetchTemplateRow;
        this._saveFieldFunc = functionObject.saveField;
        this._fetchedRows = [];
        this._headerCellRenderFunc = CellRenderer.renderHeaderCell;
        this._bodyCellRenderFunc = CellRenderer.renderBodyCell;
    }

    SingleRowTable.prototype.constructor = SingleRowTable;

    SingleRowTable.prototype._fetchData = function(startIdx, count, callback) {
        //console.log('fetchdata', startIdx, count);
        this._fetchRowsFunc(startIdx, count, function(error, rows) { callback(startIdx, rows); });
    };

    /**
     * initial rendering
     */
    SingleRowTable.prototype.render = function() {
        var self = this;
        this._countRows(function(err, count) {
            this._count = count;
            this._fetchTemplateRow(function(error, row) {
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
                console.log('_heightIsOverflowed', this._heightIsOverflowed);
                this._rowWidth = this._templateRow.fields.length * (this._cellWidth + 4);
                SingleRowTable.allWidths(this._tableEl, this._rowWidth);
                if ( this._heightIsOverflowed ) {
                    SingleRowTable.allHeights(this._tableEl, this._maxTableHeight);
                } else {
                    SingleRowTable.allHeights(this._tableEl, (this._rowHeight * (this._count + 1)));
                }

                var headerRowCss = { 
                        height: (this._rowHeight + 4) + 'px',
                };
                this._headerRowEl = jQuery('<div/>').attr('id', 'header-row').css(headerRowCss);
                SingleRowTable.allWidths(this._headerRowEl, this._rowWidth);
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
                this._fetchData(0, this._viewportRows() + this._screenSizeGraceRows, function(startIdx, rows) {
                    this._mergeFetchedRows(startIdx, rows);
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
                    var rowIdx = parts[2];
                    var fieldIdx = parts[3];

                    var field;
                    if ( rowIdx === 'insert' ) {
                        field = self._templateRow.fields[fieldIdx];
                    } else {
                        field = self._fetchedRows[rowIdx].fields[fieldIdx];
                    }
                    console.log('change - 4', id, rowIdx, fieldIdx);
                    console.log('change: field',field,'rowidx', rowIdx, 'fieldidx', fieldIdx);


                    if ( jQuery(input).attr('type') === 'checkbox' ) {
                        value = jQuery(input).prop('checked');
                    } else {
                        value = jQuery(input).val();
                    }
                    self._saveField.bind(self);
                    self._saveField(field.name, self._createRow(rowIdx), function(err, resp) { 
                        console.log(resp);
                        if ( resp.flags.hasSaved ) {
                            if ( resp.flags.hasInserted ) {
                                self._afterInsert();
                            } else {
                                self._afterUpdate(rowIdx, resp.row);
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
            }.bind(this));
        }.bind(this));
    };

    SingleRowTable.prototype._fetchTemplateRow = function(callback) {
        return this._fetchTemplateRowFunc(callback);
    };

    SingleRowTable.prototype._countRows = function(callback) {
        return this._countFunc(callback);
    };

    SingleRowTable.prototype._saveField = function(fieldName, row, callback) {
        return this._saveFieldFunc(fieldName, row, callback);
    };

    /**
     * creates the row for saveField()
     */
    SingleRowTable.prototype._createRow = function(rowIdx) {
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

    SingleRowTable.prototype._viewportRows = function() {
        var height = jQuery(this._viewportEl).height();
        return Math.floor(height / this._rowHeight);
    };

    SingleRowTable.prototype._scrollTo = function(scrollTop, scrollLeft) {
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

    SingleRowTable.prototype._innerScrollTo = function(scrollTop, scrollLeft) {
        if ( this._lastScrollTop === scrollTop ) {
            // console.log('scroll to ', scrollTop, 'of', jQuery(this._tableEl).height());

            var startIdx = Math.round(scrollTop / this._rowHeight);
            if (this._heightIsOverflowed ) {
                console.log('startIdx old', startIdx);
                startIdx = Math.round(scrollTop / jQuery(this._tableEl).height() * this._count);
                console.log('startIdx new', startIdx);
                if ( startIdx >= this._count * 0.9 ) {
                    startIdx = this._count - this._viewportRows();
                    console.log('startIdx very new', startIdx);
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
                }(function() {
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

    SingleRowTable.prototype._emptyCache = function(startIdx) {
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


    SingleRowTable.prototype._renderFetchedRows = function(doFocusAfterwards) {
        if ( typeof(doFocusAfterwards) === 'undefined') {
            doFocusAfterwards = false;
        }
        var rows = this._fetchedRows;
        var rowsLength = this._count;
        var rowIdx, fieldIdx;
        Timer.start('_renderFetchedRows');
        var activeElId = jQuery(window.document.activeElement).attr('id');
        for ( rowIdx = 0; rowIdx  < rowsLength; ++rowIdx ) {
            if ( typeof(rows[rowIdx]) !== 'undefined' ) {
                //console.log('render', rowIdx);
                var row = rows[rowIdx];
                this._renderRow(rowIdx, row);
            }
        }
        if ( doFocusAfterwards && jQuery('#' + activeElId).length > 0 && this._isElementVisible(jQuery('#' + activeElId)) && false ) {
            jQuery('#' + activeElId).focus();
        }
        Timer.end('_renderFetchedRows');
        Timer.log('_renderFetchedRows');
    }

    SingleRowTable.prototype._renderRow = function(rowIdx, row) {
        console.log('rendering', rowIdx, row);
        var fields = row.fields;
        var fieldsLength =fields.length;
        var topPx;
        if ( rowIdx === 'insert' ) { // TODO ahem
            topPx = (5 + (this._count + 1) * this._rowHeight) + 'px';
        } else {
            topPx = (5 + (rowIdx + 1) * this._rowHeight) + 'px';
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
        SingleRowTable.allWidths(rowDiv, this._rowWidth);
        SingleRowTable.allHeights(rowDiv, this._rowHeight);
        if ( jQuery('#row-' + rowIdx).length ) {
            console.log('replacing', rowIdx, row);
            jQuery('#row-' + rowIdx).replaceWith(rowDiv);
        } else {
            console.log('appending', rowIdx, row, 'div is', rowDiv);
            jQuery(this._tableEl).append(rowDiv);
        }
        var tableWidth = jQuery(this._viewportEl).width();
        var fieldIdx = 0;
        var lastEl = null;
        var vEl = jQuery(this._viewportEl);
        var vElWidth = vEl.width();
        while ( fieldIdx === 0 || (fieldIdx > 0 && fieldIdx < fieldsLength && lastEl.offsetLeft <= vEl.scrollLeft() + vElWidth) ) {
            console.log('will render cell', rowDiv[0], rowIdx, row, 'div is', rowDiv);
            lastEl = this._renderCell(rowDiv[0], rowIdx, fieldIdx, fields[fieldIdx]);
            ++fieldIdx;
        }
    };

    SingleRowTable.prototype._renderInsertRow = function() {
        this._renderRow('insert', this._templateRow);
    };

    SingleRowTable.prototype._renderCell = function(rowDiv, rowIdx, fieldIdx, field) {
        // console.log('_renderCell', rowIdx, fieldIdx);
        var css = { 
        };
        var div = document.createElement('div');
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
        console.log('handle insert row', rowIdx, row);
        this._renderFetchedRows(true);
        this._renderInsertRow();
    };

    SingleRowTable.prototype._afterUpdate = function(rowIdx, row) {
        console.log('handle update row', rowIdx, row);
        this._fetchedRows[rowIdx] = row;
        this._renderFetchedRows(true);
        this._renderInsertRow();
    };

    /////////////////////////

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
