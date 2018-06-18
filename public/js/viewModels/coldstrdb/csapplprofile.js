/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * csapplprofile module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'dataService', 'moment', 'ojs/ojcheckboxset',
    'ojs/ojchart', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', 'ojs/ojinputnumber'
], function (oj, ko, $, config, jsonData, dataService, moment) {
    /**
     * The view model for the main content view template
     */
    function csapplprofileContentViewModel() {
        var self = this;
        self.ready = ko.observable(false);
         self.imgready = ko.observable(false);
        self.applid = ko.observable("0102012048704");
        self.currentProfData = ko.observable({});
        self.profData = ko.observableArray();

        self.maxTemp = ko.observable(0);
        self.minTemp = ko.observable(0);
        self.avgTemp = ko.observable(0);
        self.tempSeriesValue = ko.observableArray();
        self.tempMonCB = ko.observableArray();
        self.energyMonCB = ko.observableArray();
        self.imgurl = ko.observable("");

        self.currentMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed
        self.currentYear = ko.observable(moment(new Date()).year());


        self.loadProfData = function () {
            $.getJSON('js/data/applprofdata.json').then(function (energyData) {
                self.profData(energyData);
            });
        };
        self.loadProfData();
         var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
         self.applid(rootViewModel.applassetID());

        self.findApplData = ko.computed(function () {
            const result = self.profData().filter(item => item.Appliance === self.applid());
            if (result[0]) {
                self.tempMonCB().push(result[0].Temp);
                self.energyMonCB().push(result[0].Energy);
                self.imgurl("js/images/"+result[0].ImgName+".jpg")
                result[0].tempMonCB = self.tempMonCB();
                result[0].energyMonCB = self.energyMonCB();
                result[0].imgurl = self.imgurl();
                console.log(result[0].imgurl );
            }
            self.currentProfData(result[0]);
            console.log(self.currentProfData());
        }, this);

        self.createChartData = function () {
            self.ready(false);
            dataService.getApplianceTemp(self.applid(), new Date().getDate(), self.currentMonth(), self.currentYear()).then(function (result) {
                if (result.temp) {
                    console.log(result);
                    self.tempSeriesValue().push({name: 'Temprature', items: result.temp.items, color: '#0068a5'});
                    self.maxTemp(parseInt(result.temp.maxTemp) + ' ºC');
                    self.minTemp(parseInt(result.temp.minTemp) + ' ºC');
                    self.avgTemp(parseInt(result.temp.avgTemp) + ' ºC');
                }
                self.ready(true);
            });
        };

        self.createChartData();

        self.seriesValue = ko.observableArray();
        self.groupsValue = ko.observableArray();
        self.chartReady = ko.observable(false);

        self.selectedCat = ko.observable('Cold Storage');
        self.selectedType = ko.observable('Freezer');

        var dateTimeConverter = oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME);
        var dateOptions = {year: '2-digit', month: 'numeric', day: 'numeric'};
        self.dayMonthYear = dateTimeConverter.createConverter(dateOptions);
        self.xAxisOptions = ko.observable({tickLabel: {converter: ko.toJS(self.dayMonthYear)}});
        self.url = config.url + 'db/aeEnergy/';
        self.detailsUrl = ko.computed(function () {
            let url = self.url + 'details?&month=' + self.currentMonth() + '&year=' + self.currentYear() + '&locId=OMR'
                    + '&applid=' + self.applid();
            return url;
        }, this);

        self.createChartData = function () {

            self.chartReady(false);
            self.seriesValue.removeAll();
            self.groupsValue.removeAll();
            console.log(self.detailsUrl());
            jsonData.fetchData(self.detailsUrl()).
                    then(function (result) {
                        let applIdDesc = "None";
                        let applDataArray = [];
                        result.forEach(function (dayData) {
                            self.groupsValue().push(dayData.dateTs);
                            let appldata = dayData.applArray.filter(item => item.applId === self.applid());
                            if (appldata[0]) {
                                applDataArray.push(appldata[0].appEnergy);
                                applIdDesc = appldata[0].appDesc;
                            }

                        });
                        self.seriesValue().push({name: applIdDesc, items: applDataArray});
//                        console.log(self.seriesValue());
                        self.chartReady(true);
                    });
        };

        self.createChartData();

    }

    return csapplprofileContentViewModel;
});
