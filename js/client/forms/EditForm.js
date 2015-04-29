(function(window) {
    "use strict";

    var Clazz = function() {
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
                        <td><button onClick="">save</button></td>
                    </tr>
                </table>
            </form>
        `;
    };

    Clazz.prototype.createHtml = function(data) {
        var hbTemplate = Handlebars.compile(this._template);
        var html = hbTemplate(data);
        return html;
    };

    window.EditForm = Clazz;
})(window);
