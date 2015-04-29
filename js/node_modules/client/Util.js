(function(window) {
    "use strict";

    var Clazz = function() {};

    Clazz.loadJs = function(fileName) {
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    };

    window.Util = Clazz;
})(window);
