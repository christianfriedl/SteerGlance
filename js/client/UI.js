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
    };

    /**
     * formName is "editForm", not EditForm!
     */
    UI.prototype.displayForm = function(cssId, formName, data) {
        data.form = formName;

        var form = window[formName].call({}, data, cssId);
        var html = form.toHtml();
        jQuery('#' + cssId).html(html);
    };

    window.UI = UI;
})(window);
