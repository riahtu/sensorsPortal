/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * enerReport module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload',  'moment', 'xlsOut', 'ojs/ojinputtext',
    'ojs/ojdatetimepicker', 'ojs/ojknockout', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojdialog', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata'
], function (oj, ko, $, config, jsonData, moment, xlsOut) {
    /**
     * The view model for the main content view template
     */
    function enerReportContentViewModel() {
        var self = this;

        self.ready = ko.observable(true);
        self.deviceId = ko.observable("01010001");
        self.applianceId = ko.observable("");
//        self.type = ko.observable("TE");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(1, 'h'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.dataObservableArray = ko.observableArray();
        //  self.datasource = new oj.ArrayTableDataSource(self.dataObservableArray, {idAttribute: 'device'});


        /**
         *  URL configuration for the service end point
         */

        self.url = config.url;

        self.getURL = function () {
            var urlParams = config.url + "nilm/totenergy?";

            if (self.deviceId())
                urlParams = urlParams + "&deviceId=" + self.deviceId();
            if (self.fromDt())
                urlParams = urlParams + "&fromTs=" + new Date(self.fromDt()).getTime();
            if (self.toDt())
                urlParams = urlParams + "&toTs=" + new Date(self.toDt()).getTime();

            return urlParams;
        };

        /* Inital loadnig of data*/
        loadEnergyData();

        /* Event listener for search click*/
        self.filterEnergy = function () {
            loadEnergyData();
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadEnergyData() {
            self.ready(false);
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        self.dataObservableArray(result);
                        //    self.datasource = new oj.ArrayTableDataSource(self.dataObservableArray, {idAttribute: 'deviceId'});
                        self.ready(true);
                    });
        }

        self.downloadFile = function () {
            xlsOut(self.dataObservableArray(), 'Total_Energy');
        };


        /*Lookups*/
//        self.devicesLkp = ko.observableArray();
        self.applicanceLkp = ko.observableArray();

        self.devicesLkp = ko.observableArray([{"value": "01010001", "label": "Food & Veg Section"}, {"value": "01010002", "label": "Bakery Hot & Cold"},
            {"value": "01010003", "label": "Bakery Appliances"}, {"value": "01010004", "label": "Cold Room Appliances"}]);

//        lkps('deviceLkp').then(
//                function (lkp)
//                {
//                    self.devicesLkp(lkp);
//                }
//        );

        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');

        /* chart data */
        self.lineSeriesValue = ko.observableArray();
        self.chartReady = ko.observable(false);

        self.createChartData = function () {
            var ener = [];

            self.dataObservableArray().forEach(function (item) {
                ener.push({x: item.toTs, y: item.totEnergy});
            });

            self.lineSeriesValue.removeAll();

            self.lineSeriesValue([
                {name: 'Total Energy', items: ener}
            ]);

        };

        self.loadChart = function () {
            self.chartReady(false);
            self.createChartData();
            self.chartReady(true);
        };

    }

    return enerReportContentViewModel;
});
