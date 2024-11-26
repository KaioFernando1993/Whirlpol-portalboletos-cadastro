sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		_apiUrl: "https://0qb95gh86j.execute-api.us-east-1.amazonaws.com/v1",

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		executeHttpRequest: function ({
			method,
			endpoint,
			data
		}) {
			return fetch(`${this._apiUrl}${endpoint}`, {
					method,
					body: JSON.stringify(data)
				})
				.then(response => response.json())
		}
	};
});