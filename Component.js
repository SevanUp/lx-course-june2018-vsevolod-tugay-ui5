sap.ui.define([
	"sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, ODataModel) {
	"use strict";

	return UIComponent.extend("vsevolod.tugay.Component", {
		metadata: {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

            var oODataModel = new ODataModel("http://localhost:3000/odata", {
                useBatch: false,
                defaultBindingMode: "TwoWay",
                defaultCountMode: "InlineRepeat"
            });

            this.setModel(oODataModel, "odata");

			this.getRouter().initialize();
		}
	});
});