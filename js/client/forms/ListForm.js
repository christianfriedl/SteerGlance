(function(window) {
    "use strict";

    var Clazz = function(data) {
        this._data = data;
        console.log('listform data', data.rows[0].row[0].label);
        this._data.headrow=data.rows[0].row;
        this._template = `
            <form id="bjo-main-form">
                <table class="card-form">
                    <tr>
                    {{#each headrow}}
                        <th>{{label}}</th>
                    {{/each}}
                    </tr>
                    {{#each rows}}
                        <tr>
                        {{#each row}}
                            <td><input name="{{name}}" type="text" value="{{value}}" /></td>
                        {{/each}}
                        </tr>
                    {{/each}}
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
