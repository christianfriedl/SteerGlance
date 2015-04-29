(function(window) {
    "use strict";

    var Clazz = function(data) {
        this._data = data;
        this._template = `
            <form id="bjo-main-form">
                <table class="card-form">
                    {{#each row}}
                        <tr>
                            <th>{{label}}</th>
                            <td><input name="{{name}}" type="text" value="{{value}}" /></td>
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
                            type: 'GET', // TODO Duh!!!! post does not work
                            url: '/{{module}}/{{controller}}/save',
                            data: $('#bjo-main-form').serialize(),
                        async: false,
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

    window.EditForm = Clazz;
})(window);
