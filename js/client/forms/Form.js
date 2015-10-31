/*
 * Copyright (C) 2015 Christian Friedl <Mag.Christian.Friedl@gmail.com>
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

    function Form(data, cssId) {
        this._data = data;
        this._cssId = cssId;
    }

    Form.OpenLookupScript = function(data, cssId) {
        Form.call(this, data, cssId);
    };

    Form.OpenLookupScript.prototype.toHtml = function() {
        return `
            <script>
                function openLookupPopup(hiddenFieldId, optionsJson, module, controller) {
                    var options = JSON.parse(optionsJson);
                    var html = '<select id="lookup-select-' + hiddenFieldId + '">'
                        + '<option>select...</option>'
                        + _(_(options).keys()).reduce(function(memo, key) {
                            return memo + '<option value="' + key + '">' + options[key] + '</option>';
                        })
                        + '</select>';
                    jQuery('#lookupPopup').html(html).dialog();
                    jQuery('#lookup-select-' + hiddenFieldId).change(function(ev) {
                        console.log(jQuery(this), jQuery(this).val());
                        jQuery('#' + hiddenFieldId).val(jQuery(this).val());
                        jQuery('#lookupPopup').dialog('close');
                        ListForm.handleFieldChange('` + this._cssId + `', hiddenFieldId, module, controller);
                    });
                }
            </script>
        `;
    };

    window.Form = Form;
})(window);