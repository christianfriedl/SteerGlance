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
        data = { action: 'edit', firstName: 'erster', lastName: 'letzer' };

        var form = FormRouter.route(data);
          

        var html = form.createHtml(data);
        var div = $(html);
        $('#bjo-ui').remove();
        $('body').append(div);

    };

    window.UI = Clazz;
})(window);
