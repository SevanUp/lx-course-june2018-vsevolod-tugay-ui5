sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, History, JSONModel) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.ProductDetails", {
        onInit: function () {

            var oCommentValuesModel = new JSONModel({
                author: "",
                comment: "",
                rating: 0
            });

            this.oCommentValuesModel = oCommentValuesModel;

            this.getView().setModel(oCommentValuesModel, "commentValuesModel");

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

        },
        onPostComment: function() {
            var oODataModel = this.getView().getModel("odata");

            var mPayload = {
                "comment": this.oCommentValuesModel.getProperty("/comment"),
                "author": this.oCommentValuesModel.getProperty("/author"),
                "createdDate": new Date().toISOString(),
                "rating": this.oCommentValuesModel.getProperty("/rating"),
                "productId": this.getView().getBindingContext("odata").getObject("id")
            };

            oODataModel.create("/ProductComments", mPayload, {
                success: function () {
                    MessageToast.show("Comment was successfully added!");
                },
                error: function () {
                    MessageBox.error("Error while adding comment!");
                }
            });
        }
    });
});