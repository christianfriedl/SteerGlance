(function(window) {
    "use strict";

    var Clazz = function(data) {
        this._data = data;
        this._data.headrow=data.rows[0].row;
    };

    Clazz.prototype.createFieldHtml = function(row, field) {
        if ( field.isEditable ) {
            return '<td><input id="field-' + row.id + '-' + field.name + '" name="' + field.name + '" type="text" value="' + (field.value ? field.value : '') + '" /></td>'; 
        } else {
            return '<td>' + (field.value ? field.value : '') + '</td>'; 
        }
    };

    Clazz.prototype.createHtml = function() {
        var html = `
            <form id="bjo-main-form">
                <table class="list-form">
                    <tr class="head">`
                        + _(this._data.headrow).reduce(function(memo, field) { 
                            return memo 
                            + '<th>' + field.label + '</th>'; 
                        }, '')
                    + `</tr>`
                    + _(this._data.rows).reduce(function(memo, row) { 
                        return memo + 
                        '<tr class="edit">' 
                            + _(row.fields).reduce(function(memo, field) {
                                return memo + this.createFieldHtml(row, field) 
                            }.bind(this) , '')
                        + '</tr>'; 
                    }.bind(this), '')
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
                        <td><button class="save">save</button></td>
                    </tr>
                </table>
            </form>
    <script>
            $(document).ready(function() {
                $('#bjo-main-form button.save').click(function(evt) {
                    console.log('saving...');
                    evt.preventDefault();
                    console.log('serailize', $('#bjo-main-form').serialize());
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
            });
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
