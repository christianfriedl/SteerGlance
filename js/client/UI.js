(function(window) {
    "use strict";
    var Clazz = function() {
        this._data = null;
    };

    Clazz.prototype.setData = function(data) {
        this._data = data;
    };

    Clazz.prototype.display = function(data) {
        if ( typeof(data) !== 'undefinded' ) {
            this.setData(data);
        }
        data = { firstName: 'erster', lastName: 'letzer' };

        var rawHtml = `
            <div id="bjo-ui" class="bjo-ui">
                <form>
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
            </div>
        `;
        var template = Handlebars.compile(rawHtml);
        var context = data;
        var html = template(context);
        var div = $(html);
        $('#bjo-ui').remove();
        $('body').append(div);
        console.log('harg', data);
    };

    window.UI = Clazz;
})(window);
