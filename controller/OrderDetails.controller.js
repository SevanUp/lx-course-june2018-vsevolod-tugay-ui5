sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, History, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("vsevolod.tugay.controller.OrderDetails", {

        /**
         * Controller's "init" lifecycle method.
         */
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

        /**
         * Gets the reference to the router instance.
         *
         * @returns {sap.ui.core.routing.Router} reference to the router instance.
         */
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        /**
         * "NavButtonPress" event handler of the "Page".
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("OrdersOverview", {}, true);
            }
        },

        /**
         * "OrderDetails" route pattern matched event handler.
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
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

        /**
         * "ItemPress" event handler of the "Table".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onSingleProductPress: function (oEvent) {
            var oSelectedListItem = oEvent.getParameter("listItem");

            var oCtx = oSelectedListItem.getBindingContext("odata");

            this.getRouter().navTo("ProductDetails", {
                orderId: oCtx.getObject("orderId"), //placeholder'ы для них прописаны в роутинге манифеста
                productId: oCtx.getObject("id")
            });
        },

        /**
         * "Press" event handler of the "Button".
         */
        onEditShipFormPress: function () {
            this.oToggleEditModel.setProperty("/toggleShipForm", true);
        },

        /**
         * "Press" event handler of the "Button".
         */
        onEditCustomerFormPress: function () {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", true);
        },

        /**
         * "Press" event handler of the "Button".
         */
        onSaveShipFormPress: function () {
            this.oToggleEditModel.setProperty("/toggleShipForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.submitChanges();
        },

        /**
         * "Press" event handler of the "Button".
         */
        onSaveCustomerFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.submitChanges();
        },

        /**
         * "Press" event handler of the "Button".
         */
        onCancelShipFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleShipForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.resetChanges();
        },

        /**
         * "Press" event handler of the "Button".
         */
        onCancelCustomerFormPress: function (oEvent) {
            this.oToggleEditModel.setProperty("/toggleCustomerForm", false);

            var oODataModel = this.getView().getModel("odata");

            oODataModel.resetChanges();
        },

        /**
         * "Delete" event handler of the "Table".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onSingleProductDelete: function (oEvent) {
            var oDeletedProduct = oEvent.getParameter("listItem");

            var oCtx = oDeletedProduct.getBindingContext("odata");

            var oODataModel = oCtx.getModel();

            var sKey = oODataModel.createKey("/OrderProducts", oCtx.getObject());

            MessageBox.confirm("Are you sure you want to delete this product?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function(oAction) {
                    if (oAction === "OK") {
                        oODataModel.remove(sKey, {
                            success: function () {
                                MessageToast.show("Product was successfully removed!")
                            },
                            error: function () {
                                MessageBox.error("Error while removing product!");
                            }
                        });
                    }
                }
            });
        },

        /**
         * "Press" event handler of the "Button".
         */
        onAddOrderFormPress: function () {
            var oView = this.getView();

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "vsevolod.tugay.view.fragments.AddProductDialog", this);

                oView.addDependent(this.oDialog);
            }

            this.oDialog.open();
        },

        /**
         * "Press" event handler of the "Button".
         */
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
                "totalPrice": Number.parseInt(this.oProductValuesModel.getProperty("/price")) *
                              Number.parseInt(this.oProductValuesModel.getProperty("/quantity")),
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

        /**
         * "Press" event handler of the "Button".
         */
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