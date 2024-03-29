sap.ui.define([
    "sap/ui/core/UIComponent",
    "ui5/demo/app/model/models"

], function (UIComponent, models) {
    'use strict';

    return UIComponent.extend("ui5.demo.app.Component", {
        metadata: {
            interface: ["sap.ui.core.IAsyncContentCreation"],
            manifest: "json"
        },

        init() {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);

            // intialize the router
            this.getRouter().initialize();

            // set the input model
            this.setModel(models.createInputModel(), "input");

            // set the validation model
            this.setModel(models.createValidationModel(), "validation");
        }
    });
});