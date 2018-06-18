/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * home module
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojtoolbar', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', 'ojs/ojinputnumber'
], function (oj, ko) {

    /**
     * The view model for the main content view template
     */
    function homeContentViewModel() {
        var self = this;
        self.applianceArray = ko.observableArray([{"value": "chiller1", "label": "Chiller 1"}, {"value": "chiller2", "label": "Chiller 2"}, {"value": "freezer1", "label": "Freezer 1"}, 
            {"value": "freezer2", "label": "Freezer 2"}]);
        self.appliance = ko.observable("chiller1");
        /*Date time options for x axis*/
        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {day: 'numeric', month: 'numeric'};
        self.dayMonth = dateTimeConverter.createConverter(dateOptions);
        var dateOptions2 = {year: 'numeric'};
        self.year = dateTimeConverter.createConverter(dateOptions2);
        var dateOptions3 = {year: '2-digit', month: 'numeric', day: 'numeric'};
        self.dayMonthYear = dateTimeConverter.createConverter(dateOptions3);

        self.period = ko.observableArray(["TD"]);
        self.fromDate = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.toDate = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.xAxisOptions = ko.observable({});
        self.chartParams = ko.observable({"date":self.period()});

        this.dateChangedHandler = function (event) {
            self.period(event.detail.value);
            self.chartParams({"date":self.period()});
        }
    }

    return new homeContentViewModel();
});
