(function(window) {
    "use strict";
    var UI = function() {
        this._data = null;
    };

    UI.prototype.setData = function(data) {
        this._data = data;
    };

    UI.prototype.display = function(url, data) {
        var cssId = 'bjo-main-form';
        data.url = url;
        if ( typeof(data) !== 'undefinded' ) {
            this.setData(data);
        }

        var form = FormRouter.route(data);

        var html = form.createHtml(cssId, data);
        $('#bjo-ui').html(html);
        form.afterCreateHtml(cssId, data);
    };

    window.UI = UI;
})(window);
