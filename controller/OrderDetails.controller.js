sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.OrderDetails", {
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onNavToProductDetailsButtonPress: function (oEvent) {
            this.getRouter().navTo("ProductDetails", {}, false);
        },
        onNavBack: function (oEvent) {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("OrdersOverview", {}, true);
            }
        }
    });
});