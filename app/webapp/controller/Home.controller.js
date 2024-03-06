sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Context",
    "sap/m/MessageBox",
    "ui5/demo/app/model/models",
    "ui5/demo/app/model/formatter",

], function (Controller, Fragment, Sorter, Filter, FilterOperator, Context, MessageBox, models, formatter) {
    'use strict';

    return Controller.extend("ui5.demo.app.controller.Home", {
        formatter: formatter,

        onInit() {
            console.log("App controller initialized");
        },

        onPressCreateNewProduct() {
            const oPayload = this.getView().getModel("input").getData();
        
            // Validation de l'entrée
            if (!this._validate()) {
                // Envisager d'afficher un message d'erreur de validation à l'utilisateur
                return;
            }
        
            // Préparation des données
            // Générer un ID unique en utilisant une combinaison du temps actuel et un nombre aléatoire
            oPayload.ID = parseInt(Date.now().toString().slice(-4) + Math.floor(Math.random() * 10000), 10);
        
            // Assurer que l'ID est un entier 32 bits
            if(oPayload.ID > 2147483647) {
                oPayload.ID = oPayload.ID % 2147483647;
            }
        
            // Conversion de Price en decimal
            if(oPayload.Price && !isNaN(oPayload.Price)) {
                oPayload.Price = parseFloat(oPayload.Price).toFixed(2); // 2 chiffres après la virgule
            }
        
            // Suppression des champs non nécessaires
            delete oPayload.Category;
            delete oPayload.Currency;
        
            // Envoyer la requête de création
            this.getView().getModel().create("/Products", oPayload, {
                success: (oData, oResponse) => {
                    MessageBox.information(oData, oResponse);
                    this._oCreateProductDialog.close();
                },
                error: oError => {
                    MessageBox.error(oError);
                }
            });
        },             

        onPressUpdateProduct() {
            const oModel = this.getView().getModel()

            if (oModel.hasPendingChanges()) {
                oModel.submitChanges({
                    success: () => {
                        MessageBox.information("Product updated successfully")
                        this._oEditDialog.close()
                    },
                    error: () => {
                        MessageBox.error("Product update failed")
                        this._oEditDialog.close()
                    }
                })
            } else {
                MessageBox.information("No changes to update")
                this._oEditDialog.close()
            }
        },

        onItemPress(oEvent) {
            const oModel = this.getView().getModel();
            const ID = oEvent.getSource().getBindingContext().getProperty("ID");
            const sPath = oModel.createKey("/Products", { ID });
        
            const openDialog = () => {
                this._oEditDialog.setBindingContext(new Context(oModel, sPath));
                this._oEditDialog.open();
            };
        
            if (!this._oEditDialog) {
                this._loadDialog("Edit").then(oDialog => {
                    this._oEditDialog = oDialog;
                    openDialog();
                }).catch(error => {
                    console.error("Error loading the edit dialog:", error);
                    // Handle the error appropriately
                });
            } else {
                openDialog();
            }
        },

        onLiveChangeProductName(oEvent) {
            // console.log("Input: ", oEvent.getParameter("value"));
            // console.log("Model: ", this.getView().getModel("input").getProperty("/Name"));
        },

        onPressDelete(oEvent) {
            const oModel = this.getView().getModel()
            // Get the list item that was pressed
            const oItem = oEvent.getParameter("listItem");

            // Create path
            const sPath = oModel.createKey("/Products", {
                ID: oItem.getBindingContext().getProperty("ID")
            })

            oModel.remove(sPath, {
                success: oData => {
                    MessageBox.information("Product deleted successfully")
                },
                error: oError => {
                    MessageBox.error("Product delete failed")
                }
            })
        },

        onPressAddNewProduct() {
            // Load and display the create new product dialog
            if (!this._oCreateProductDialog) {
                this._loadDialog("CreateProduct").then(oDialog => {
                    this._oCreateProductDialog = oDialog
                    oDialog.open()
                })
            } else {
                this._oCreateProductDialog.open()
            }
        },

        onSortButtonPressed() {
            // Load and display the sort dialog
            if (!this._oSortDialog) {
                this._loadDialog("SortDialog").then(oDialog => {
                    this._oSortDialog = oDialog
                    oDialog.open()
                })
            } else {
                this._oSortDialog.open()
            }
        },

        onGroupButtonPressed() {
            // Load and display the group dialog
            if (!this._oGroupDialog) {
                this._loadDialog("GroupDialog").then(oDialog => {
                    this._oGroupDialog = oDialog
                    oDialog.open()
                })
            } else {
                this._oGroupDialog.open()
            }
        },

        onFilterButtonPressed() {
            // Load and display the group dialog
            if (!this._oFilterDialog) {
                this._loadDialog("FilterDialog").then(oDialog => {
                    this._oFilterDialog = oDialog
                    oDialog.open()
                })
            } else {
                this._oFilterDialog.open()
            }
        },

        onConfirmSort(oEvent) {
            // Get sort related event parameters
            const oSortItem = oEvent.getParameter("sortItem");
            const bDescending = oEvent.getParameter("sortDescending");

            // If there is a sort item selected, sort the list binding
            this.getView()
                .byId("idProductList")
                .getBinding("items")
                .sort(oSortItem ? [new Sorter(oSortItem.getKey(), bDescending)] : []);
        },

        onConfirmGroup(oEvent) {
            // Get group related event parameters
            const oGroupItem = oEvent.getParameter("groupItem");
            const bDescending = oEvent.getParameter("groupDescending");

            // If there is a grouping item selected, group the list binding
            // Else, group by en empty array to remove any existing grouping
            this.getView()
                .byId("idProductList")
                .getBinding("items")
                .sort(oGroupItem ? [new Sorter(oGroupItem.getKey(), bDescending, true /* vGroup */)] : []);
        },

        onConfirmFilter(oEvent) {
            // Get filter items from the event object
            const aFilterKeys = oEvent.getParameter("filterCompoundKeys");
            const sFilterString = oEvent.getParameter("filterString");

            // Create filters array according to the related items
            const aFilter = []

            Object.entries(aFilterKeys).forEach(([sPath, oValues]) => {
                Object.keys(oValues).forEach(sKey => {
                    if (sKey.includes("__")) {
                        aFilter.push(new Filter(...sKey.split("__")))
                    } else {
                        aFilter.push(new Filter(sPath, FilterOperator.EQ, sKey))
                    }
                })
            })

            // Filter the list binding
            this.getView()
                .byId("idProductList")
                .getBinding("items")
                .filter(aFilter);

            // Show info header if there are any filter
            this.getView().byId("idFilterInfoToolbar").setVisible(!!aFilter.length);
            this.getView().byId("idFilterText").setText(sFilterString);
        },

        onAfterCloseDialog() {
            this.getOwnerComponent().setModel(models.createInputModel(), "input");
            this.getOwnerComponent().setModel(models.createValidationModel(), "validation");
        },

        onPressCancelNewProduct() {
            this._oCreateProductDialog.close()
        },

        onPressCancelEditProduct() {
            this._oEditDialog.close()
        },

        onProductsLoaded(oEvent) {
            const sTitle = this.getView().getModel("i18n").getResourceBundle().getText("listHeader");

            this.getView().byId("idListTitle").setText(`${sTitle} (${oEvent.getParameter("total")})`)

        },

        _getAvailabilityText(oDate) {
            return oDate > new Date() ? "Available" : "Unavailable";
        },

        _getAvailabilityState(oDate) {
            return oDate > new Date() ? ValueState.Success : ValueState.Error;
        },

        _validate() {
            const oInput = this.getView().getModel("input").getData();
            const oValidationModel = this.getView().getModel("validation");

            // Check mandatory inputs
            oValidationModel.setProperty("/Name", !!oInput.Name);
            oValidationModel.setProperty("/Category", !!oInput.Category);
            oValidationModel.setProperty("/Price", !!oInput.Price);
            oValidationModel.setProperty("/ReleaseDate", !!oInput.ReleaseDate);

            // Return validation status
            return !Object.values(oValidationModel.getData()).includes(false);
        },

        _loadDialog(sFragmentName) {
            return Fragment.load({
                id: this.getView().getId(),
                name: `ui5.demo.app.view.fragments.${sFragmentName}`,
                controller: this
            }).then(oDialog => {
                this.getView().addDependent(oDialog);
                return oDialog;
            }).catch(error => {
                console.error("Error loading fragment:", error);
                // Handle the error appropriately
            });
        }        
    });
});