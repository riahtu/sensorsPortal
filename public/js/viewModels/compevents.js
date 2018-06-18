/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * compevents module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout',
    'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojinputnumber'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function compeventsContentViewModel() {
        var self = this;

        self.selectedAppl = ko.observable();
        self.selectedType = ko.observable();

        self.chartReady = ko.observable(true);

        self.cycleSeriesValue = ko.observableArray(); //data for chart
        self.ontimeSeriesValue = ko.observableArray(); //data for chart
        self.dateGroupsValue = ko.observableArray(); //data for chart
        self.totalCycles = ko.observable(0);
        self.totalUpTime = ko.observable(0);
        self.currentMonth = moment(new Date()).month() + 1;//month are zero indexed
        self.currentYear = moment(new Date()).year();

        /**
         *  URL configuration for the service end point
         */
        self.getUrl = function () {
            url = config.url + 'db/events/summary/appliance?applId=' + self.selectedAppl() + '&month=' + self.currentMonth + '&year=' + self.currentYear;
            return url;
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        self.loadCompEventData = function () {
            self.chartReady(false);
            console.log(self.getUrl());
            self.dateGroupsValue.removeAll();
            self.cycleSeriesValue.removeAll();
            self.ontimeSeriesValue.removeAll();
            self.totalCycles(0);
            self.totalUpTime(0);
            jsonData.fetchData(self.getUrl()).
                    then(function (result) {
                        let cycleArr = [];
                        let upTimeArr = [];

                        result.forEach(function (item) {
                            cycleArr.push(item.cycles);
                            upTimeArr.push(item.onTime);
                            self.dateGroupsValue.push(item.date);
                            self.totalCycles(self.totalCycles() + item.cycles);
                            self.totalUpTime(self.totalUpTime() + item.onTime);
                        });
                        self.cycleSeriesValue().push({name: 'Cycles', items: cycleArr, color: '#00A65A'});
                        self.ontimeSeriesValue().push({name: 'Up Time', items: upTimeArr});
                        console.log(self.totalUpTime());
                        self.totalUpTime((self.totalUpTime() / 60).toFixed(2));
                        console.log(self.cycleSeriesValue());
                        //    self.datasource = new oj.ArrayTableDataSource(self.dataObservableArray, {idAttribute: 'deviceId'});
                        self.chartReady(true);
                    });
        }


        self.catTypeUrl = config.url + 'appliance/lkp/hiearchy/?locId=OMR';
        self.typeArray = ko.observableArray();
        self.applArray = [];
        self.typeApplArray = ko.observableArray();
        self.date = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));

        /**
         *  Fetches category and type lookup data
         * @returns {undefined}
         */
        function loadCategoryTypeData() {
            console.log(self.catTypeUrl);
            jsonData.fetchData(self.catTypeUrl).
                    then(function (result) {
                        result.forEach(function (catitem) {
                            if (catitem.category === 'Cold Storage') {
                                catitem.typeArr.forEach(function (typeitem) {
                                    self.typeArray.push({value: typeitem.type, label: typeitem.type});
                                    let tempArr = [];
                                    typeitem.applArr.forEach(function (item) {
                                        tempArr.push({value: item.applId, label: item.name});
                                    });
                                    self.applArray[typeitem.type] = tempArr;
                                });
                            }
                        });

                        self.selectedType(self.typeArray()[0].value);
                        self.typeApplArray(self.applArray[self.selectedType()]);
                        self.selectedAppl(self.applArray[self.selectedType()][0].value);
                        self.loadCompEventData();
                    });
        }

        loadCategoryTypeData();

        self.typeselect = function (event) {
            self.typeApplArray([]);
            self.typeApplArray(self.applArray[self.selectedType()]);
            self.selectedAppl(self.applArray[self.selectedType()][0].value);
        };

        self.optionChange = function (event) {
            self.currentMonth = new Date(self.date()).getMonth() + 1;
            self.currentYear = new Date(self.date()).getFullYear();
        };

        self.loadData = function () {
            self.loadCompEventData();
        };


    }

    return compeventsContentViewModel;
});
