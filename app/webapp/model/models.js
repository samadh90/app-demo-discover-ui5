sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode"

], function (JSONModel, BindingMode) {

    return {
        createInputModel() {
            return new JSONModel({
                Name: '',
                Category: '',
                Price: '',
                Currency: 'EUR',
                ReleaseDate: null,
                DiscontinuedDate: null,
                Rating: 0
            }).setDefaultBindingMode(BindingMode.TwoWay)
        },

        createValidationModel() {
            return new JSONModel({
                Name: true,
                Category: true,
                Price: true,
                Currency: true,
                ReleaseDate: true,
                DiscontinuedDate: true
            }).setDefaultBindingMode(BindingMode.TwoWay)
        }
    }
})