(function(window) {
    var document = window.document;
    function LazyTable(cssId, count, fetchRowsFunc, fetchTemplateRowFunc) {
        this._cssId = cssId;
        this._viewportEl = jQuery('#' + cssId);
        this._viewportEl.css({ position: 'relative' });
        this._viewportEl.addClass('lazy-table viewport');
        this._fetchRowsFunc = fetchRowsFunc;
        this._fetchTemplateRowFunc = fetchTemplateRowFunc;
        this._fetchedRows = [];
        this._count = count;
        this._headerCellRenderFunc = LazyTable._renderHeaderCell;
        this._bodyCellRenderFunc = LazyTable._renderBodyCell;
        this._shouldCheckScroll = true;

        var inputDimensions = this._getDefaultInputDimensions();
        this._rowHeight = inputDimensions.height + 2;
        this._cellWidth = inputDimensions.width + 4;
        this._scrollTimeoutMsec = 100;

        this._lastScrollTop = null;
        this._screenSizeGraceRows = 10;


        this._fetchTemplateRowFunc().done(function(row) {
            this._templateRow = row;
        }.bind(this));

        this._rowWidth = this._templateRow.fields.length * this._cellWidth;
        this._tableEl = jQuery('<div/>').attr('id', 'table').css({ position: 'relative', width: (this._rowWidth + 'px'), height: (this._rowHeight * (this._count + 1)) + 'px' });
        var headerRowCss = { 
                top: 0,
                left: 0,
                width: (this._cellWidth * this._templateRow.fields.length) + 'px',
                height: this._rowHeight + 'px',
                position: 'absolute',
                border: '1px solid green',
                overflow: 'hidden'
        };
        this._headerRowEl = jQuery('<div>').attr('id', 'header-row').css(headerRowCss);
        jQuery(this._headerRowEl).addClass('header-row');
        this._tableEl.append(this._headerRowEl);
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
        for (var i=0; i < this._templateRow.fields.length; ++i ) {
            var css = { 
                    width: this._cellWidth + 'px',
                    height: this._rowHeight + 'px',
                    position: 'relative',
                    float: 'left',
                    border: '1px solid red',
                    overflow: 'hidden'
            };
            var el = jQuery('<div/>').css(css).attr('id', 'header-cell-' + i);
            jQuery(el).addClass('header-cell');
            jQuery(this._headerRowEl).append(el);
            this._headerCellRenderFunc(el, i, this._templateRow.fields[i]);
        }

        jQuery(this._viewportEl).css({ border: '1px solid red', height: '100%', position: 'relative', width: '100%', overflow: 'scroll' });
        jQuery(this._viewportEl).attr('id', 'myid');
        var scrollFunc = function() { this._scrollTo(jQuery(this._viewportEl).scrollTop()); }.bind(this);
        jQuery(this._viewportEl).scroll(scrollFunc);
        jQuery(this._viewportEl).resize(scrollFunc);
        jQuery(this._viewportEl).append(this._tableEl);
        this._fetchData(0, this._viewportRows() + this._screenSizeGraceRows, function(startIdx, rows) {
            this._mergeFetchedRows(startIdx, rows);
            this._renderFetchedRows();
        }.bind(this)); // TODO interface to outside for templaterow -- we need it now for code below
    };

    LazyTable.prototype._viewportRows = function() {
        var height = jQuery(this._viewportEl).height();
        return Math.floor(height / this._rowHeight);
    };

    LazyTable.prototype._scrollTo = function(scrollTop) {
        this._lastScrollTop = scrollTop;
        if ( this._shouldCheckScroll ) {
            this._shouldCheckScroll = false;
            window.setTimeout(function() {
                this._innerScrollTo(jQuery(this._viewportEl).scrollTop());
                this._shouldCheckScroll = true;
            }.bind(this), this._scrollTimeoutMsec);
        }
    };

    LazyTable.prototype._innerScrollTo = function(scrollTop) {
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
                        width: (this._cellWidth * fieldsLength) + 'px',
                        height: this._rowHeight + 'px',
                        position: 'absolute',
                        border: '1px solid blue',
                        overflow: 'hidden'
                };
                var rowDiv = jQuery('<div/>').attr('id', 'row-' + rowIdx);
                rowDiv.css(rowCss);
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
                border: '1px solid red',
                overflow: 'hidden'
        };
        var el = jQuery('<div/>').css(css).attr('id', 'cell-' + fieldIdx);
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
        var el = jQuery('<input type="text" />');
        jQuery(this._viewportEl).append(el);
        var dims = { width: jQuery(el).width(), height: jQuery(el).height() };
        console.log('dims', dims);
        jQuery(el).remove();
        return dims;
    };

    /////////////////////////

    /*
     * static functions, default renderers...
     */

    LazyTable._renderHeaderCell = function(el, fieldIdx, field) {
        jQuery(el).html(field.name);
    };

    LazyTable._renderBodyCell = function(el, rowIdx, fieldIdx, field) {
        jQuery(el).html(field.value);
    };


    window.LazyTable = LazyTable;
})(window);
