/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * applenergy module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout', 'slimscroll', 'ojs/ojtimezonedata',
    'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojselectcombobox', 'ojs/ojvalidation'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function applenergyContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.totEnergy = ko.observable(0);
        self.applDataArray = ko.observableArray(); //data for chart
        self.currentMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed


        var currentYear = moment(new Date()).year();
        var recordLimit = 5; //no. of top applicances



        /* toggle button variables */
        self.selectedCat = ko.observable('Cold Storage');
        self.selectedType = ko.observable('Freezer');
        //access the enerPanel viewmodel to get the totalEnergyValue
        var enerPanelViewModel = ko.dataFor(document.getElementById('enerpanel'));


        self.totSumEnergy = ko.computed(function () {
            return enerPanelViewModel.totEnergy();
        }, this);

        /**
         *  URL configuration for the service end point
         */

        self.url = config.url + 'db/aeEnergy/';

        self.getURL = function () {
            var sumurl = self.url + 'summary?&month=' + self.currentMonth() + '&year=' + currentYear + '&limit=' + recordLimit;
            return sumurl;
        };

        var dbViewModel = ko.dataFor(document.getElementById('ovrdbid'));
        self.calcMonth = ko.computed(function () {
            self.currentMonth(dbViewModel.selMonth());
            loadApplEnergyData();
            return dbViewModel.selMonth();
        });

//        self.summaryUrl = self.url + 'summary?&month=' + self.currentMonth() + '&year=' + currentYear + '&limit=' + recordLimit;

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadApplEnergyData() {
            self.ready(false);
            self.applDataArray.removeAll();
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        self.totEnergy(result.sumEnergy);
                        let enerArray = result.devArray;
                        enerArray.forEach(function (item) {
                            let devicepercent = 0;
                            devicepercent = ((item.appEnergy / self.totSumEnergy()) * 100).toFixed(2);
                            self.applDataArray().push({name: item.appDesc, energy: item.appEnergy, percent: devicepercent + '%'});
                        });
                        self.ready(true);
                    });
        }

        self.catTypeUrl = config.url + 'appliance/lkp/hiearchy/?locId=OMR';
        self.categoryArray = ko.observableArray();
        self.typeArray = [];
        self.catTypeArray = ko.observableArray();
        /**
         *  Fetches category and type lookup data
         * @returns {undefined}
         */
        function loadCategoryTypeData() {
            console.log(self.catTypeUrl);
            jsonData.fetchData(self.catTypeUrl).
                    then(function (result) {
                        result.forEach(function (catitem) {
                            self.categoryArray.push({value: catitem.category, label: catitem.category});
                            let tempArr = [];
                            catitem.typeArr.forEach(function (item) {
                                tempArr.push({value: item.type, label: item.type});
                            });
                            self.typeArray[catitem.category] = tempArr;
                        });

                        self.selectedCat(self.categoryArray()[0].value);
                        self.catTypeArray(self.typeArray[self.selectedCat()]);
                        self.selectedType(self.typeArray[self.selectedCat()][0].value);

                    });
        }


        function loadAllData() {
            loadApplEnergyData();
            loadCategoryTypeData();
        }

        loadAllData();



        /* chart data */
        self.seriesValue = ko.observableArray();
        self.groupsValue = ko.observableArray();
        self.chartReady = ko.observable(false);
        self.selectedDate = ko.observable();

        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {year: '2-digit', month: 'numeric', day: 'numeric'};
        self.dayMonthYear = dateTimeConverter.createConverter(dateOptions);
        self.xAxisOptions = ko.observable({tickLabel: {converter: ko.toJS(self.dayMonthYear)}});


        self.detailsUrl = ko.computed(function () {
            let url = self.url + 'details?&month=' + self.currentMonth() + '&year=' + currentYear + '&locId=OMR'
                    + '&category=' + self.selectedCat() + '&type=' + self.selectedType();
            return url;
        }, this);


        self.createChartData = function () {

            self.chartReady(false);
            self.seriesValue.removeAll();
            self.groupsValue.removeAll();
            console.log(self.detailsUrl());
            jsonData.fetchData(self.detailsUrl()).
                    then(function (result) {
                        let applIdArray = [];
                        let applDataArray = [];
                        result.forEach(function (dayData) {
                            self.groupsValue().push(dayData.dateTs);
                            dayData.applArray.forEach(function (item) {
                                var applEnerArr = [];
                                if (applDataArray[item.applId]) {
                                    applEnerArr = applDataArray[item.applId].items;
                                }
                                applIdArray.push(item.applId);
                                applEnerArr.push(item.appEnergy);
                                applDataArray[item.applId] = {name: item.appDesc, items: applEnerArr};
                            });
                        });
                        applIdArray = ko.utils.arrayGetDistinctValues(applIdArray).sort();
                        applIdArray.forEach(function (appId) {
                            self.seriesValue().push(applDataArray[appId]);
                        });
                        self.chartReady(true);
                    });
        };

        self.catselect = function (event)
        {
            self.selectedCat(event.detail.value);
            self.catTypeArray([]);
            self.catTypeArray(self.typeArray[self.selectedCat()]);
            self.selectedType(self.typeArray[self.selectedCat()][0].value);
            self.createChartData();
        };

        self.typeselect = function (event)
        {
            self.selectedType(event.detail.value);
            self.createChartData();
        };

    }
    return applenergyContentViewModel;
});
