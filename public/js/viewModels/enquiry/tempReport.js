/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * tempReport module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'data/data', 'moment', 'xlsOut', 'ojs/ojinputtext', 'ojs/ojdatetimepicker',
    'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata', 'ojs/ojdialog', 'ojs/ojchart', 'ojs/ojlabel'
], function (oj, ko, $, config, jsonData, lkps, moment, xlsOut) {
    /**
     * The view model for the main content view template
     */
    function tempReportContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.applianceId = ko.observable("");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(0.5, 'h'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.dataObservableArray = ko.observableArray();

        /**
         *  URL configuration for the service end point
         */

        self.url = config.url + 'cond/temp';

        self.getURL = function () {
            var urlParams = config.url + 'cond/temp?';

            if (self.applianceId())
                urlParams = urlParams + "&applId=" + self.applianceId();
            if (self.fromDt())
                urlParams = urlParams + "&fromTs=" + new Date(self.fromDt()).getTime();
            if (self.toDt())
                urlParams = urlParams + "&toTs=" + new Date(self.toDt()).getTime();

            return urlParams;
        };

        /* Inital loadnig of data*/
        loadTempData();

        /* Event listener for search click*/
        self.filterApp = function () {
            loadTempData();
        };

        self.downloadFile = function () {
            xlsOut(self.dataObservableArray(), 'Raw_temp');
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadTempData() {
            self.ready(false);
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        self.dataObservableArray(result);
                        self.ready(true);
                    });
        }

        /*Lookups*/
        self.applicanceLkp = ko.observableArray();
        let allLkp = {value: '', label: 'All'};
        lkps('tempAppl').then(
                function (lkp) {
                    self.applicanceLkp(lkp);
                    self.applicanceLkp.unshift(allLkp);
                }
        );

        self.chartReady = ko.observable();
        self.loadChartData = function () {
            self.chartReady(false);
        };



        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');

        /* chart data */
        self.lineSeriesValue = ko.observableArray(); //data for chart
        self.chartAppData = [];
        self.chartAppLkpData = ko.observableArray(); // lookup value in the chart dialog
        self.selectedAppl = ko.observable('None');
        self.chartReady = ko.observable(false);

        self.loadChartData = function () {
            self.chartReady(false);
            self.chartAppData = [];

            self.dataObservableArray().forEach(function (item) {
                var tempArr = [];
                if (self.chartAppData[item.device]) {
                    tempArr = self.chartAppData[item.device].data;
                }
                tempArr.push({x: item.ts, y: item.temp});
                self.chartAppData[item.device] = {"name": item.devDesc, "data": tempArr};
            });

            self.lineSeriesValue.removeAll();
            self.chartAppLkpData.removeAll();


            //iterate the appl lookup and filter appl in current resultset
            self.applicanceLkp().forEach(function (item) {
                console.log(item)
                if (self.chartAppData[item.value]) {
                    self.chartAppLkpData().push({
                        "label": item.label,
                        "value": item.value
                    });
                }
            });


            // set chart data for first appliance in resultset
            if (self.chartAppLkpData()[0]) {
                self.selectedAppl(self.chartAppLkpData()[0].value);
                let val = self.chartAppData[self.chartAppLkpData()[0].value];
                self.lineSeriesValue().push({name: val.name, items: val.data});
                self.chartReady(true);
            } else {
                alert("No Data for the chart");
            }
        };

        //event listener on appl selection in chart dialog
        self.loadAppChartData = function () {
            if (self.chartAppLkpData()[0]) {
                self.chartReady(false);
                self.lineSeriesValue.removeAll();
                let val = self.chartAppData[self.selectedAppl()];
                self.lineSeriesValue().push({name: val.name, items: val.data});
                console.log(self.lineSeriesValue());
                self.chartReady(true);
            }
        };



    }

    return tempReportContentViewModel;
});
