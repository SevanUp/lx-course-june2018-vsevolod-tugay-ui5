sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("vsevolod.tugay.controller.OrdersOverview", {
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavToOrderDetailsButtonPress: function (oEvent) {
            this.getRouter().navTo("OrderDetails", {}, false);
		}
	});
});
