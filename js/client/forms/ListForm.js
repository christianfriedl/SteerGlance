(function(window) {
    "use strict";

    var ListForm = {};
    ListForm.createFieldHtml = function(id, field) {
        if ( field.isEditable ) {
            return '<td><input class="edit-field" id="field-' + id + '-' + field.name + '" name="' + field.name + '" type="text" value="' + (field.value ? field.value : '') + '" /></td>'; 
        } else {
            return '<td><input type="hidden" id="field-' + id + '-' + field.name + '" name="' + field.name + '" value="' + (field.value ? field.value : '') + '" />' + (field.value ? field.value : '') + '</td>'; 
        }
    };

    ListForm.createInsertRowHtml = function(row) {
        return '<tr class="edit insert" id="insert-row">' 
            + _(row.fields).reduce(function(memo, field) { 
                var field2 = { name: field.name, isEditable: field.isEditable, value: '' };
                return memo + ListForm.createFieldHtml('insert', field2); 
            }, '')
        + '</tr>';
    };
    ListForm.createRowHtml = function(row) {
        return '<tr class="edit" id="edit-row-' + row.id + '">' 
            + _(row.fields).reduce(function(memo, field) {
                return memo + ListForm.createFieldHtml(row.id, field) 
            }.bind(ListForm) , '')
        + '</tr>'; 
    }

    ListForm.createHtml = function(cssId, data) {
        var html = `
            <form id="` + cssId + `">
                <table class="list-form">
                    <thead>
                    <tr class="head">`
                        + _(data.rows[0].fields).reduce(function(memo, field) { 
                            return memo 
                            + '<th>' + field.label + '</th>'; 
                        }, '')
                    + `</tr>`
                    + `</thead>
                    <tbody>`
                    + _(data.rows).reduce(function(memo, row) { 
                        return memo + ListForm.createRowHtml(row);
                    }.bind(ListForm), '')
                    + `</tbody>
                    <tfoot>`
                    + this.createInsertRowHtml(data.rows[0])
                    + `<tr class="foot">`
                        + _(data.aggregateRow).reduce(function(memo, field) {
                            console.log('_agg',field);
                            if ( field.className==='sql.CalcField' ) {
                                return memo + '<td>' + field.value + '</td>';
                            } else {
                                return memo + '<td>&nbsp;</td>';
                            }
                        }, '')
                    + `</tr>
                    <tr>
                        <th>&nbsp;</th>
                        <td>count: <span id="count">` + data.count + `</td>
                    </tr>
                    </tfoot>
                </table>
            </form>
    <script>
    </script>
        `;
        return html;
    };

    ListForm.save = function(formId) {
        $.ajax(data.url, {
            type: 'POST',
            data: $('#' + formId).serialize(),
            success: function(data) {
                console.log(data);
            }

        });

    };

    ListForm.afterCreateHtml = function(cssId, data) {
        _(data.rows).each(function(row) {
            ListForm.addJQueryFieldHandlers(cssId, 'edit-row-' + row.id, row, data.module, data.controller);
        });
        ListForm.addJQueryFieldHandlers(cssId, 'insert-row', data.rows[0], data.module, data.controller);

    }

    ListForm.addJQueryFieldHandlers = function(cssId, rowCssId, row, module, controller) {
        $('#' + cssId + ' #' + rowCssId + ' input.edit-field').change(function(ev) {
            ev.preventDefault();
            var m = undefined;
            if ( m = ($(this).attr('id').match(/^field-(\w+)-(\w+)$/)) ) {
                var id = m[1];
                var fieldName = m[2];
                var ajaxData = { row: serializeRow(cssId, id), fieldName: fieldName, id: id };

                var saveFieldUrl = '/' + [module, controller, 'saveField'].join('/');
                console.log(saveFieldUrl);
                var countUrl = '/' + [module, controller, 'count'].join('/');

                $.ajax({
                    type: 'POST', 
                    url: saveFieldUrl,
                    data: JSON.stringify(ajaxData),
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function(data) {
                        if ( data.flags.hasInserted ) {
                            var oldRowHtml = ListForm.createRowHtml(data.row);
                            var newInsertRowHtml = ListForm.createInsertRowHtml(data.row);

                            $('#' + cssId + ' table.list-form tfoot tr#insert-row').remove();
                            $('#' + cssId + ' table.list-form tfoot').prepend(newInsertRowHtml);
                            $('#' + cssId + ' table.list-form tbody').append(oldRowHtml);
                            console.log(data);
                            ListForm.updateCount(cssId, data.count);
                            ListForm.addJQueryFieldHandlers(cssId, 'edit-row-' + data.row.id, data.row, data.module, data.controller);
                            ListForm.addJQueryFieldHandlers(cssId, 'insert-row', data.row, data.module, data.controller);
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {alert("ERROR:" + xhr.responseText+" - "+thrownError);} 
                });
            }
        })
        .click(function(ev) {
            if ( getSelection().type === 'Caret' ) {
                this.setSelectionRange(0, $(this).val().length);
            }
        });
    };

    ListForm.updateCount = function(cssId, count) {
        $('#' + cssId + ' #count').html(count);
    }

            function idFieldValue(row) { 
                var field = _(row.fields).find(function(f) { return f.name === 'id'; });
                if ( field ) { 
                    return field.value;
                } else {
                    return null;
                }
            }
            function serializeRow(formId, rowId) {
                var rv = {};
                $('#' + formId + ' [id^=field-' + rowId + ']').each(function(i, f) { rv[$(f).attr('name')] = $(f).val(); });
                return rv;
            }
    window.ListForm = ListForm;
})(window);
