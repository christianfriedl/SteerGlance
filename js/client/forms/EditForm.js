(function(window) {
    "use strict";

    var Clazz = function() {
        this._template = `
            <form id="bjo-main-form">
                <table class="card-form">
                    <tr>
                        <th>firstName</th>
                        <td><input name="firstName" type="text" value="{{firstName}}" /></td>
                    </tr>
                    <tr>
                        <th>firstName</th>
                        <td><input name="lastName" type="text" value="{{lastName}}" /></td>
                    </tr>
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
