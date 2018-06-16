sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.ProductDetails", {
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onHelloButtonPress: function () {
            MessageToast.show("This is last page!");
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