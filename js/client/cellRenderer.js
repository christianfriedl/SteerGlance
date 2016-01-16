(function(window){
    function CellRenderer() {}

    CellRenderer.Editable = function() {}

    CellRenderer.NonEditable = function() {}

    CellRenderer.renderHeaderCell = function(el, fieldIdx, field) {
        jQuery(el).html(field.label);
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
})(window);
