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
    createTableUi(cssId, url);
    // TODO get the correct route from server, and route to the correct form
};


function createTableUi(cssId, url) {
    const tableModel = web_client_TableModel.create(url);
    const table = sgui.Table.fromModel(tableModel);
    console.log('createTableUi cssId', cssId, document.getElementById(cssId), 'table from sgui.Table', sgui.Table);
    const ui = sgui.UI.fromConfigObject(document.getElementById(cssId), table);
    ui.add(table);
    const label = sgui.Label.label('clicky here:');
    ui.add(label);
    const button = sgui.Button.button('change row');
    button.on('click', () => { tableModel._fetchRows(0, 1); });
    ui.add(button);
    console.log(ui, table);
    ui.run();
}
