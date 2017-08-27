#!/bin/bash

(cd node_modules/SteerGlanceUI/; watchify -v -d js/node_modules/main.js -o ../../webroot/js/sgui.js &)

(watchify -v -d js/node_modules/web/client/models.js -o webroot/js/models.js &)
