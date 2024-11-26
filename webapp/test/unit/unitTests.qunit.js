/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"whirpoolportal-boletos-cadastro/portalboletos-cadastro/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});