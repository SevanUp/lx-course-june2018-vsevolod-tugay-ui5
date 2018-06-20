sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.ProductDetails", {
        onInit: function () {
            var oRouter = this.getRouter();

            oRouter.getRoute("ProductDetails").attachPatternMatched(this.onPatternMatched, this);
        },
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
        },
        onPatternMatched: function (oEvent) {

            var that = this;

            var mRouteArguments = oEvent.getParameter("arguments");

            var sOrderId = mRouteArguments.productId;

            var oODataModel = this.getView().getModel("odata");

            oODataModel.metadataLoaded().then(function () {

                var sKey = oODataModel.createKey("/OrderProducts", {id: sOrderId});

                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            });

        }
    });
});