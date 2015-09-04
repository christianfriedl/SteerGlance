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

    var Clazz = function(data) {
        this._data = data;
        this._template = `
            <form id="bjo-main-form">
                <table class="card-form">
                    {{#each row}}
                        <tr>
                            <th>{{label}}</th>
                            <td><input name="{{name}}" type="text" value="{{value}}" /></td>
                        </tr>
                    {{/each}}
                    <tr>
                        <th>&nbsp;</th>
                        <td><button class="save">save</button></td>
                    </tr>
                </table>
            </form>
    <script>
            $(document).ready(function() {
                $('#bjo-main-form button.save').click(function(evt) {
                    console.log('saving...');
                    evt.preventDefault();
                    console.log('serailize', $('#bjo-main-form').serialize());
                    $.ajax( 
                        {
                            type: 'POST', 
                            url: '/{{module}}/{{controller}}/save',
                            data: $('#bjo-main-form').serialize(),
                            dataType: 'json',
                            success: function(data) {
                                console.log('success!', data);
                            },
                            error: function (xhr, ajaxOptions, thrownError) {alert("ERROR:" + xhr.responseText+" - "+thrownError);} 
                        }
                    );
                });
            });
    </script>
        `;
    };

    Clazz.prototype.createHtml = function() {
        var hbTemplate = Handlebars.compile(this._template);
        var html = hbTemplate(this._data);
        return html;
    };

    Clazz.prototype.save = function(formId) {
        $.ajax(this._data.url, {
            type: 'POST',
            data: $('#' + formId).serialize(),
            success: function(data) {
                console.log(data);
            }

        });

    };

    window.EditForm = Clazz;
})(window);
