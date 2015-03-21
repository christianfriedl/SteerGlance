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

        var form = FormRouter.route(data);
        console.log('UI display form:', form);

        var html = form.createHtml(data);
        console.log('UI display html:', html);
        var div = $(html);
        $('#bjo-ui').remove();
        $('body').append(div);

    };

    window.UI = Clazz;
})(window);
