(function(window) {
    "use strict";

    var Clazz = function(data) {
        this._data = data;
        this._data.headrow=data.rows[0].row;
    };

    Clazz.prototype.createFieldHtml = function(id, field) {
        if ( field.isEditable ) {
            return '<td><input class="edit-field" id="field-' + id + '-' + field.name + '" name="' + field.name + '" type="text" value="' + (field.value ? field.value : '') + '" /></td>'; 
        } else {
            return '<td><input type="hidden" id="field-' + id + '-' + field.name + '" name="' + field.name + '" value="' + (field.value ? field.value : '') + '" />' + (field.value ? field.value : '') + '</td>'; 
        }
    };

    Clazz.prototype.createInsertRowHtml = function(row) {
        return '<tr class="edit insert">' 
            + _(row.fields).reduce(function(memo, field) { 
                console.log('insertrow field', field);
                var field2 = { name: field.name, isEditable: field.isEditable, value: '' };
                return memo + ListForm.prototype.createFieldHtml('insert', field2); 
            }, '')
        + '</tr>';
    };

    Clazz.prototype.createHtml = function() {
        var html = `
            <form id="bjo-main-form">
                <table class="list-form">
                    <thead>
                    <tr class="head">`
                        + _(this._data.rows[0].fields).reduce(function(memo, field) { 
                            return memo 
                            + '<th>' + field.label + '</th>'; 
                        }, '')
                    + `</tr>`
                    + `</thead>
                    <tbody>`
                    + _(this._data.rows).reduce(function(memo, row) { 
                        return memo + 
                        '<tr class="edit" id="edit-row-' + row.id + '">' 
                            + _(row.fields).reduce(function(memo, field) {
                                return memo + this.createFieldHtml(row.id, field) 
                            }.bind(this) , '')
                        + '</tr>'; 
                    }.bind(this), '')
                    + `</tbody>
                    <tfoot>`
                    + this.createInsertRowHtml(this._data.rows[0])
                    + `<tr class="foot">`
                        + _(this._data.aggregateRow).reduce(function(memo, field) {
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
                        <td>count: <span id="count">` + this._data.count + `</td>
                    </tr>
                    </tfoot>
                </table>
            </form>
    <script>
            $(document).ready(function() {
                $('#bjo-main-form button.save').click(function(evt) {
                    console.log('saving...');
                    evt.preventDefault();
                    $.ajax( 
                        {
                            type: 'POST', 
                            url: '/{{module}}/{{controller}}/save',
                            data: $('#bjo-main-form').serialize(),
                            dataType: 'json',
                            success: function(data) {
                                console.log('success!', data);
                            },
                            error: function (xhr, ajaxOptions, thrownError) {alert("ERROR:" + xhr.responseText+" - "+thrownError);} 
                        }
                    );
                });
                $('#bjo-main-form input.edit-field')
                .change(function(ev) {
                    ev.preventDefault();
                    var self = this;
                    var m = undefined;
                    if ( m = ($(this).attr('id').match(/^field-(\\w+)-(\\w+)$/)) ) {
                        var id = m[1];
                        var fieldName = m[2];
                        var data = { row: serializeRow('bjo-main-form', id), fieldName: fieldName, id: id };
                        `;

                        var saveFieldUrl = '/' + [this._data.module, this._data.controller, 'saveField'].join('/');
                        var countUrl = '/' + [this._data.module, this._data.controller, 'count'].join('/');
        html += `
                        $.ajax({
                            type: 'POST', 
                            url: '` + saveFieldUrl + `',
                            data: JSON.stringify(data),
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function(data) {
                                console.log('success data', data);
                                if ( data.flags.hasSaved ) {
                                    $('#bjo-main-form tbody #edit-row-' + idFieldValue(data.row) + ').html(
                                        _(data.row.fields).reduce(function(memo, field) {
                                            return memo + ListForm.prototype.createFieldHtml(idFieldValue(data.row), field) ;
                                        }.bind(self), '')
                                    );
                                    if ( data.flags.hasInserted ) { // old id!!!
                                        $('#bjo-main-form tbody').append('<tr><td>jjjjjj</td></tr>'); // ListForm.prototype.createInsertRowHtml(data.row));
                                        $.ajax({
                                            type: 'POST',
                                            url: '` + countUrl + `',
                                            data: JSON.stringify({conditions: []}),
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            success: function(data2) {
                                                console.log('success count data2', data2);
                                                $('#bjo-main-form #count').html(data2.count);
                                            }
                                        });
                                    }
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
            });
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
    </script>
        `;
        return html;
    };

    Clazz.prototype.save = function(formId) {
        $.ajax(this._data.url, {
            type: 'POST',
            data: $('#' + formId).serialize(),
            success: function(data) {
                console.log(data);
            }

        });

    };

    window.ListForm = Clazz;
})(window);
