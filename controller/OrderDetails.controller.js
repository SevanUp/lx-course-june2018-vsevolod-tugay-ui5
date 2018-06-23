sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.OrderDetails", {
        onInit: function () {

            sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

            var oToggleEditModel = new JSONModel({
                toggleShipForm: false,
                toggleCustomerForm: false
            });

            this.oToggleEditModel = oToggleEditModel;

            this.getView().setModel(oToggleEditModel, "edit");

            var oProductValuesModel = new JSONModel({
                name: "",
                price: "",
                currency: "",
                quantity: ""
            });

            this.oProductValuesModel = oProductValuesModel;

            this.getView().setModel(oProductValuesModel, "productValuesModel");

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
                orderId: oCtx.getObject("orderId"),
                productId: oCtx.getObject("id")
            });
        },
        onEditShipFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleShipForm", true);
        },
        onEditCustomerFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", true);
        },
        onSaveShipFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleShipForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.submitChanges();
        },
        onSaveCustomerFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.submitChanges();
        },
        onCancelShipFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleShipForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.resetChanges();

        },
        onCancelCustomerFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.resetChanges();

        },
        onSingleProductDelete: function (oEvent) {
            var oDeletedProduct = oEvent.getParameter("listItem");

            var oCtx = oDeletedProduct.getBindingContext("odata");

            var oODataModel = oCtx.getModel();

            var sKey = oODataModel.createKey("/OrderProducts", oCtx.getObject());

            oODataModel.remove(sKey, {
                success: function () {
                    MessageToast.show("Product was successfully removed!")
                },
                error: function () {
                    MessageBox.error("Error while removing product!");
                }
            });
        },
        onAddOrderFormPress: function (oEvent) {
            var oView = this.getView();

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "vsevolod.tugay.view.fragments.AddProductDialog", this);

                oView.addDependent(this.oDialog);
            }

            this.oDialog.open();
        },
        onAddProductPress: function () {
            var that = this;

            var oAddProductForm = this.getView().byId("AddProductForm");

            var isErrorField = false;

            oAddProductForm.getContent().forEach(function(item){

                if(item.getMetadata().getName() === "sap.m.Input"){
                    if(item.getValueState() === "Error") {
                        isErrorField = true;
                    }
                    if(item.getProperty("required") === true){
                        if(item.getValue() === "") {
                            isErrorField = true;
                        }
                    }
                }
            });
            if(isErrorField) {
                MessageBox.error("Empty / incorrect input values!");
                return;
            }

            var oODataModel = this.getView().getModel("odata");

            var mPayload = {
                "name": this.oProductValuesModel.getProperty("/name"),
                "price": this.oProductValuesModel.getProperty("/price"),
                "currency": this.oProductValuesModel.getProperty("/currency"),
                "quantity": this.oProductValuesModel.getProperty("/quantity"),
                "totalPrice": Number.parseInt(this.oProductValuesModel.getProperty("/price")) * Number.parseInt(this.oProductValuesModel.getProperty("/quantity")),
                "orderId": this.getView().getBindingContext("odata").getObject("id")
            };

            oODataModel.create("/OrderProducts", mPayload, {
                success: function () {
                    MessageToast.show("Product was successfully added!");
                    that.onCancelAddProductPress();
                },
                error: function () {
                    MessageBox.error("Error while adding product!");
                }
            });
        },
        onCancelAddProductPress: function () {
            var oAddOrderForm = this.getView().byId("AddProductForm");

            oAddOrderForm.getContent().forEach(function(item){

                if(item.getMetadata().getName() === "sap.m.Input"){
                    item.setValueState("None");
                }
            });

            this.oDialog.close();
        }
    });
});