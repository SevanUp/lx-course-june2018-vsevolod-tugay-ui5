sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (Controller, JSONModel, Filter, FilterOperator, MessageToast, MessageBox) {
	"use strict";

    var STATUS_PENDING = "pending";
    var STATUS_ACCEPTED = "accepted";

	return Controller.extend("vsevolod.tugay.controller.OrdersOverview", {

        /**
         * Controller's "init" lifecycle method.
         */
	    onInit: function () {

            //model to store counts of filtered orders
	        var oCountsModel = new JSONModel({
                allCount: 0,
                pendingCount: 0,
                acceptedCount: 0
            });

            this.oCountsModel = oCountsModel;

            this.getView().setModel(oCountsModel, "countsModel");

            //model to store filters
            var oFiltersModel = new JSONModel({
                pending: [new Filter("summary/status", FilterOperator.EQ, "'" + STATUS_PENDING + "'")],
                accepted: [new Filter("summary/status", FilterOperator.EQ, "'" + STATUS_ACCEPTED + "'")],
                all: []
            });

            this.oFiltersModel = oFiltersModel;

            this.getView().setModel(oFiltersModel, "filtersModel");

            //model to store values from adding order form
            var oOrderValuesModel = new JSONModel({
                customer: "",
                shipName: "",
                shipAddress: "",
                shipZIP: "",
                shipRegion: "",
                shipCountry: "",
                custFirstName: "",
                custLastName: "",
                custAddress: "",
                custPhone: "",
                custEmail: ""
            });

            this.oOrderValuesModel = oOrderValuesModel;

            this.getView().setModel(oOrderValuesModel, "orderValuesModel");

        },

        /**
         * Counts number of orders based on the filter.
         */
        countOrders: function() {
            var that = this;

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function (oData) {
                    that.oCountsModel.setProperty("/allCount", oData);
                }
            });

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function (oData) {
                    that.oCountsModel.setProperty("/pendingCount", oData);
                },
                filters: this.oFiltersModel.getProperty("/pending")
            });

            this.getView().getModel("odata").read("/Orders/$count", {
                success: function(oData){
                    that.oCountsModel.setProperty("/acceptedCount", oData);
                },
                filters: this.oFiltersModel.getProperty("/accepted")
            });
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
         * "View" after rendering lifecycle method.
         */
        onAfterRendering: function () {
            this.countOrders();
        },

        /**
         * "Select" event handler of the "IconTabBar".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onIconTabFilterSelect: function(oEvent) {
            var sKey = oEvent.getParameter("key");

            var oOrdersTable = this.getView().byId("OrdersTable");

            var oOrdersBinding = oOrdersTable.getBinding("items");

            oOrdersBinding.filter(this.oFiltersModel.getProperty("/" + sKey));
        },

        /**
         * "ItemPress" event handler of the "Table".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onSingleOrderPress: function (oEvent) {
            var oSelectedListItem = oEvent.getParameter("listItem");

            var oCtx = oSelectedListItem.getBindingContext("odata");

            this.getRouter().navTo("OrderDetails", {
                orderId: oCtx.getObject("id")
            });
        },

        /**
         * "Delete" event handler of the "Table".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onSingleOrderDelete: function (oEvent) {
	        var that = this;

            var oDeletedOrder = oEvent.getParameter("listItem");

            var oCtx = oDeletedOrder.getBindingContext("odata");

            var oODataModel = oCtx.getModel();

            var sKey = oODataModel.createKey("/Orders", oCtx.getObject());

            oODataModel.remove(sKey, {
                success: function () {
                    MessageToast.show("Order was successfully removed!");
                    that.countOrders();
                },
                error: function () {
                    MessageBox.error("Error while removing order!");
                }
            });
        },

        /**
         * "Press" event handler of the "Button".
         */
        onAddOrderFormPress: function () {
            var oView = this.getView();

            if (!this.oDialog) {
                this.oDialog = sap.ui.xmlfragment(oView.getId(), "vsevolod.tugay.view.fragments.AddOrderDialog", this);

                oView.addDependent(this.oDialog);
            }

            this.oDialog.open();
        },

        /**
         * "Press" event handler of the "Button".
         */
        onAddOrderPress: function () {
	        var that = this;

	        var oAddOrderForm = this.getView().byId("AddOrderForm");

	        var isErrorField = false;

            oAddOrderForm.getContent().forEach(function(item){

                if(item.getMetadata().getName() === "sap.m.Input"){
                    if(item.getValueState() === "Error") {
                        isErrorField = true;
                    }
                    if(item.getProperty("required") === true){
                        if(item.getValue() === "") {
                            item.setValueState("Error");
                            item.setValueStateText("Enter customer");
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
                "summary": {
                    "createdAt": new Date().toISOString(),
                    "customer": this.oOrderValuesModel.getProperty("/customer"),
                    "status": STATUS_PENDING,
                    "shippedAt": new Date().toISOString(),
                    "totalPrice": 100,
                    "currency": "EUR"
                },
                "shipTo": {
                    "name": this.oOrderValuesModel.getProperty("/shipName"),
                    "address": this.oOrderValuesModel.getProperty("/shipAddress"),
                    "ZIP": this.oOrderValuesModel.getProperty("/shipZIP"),
                    "region": this.oOrderValuesModel.getProperty("/shipRegion"),
                    "country": this.oOrderValuesModel.getProperty("/shipCountry")
                },
                "customerInfo": {
                    "firstName": this.oOrderValuesModel.getProperty("/custFirstName"),
                    "lastName": this.oOrderValuesModel.getProperty("/custLastName"),
                    "address": this.oOrderValuesModel.getProperty("/custAddress"),
                    "phone": this.oOrderValuesModel.getProperty("/custPhone"),
                    "email": this.oOrderValuesModel.getProperty("/custEmail")
                }
            };

            oODataModel.create("/Orders", mPayload, {
                success: function () {
                    MessageToast.show("Order was successfully added!");
                    that.countOrders();
                    that.onCancelAddOrderPress();
                },
                error: function () {
                    MessageBox.error("Error while adding order!");
                }
            });
        },

        /**
         * "Press" event handler of the "Button".
         */
        onCancelAddOrderPress: function () {
            var oAddOrderForm = this.getView().byId("AddOrderForm");

            oAddOrderForm.getContent().forEach(function(item){

                if(item.getMetadata().getName() === "sap.m.Input"){
                    item.setValueState("None");
                }
            });

            this.oDialog.close();
        },

        /**
         * "LiveChange" event handler of the "Input".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        onRequiredInputKeyPress: function (oEvent) {
	        if(oEvent.getSource().getValue() !== "") {
                oEvent.getSource().setValueState("Success");
            } else {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Enter info");
            }
        },

        /**
         * "LiveChange" event handler of the "Input".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        validatePhone: function (oEvent) {
	        if(oEvent.getSource().getValue() === "") {
                oEvent.getSource().setValueState("None");
	            return;
            }

            var regex = /^[0-9]*$/;

            if(!oEvent.getSource().getValue().match(regex) ||
                oEvent.getSource().getValue().length < 6)
            {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Enter a phone with at least 6 numbers");

            } else {
                oEvent.getSource().setValueState("Success");
            }
        },

        /**
         * "LiveChange" event handler of the "Input".
         *
         * @param {sap.ui.base.Event} oEvent event object.
         */
        validateEmail: function (oEvent) {
            if(oEvent.getSource().getValue() === "") {
                oEvent.getSource().setValueState("None");
                return;
            }

            var regex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

            if(!oEvent.getSource().getValue().match(regex))
            {
                oEvent.getSource().setValueState("Error");
                oEvent.getSource().setValueStateText("Enter an email with @ character and a part of address after");

            } else {
                oEvent.getSource().setValueState("Success");
            }
        }
	});
});
