/*
 * Copyright (C) 2015,2016 Christian Friedl <Mag.Christian.Friedl@gmail.com>
 *
 * This file is part of BJO2.
 *
 * Mapitor is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses/>.
 */

(function(window) {
    "use strict";
    var UI = function() {
        this._data = null;
    };

    UI.prototype.setData = function(data) {
        this._data = data;
    };

    UI.prototype.display = function(cssId, url, data) {
        data.url = url;
        if ( typeof(data) !== 'undefinded' ) {
            this.setData(data);
        }

        var form = FormRouter.route(data, cssId);
        console.log('uidisplay form data', data);

        var html = form.toHtml();
        $('#' + cssId).html(html);
    };

    window.UI = UI;
})(window);
