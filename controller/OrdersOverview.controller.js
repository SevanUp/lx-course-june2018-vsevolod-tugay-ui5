sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("vsevolod.tugay.controller.OrdersOverview", {
	    onInit: function () {
	        var oCountsModel = new JSONModel({
                ordersCount: 0,
                pendingCount: 0,
                acceptedCount: 0
            });

            this.oCountsModel = oCountsModel;

            this.getView().setModel(oCountsModel, "countsModel");

            window.fcontroller = this;
        },
        getRouter : function () {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },
        onAfterRendering: function () {



            var oOrdersTable = this.byId("ordersTable");

            var oOrdersBinding = oOrdersTable.getBinding("items");

            oOrdersBinding.attachDataReceived(function (oEvent) {
                // data that were received via binding
                var mData = oEvent.getParameter("data");

                this.oCountsModel.setProperty("/ordersCount", mData.results.length);
            }, this);

        },
        onIconTabFilterSelect: function(oEvent) {
            var sKey = oEvent.getParameter("key");

            switch (sKey) {
                case "Pending": {
                    var oPendingOrdersTable = this.byId("pendingOrdersTable");

                    var oItemsBinding = oPendingOrdersTable.getBinding("items");

                    var oFilter = new Filter("summary/status", FilterOperator.Contains, "a");

                    oItemsBinding.filter(oFilter);

                    break;
                }
            }
        },
        onSingleOrderPress: function (oEvent) {
            var oSelectedListItem = oEvent.getParameter("listItem");

            var oCtx = oSelectedListItem.getBindingContext("odata");

            this.getRouter().navTo("OrderDetails", {
                orderId: oCtx.getObject("id")
            });
        }

	});
});
