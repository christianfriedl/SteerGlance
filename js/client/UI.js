(function(window) {
    "use strict";
    var Clazz = function() {
        this._data = null;
    };

    Clazz.prototype.setData = function(data) {
        this._data = data;
    };

    Clazz.prototype.display = function(url, data) {
        var cssId = 'bjo-main-form';
        data.url = url;
        if ( typeof(data) !== 'undefinded' ) {
            this.setData(data);
        }

        var form = FormRouter.route(data);
        console.log('UI display form:', form);

        var html = form.createHtml(cssId, data);
        console.log('UI display html:', html);
        $('#bjo-ui').html(html);
        form.afterCreateHtml(cssId, data);
    };

    window.UI = Clazz;
})(window);
