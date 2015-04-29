(function(window) {
    "use strict";

    var Clazz = function() {}

    Clazz.route = function(data) {
        switch ( data.action ) {
            case 'edit':
                return new EditForm();
                break;

            default:
                throw 'no such action as ' + data.action;
        }
    };

    window.FormRouter = Clazz;
})(window);
