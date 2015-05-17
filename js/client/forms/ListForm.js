(function(window) {
    "use strict";

    var Clazz = function(data) {
        this._data = data;
        this._data.headrow=data.rows[0].row;
        this._template = `
            <form id="bjo-main-form">
                <table class="list-form">
                    <tr class="head">
                    {{#each headrow}}
                        <th>{{label}}</th>
                    {{/each}}
                    </tr>
                    {{#each rows}}
                        <tr class="edit">
                        {{#each row}}
                            <td><input id="field-{{id}}-{{name}}" name="{{name}}" type="text" value="{{value}}" /></td>
                        {{/each}}
                        </tr>
                    {{/each}}
                    <tr class="foot">
                    {{#each aggregateRow}}
                        {{#xif "this.className=='sql.CalcField'"}}<td>{{value}}</td>
                        {{else}}<td>&nbsp;</td>
                        {{/xif}}
                    {{/each}}
                    </tr>
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
    };

    Clazz.prototype.createHtml = function() {
        var hbTemplate = Handlebars.compile(this._template);
        var html = hbTemplate(this._data);
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
