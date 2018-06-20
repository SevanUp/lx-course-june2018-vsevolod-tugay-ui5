sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.OrderDetails", {
        onInit: function () {

            var oRouter = this.getRouter();

            oRouter.getRoute("OrderDetails").attachPatternMatched(this.onPatternMatched, this);
        },
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
        },
        onPatternMatched: function (oEvent) {
            // store the link to "this"
            var that = this;

            var mRouteArguments = oEvent.getParameter("arguments");

            var sOrderId = mRouteArguments.orderId;

            var oODataModel = this.getView().getModel("odata");

            oODataModel.metadataLoaded().then(function () {

                var sKey = oODataModel.createKey("/Orders", {id: sOrderId});

                that.getView().bindObject({
                    path: sKey,
                    model: "odata"
                });
            });

        },
        onSingleProductPress: function (oEvent) {
            var oSelectedListItem = oEvent.getParameter("listItem");

            var oCtx = oSelectedListItem.getBindingContext("odata");

            this.getRouter().navTo("ProductDetails", {
                orderId: oCtx.getObject("orderId"), //placeholder'ы для них прописаны в роутинге манифеста
                productId: oCtx.getObject("id")
            });
        }
    });
});