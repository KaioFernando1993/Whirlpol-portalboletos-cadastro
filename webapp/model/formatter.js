sap.ui.define([

], function () {
	"use strict";

	return {
		formatPhoneNumber: function (sPhone) {
			if (sPhone && sPhone.length === 11) {
				return "+55 (" + sPhone.substring(0, 2) + ") " + sPhone.substring(2, 7) + "-" + sPhone.substring(7);
			}
			return sPhone;
		},

		formatBlockedStatusWithStyle: function (blocked) {
			const statusText = blocked ? "Desbloqueado" : "Bloqueado";
			const cssClass = blocked ? "alertHtmlClass" : "errorHtmlClass";
			return `<span class='${cssClass}'>${statusText}</span>`;
		},

		formatShortId: function (sId) {
			if (!sId || typeof sId !== "string") {
				return "";
			}
			return sId.substring(0, 5);
		}
	};
});