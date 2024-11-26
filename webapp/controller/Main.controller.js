sap.ui.define([
		"whirpoolportal-boletos-cadastro/portalboletos-cadastro/controller/BaseController",
		"whirpoolportal-boletos-cadastro/portalboletos-cadastro/model/models",
		"whirpoolportal-boletos-cadastro/portalboletos-cadastro/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/Dialog",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/MessageToast"
	],
	function (Controller, models, formatter, Filter, FilterOperator, Dialog, Text, Button, MessageToast) {
		"use strict";

		return Controller.extend("whirpoolportal-boletos-cadastro.portalboletos-cadastro.controller.Main", {
			formatter: formatter,
			onInit: function () {
				this.readService();
			},

			readService: function () {
				this.byId("reportTable").setBusy(true);
				const apiData = models.executeHttpRequest({
						method: "GET",
						endpoint: "/users",
					}).then(data => {

						const oData = data.map((item) => {
							return {...item,
								editing: false,
								temp: {}
							}
						});

						this.setModel(oData, "modelReport");

						this.updateTableRowsCount();
						this.byId("reportTable").setBusy(false);

						const oVisible = {
							isSave: false
						};
						this.setModel(oVisible, "editable");
					})
					.catch(error => {
						console.error("Erro:", error);
						this.byId("reportTable").setBusy(false);
					});
			},

			onSelectedFilter: function () {
				const sSelectedClient = this.byId("clientSelect").getSelectedKey();
				const sSelectedRole = this.byId("roleSelect").getSelectedKey();

				const aFilters = [];

				if (sSelectedClient) {
					aFilters.push(new Filter("client", FilterOperator.EQ, sSelectedClient));
				}

				if (sSelectedRole !== "allStates") {
					const isBlocked = sSelectedRole === "blocked" ? false : true;
					aFilters.push(new Filter("blocked", FilterOperator.EQ, isBlocked));
				}

				const oTable = this.byId("reportTable");
				const oBinding = oTable.getBinding("rows");

				if (aFilters.length > 0) {
					oBinding.filter(new Filter({
						filters: aFilters
					}));
				} else {
					oBinding.filter([]);
				}

				this.updateTableRowsCount();
			},

			onSearch: function (oEvent) {
				const sQuery = oEvent.getSource().getValue();
				const oTable = this.byId("reportTable");
				const oBinding = oTable.getBinding("rows");

				const aSearchFilters = [];
				if (sQuery) {
					aSearchFilters.push(new Filter("name", FilterOperator.Contains, sQuery));
					aSearchFilters.push(new Filter("email", FilterOperator.Contains, sQuery));
				}

				const oCombinedSearchFilter = aSearchFilters.length > 0 ? new Filter(aSearchFilters, false) : null;

				const sSelectedClient = this.byId("clientSelect").getSelectedKey();
				const sSelectedRole = this.byId("roleSelect").getSelectedKey();

				const aFilters = [];
				if (sSelectedClient) {
					aFilters.push(new Filter("client", FilterOperator.EQ, sSelectedClient));
				}
				if (sSelectedRole !== "allStates") {
					const isBlocked = sSelectedRole === "blocked" ? false : true;
					aFilters.push(new Filter("blocked", FilterOperator.EQ, isBlocked));
				}
				let aAllFilters = [];
				if (oCombinedSearchFilter) {
					aAllFilters = aFilters.length > 0 ? [new Filter([oCombinedSearchFilter, ...aFilters], true)] : [oCombinedSearchFilter];
				} else {
					aAllFilters = aFilters;
				}

				oBinding.filter(aAllFilters);

				this.updateTableRowsCount();
			},

			updateTableRowsCount: function () {
				const oTable = this.byId("reportTable");
				const aIndices = oTable.getBinding("rows").aIndices || [];
				const aTableData = oTable.getBinding("rows").oList || [];
				let totalFiltered = 0;

				aIndices.forEach(index => {
					totalFiltered += Number(aTableData[index].MatAtiv || 0);
				});

				const aIndicesLength = aIndices.length > 0 ? aIndices.length.toLocaleString('pt-BR') : "0";

				this.setModel({
					value: aIndicesLength
				}, "modelVisibleRowsCount");
			},

			onToggleBlockStatus: function (oEvent) {
				const oContext = oEvent.getSource().getBindingContext("modelReport");
				const bBlocked = oContext.getProperty("blocked");
				const sMessage = bBlocked ? "Você está prestes a Bloquear este usuário. Deseja continuar?" :
					"Você está prestes a Desbloquear este usuário. Deseja continuar?";
				const sButtonText = bBlocked ? "Sim, Bloquear" : "Sim, Desbloquear";

				const changeBlocked = function () {
					oContext.setProperty("blocked", !bBlocked);

					this._oConfirmDialog.close();

					this._showSuccessDialog(bBlocked);
				}
				if (!this._oConfirmDialog) {
					this._oConfirmDialog = new Dialog({
						title: "Confirmação",
						content: new Text({
							text: sMessage
						}),
						beginButton: new Button({
							text: sButtonText,
							press: changeBlocked.bind(this),
						}),
						endButton: new Button({
							text: "Cancelar",
							press: function () {
								this._oConfirmDialog.close();
							}.bind(this),
						}),
					});

					this.getView().addDependent(this._oConfirmDialog);
				} else {
					this._oConfirmDialog.getContent()[0].setText(sMessage);
					this._oConfirmDialog.getBeginButton().setText(sButtonText);
					this._oConfirmDialog.getBeginButton().mEventRegistry.press = null;
					this._oConfirmDialog.getBeginButton().attachPress(changeBlocked.bind(this));
				}

				this._oConfirmDialog.open();
			},

			_showSuccessDialog: function (bBlocked) {
				const sAction = bBlocked ? "Bloqueado" : "Desbloqueado";
				const sSuccessMessage = `Usuário foi ${sAction} com sucesso.`;

				if (!this._oSuccessDialog) {
					this._oSuccessDialog = new Dialog({
						title: `Usuário ${sAction}`,
						content: new Text({
							text: sSuccessMessage
						}),
						beginButton: new Button({
							text: "OK",
							press: function () {
								this._oSuccessDialog.close();
							}.bind(this),
						}),
					});

					this.getView().addDependent(this._oSuccessDialog);
				} else {
					this._oSuccessDialog.getContent()[0].setText(sSuccessMessage);
				}

				this._oSuccessDialog.open();
			},

			onRowSelectionChange: function (oEvent) {
				const oTable = this.byId("reportTable");
				const oModel = this.getView().getModel("modelReport");
				const aData = oModel.getProperty("/");
				const oContext = oEvent.getParameter("rowContext");

			},

			onEdit: function (oEvent) {
				const oTable = this.byId("reportTable");
				const aSelectedIndices = oTable.getSelectedIndices();

				if (aSelectedIndices.length === 0) {
					MessageToast.show("Nenhuma linha selecionada.");
					return;
				}

				aSelectedIndices.forEach(function (iIndex) {
					const oContext = oTable.getContextByIndex(iIndex);
					const oContextTemp = JSON.parse(JSON.stringify(oContext.getObject()));

					oContext.setProperty("editing", true);
					oContext.setProperty("temp", oContextTemp);
				});

				const bButonEditSave = this.getView().getModel("editable");
				const bSaveMode = bButonEditSave.getProperty("/isSave");

				bButonEditSave.setProperty("/isSave", !bSaveMode);
				bButonEditSave.refresh(true);
			},

			onCancel: function (oEvent) {
				const oTable = this.byId("reportTable");
				const oModel = this.getModel("modelReport");
				const aData = oModel.getProperty("/");

				const aDataMapping = aData.map((report) => {
					report.editing = false;
					return report;
				})

				oModel.setProperty("/", aDataMapping);

				const bButtonEditSave = this.getModel("editable");
				bButtonEditSave.setProperty("/isSave", false);
				bButtonEditSave.refresh(true);

				MessageToast.show("Edição cancelada.");
			},

			onSave: async function (oEvent) {
				const oTable = this.byId("reportTable");
				const aSelectedIndices = oTable.getSelectedIndices();

				if (aSelectedIndices.length === 0) {
					MessageToast.show("Nenhuma linha para salvar.");
					return;
				}

				let aUpdatedData;
				const oModel = this.getModel("modelReport");
				const oEditableModel = this.getModel("editable");

				aSelectedIndices.forEach((iIndex) => {
					const oContext = oTable.getContextByIndex(iIndex);
					const oData = oContext.getObject();

					let oDataBackup = JSON.parse(JSON.stringify(oData.temp));
					delete oDataBackup.editing;
					delete oDataBackup.temp;

					oContext.setProperty("editing", false);
					oContext.setProperty("temp", {});

					aUpdatedData = oDataBackup;
				});

				oEditableModel.setProperty("/isSave", false);
				oEditableModel.refresh(true);

				const payload = {
					name: "Teste de Conexção"
				}
				const id = "11b5a6bc-88c9-48c9-b182-083516cfa9c6"
				try {
					await fetch(`https://0qb95gh86j.execute-api.us-east-1.amazonaws.com/v1/users/${id}`, {
						method: "PATCH",
						data: JSON.stringify(payload),
					})

				} catch (error) {
					console.error("não foi possivel atualizar os dados", error)
				}

				// const apiData = models.executeHttpRequest({
				// 		method: "PATCH",
				// 		endpoint: `/users/${id}`,
				// 		data: JSON.stringify(payload),
				// 	}).then(data => {
				// 		this.readService();
				// 		this.updateTableRowsCount();

				// 		this.byId("reportTable").setBusy(false);
				// 		MessageToast.show("Alterações salvas com sucesso!");
				// 	})
				// 	.catch(error => {
				// 		MessageToast.show("Erro ao salvar alterações.");
				// 		console.error("Erro no envio dos dados:", error);
				// 	});
			}
		});
	});