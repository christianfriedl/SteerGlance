window.loadUI = function(cssId, baseUrl, data) {
    jQuery.ajax(baseUrl + '/' + [ 'client', 'formRouter', 'byRoute' ].join('/'), {
        method: 'get',
        data: data,
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function(routerData) {
            console.log('loaduinew success routerData', routerData, 'data', data);
                var ui = m_ui.ui();
                ui.displayForm(cssId, routerData.formName, data);
        }
    });
};
window.loadUIByUrl = function(cssId, url) {
    jQuery.ajax(url, {
        method: 'get',
        async: true,
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            // TODO route it...
            console.log('succ', data);
            // jQuery('#' + cssId).html(JSON.stringify(data));
            createTableUi(cssId, data);
        }, error: function() {
            console.log('error', arguments);
        }
    });
};


function createTableUi(cssId, response) {
    const tableObj = {
        /*
        header: [ _.map(_.range(0, numCols), ( col ) => {
            return 'head ' + col;
        }) ],
        */
        body: _.map(response.rows, ( row ) => {
            return _.map(row.fields, ( field ) => {
                return field.value
            });
        }),
        /*
        footer: [ _.map(_.range(0, numCols), ( col ) => {
            return 'foot ' + col;
        }) ],
        */
    };
    const table1 = sgui.Table.fromObject(tableObj);
    const ui = sgui.UI.fromConfigObject(document.getElementById(cssId), table1);
    ui.add(table1);
    console.log(ui, table1);
    ui.run();
}
