sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"whirpoolportal-boletos-cadastro/portalboletos-cadastro/model/models"

], function (Controller, JSONModel, models) {
	"use strict";

	return Controller.extend("whirpoolportal-boletos-cadastro.portalboletos-cadastro.controller.BaseController", {

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oItems, sName) {
			var oModel = new JSONModel(oItems);
			return this.getView().setModel(oModel, sName);
		}
	});
});