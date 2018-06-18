/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * event module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'data/data', 'moment', 'xlsOut',
    'ojs/ojinputtext', 'ojs/ojdatetimepicker', 'ojs/ojknockout', 'ojs/ojchart', 'ojs/ojlabel',
    'ojs/ojdialog', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata'
], function (oj, ko, $, config, jsonData, lkps, moment, xlsOut) {
    /**
     * The view model for the main content view template
     */
    function eventContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.deviceId = ko.observable("01010001");
        self.applianceId = ko.observable("");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(1, 'h'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.dataObservableArray = ko.observableArray();
        self.datasource = new oj.ArrayTableDataSource(self.dataObservableArray, {idAttribute: 'device'});


        /**
         *  URL configuration for the service end point
         */

        self.url = config.url;

        self.getURL = function () {

            var urlParams = config.url + "nilm/events?";

            if (self.deviceId())
                urlParams = urlParams + "&deviceId=" + self.deviceId();
            if (self.applianceId())
                urlParams = urlParams + "&applId=" + self.applianceId();
            if (self.fromDt())
                urlParams = urlParams + "&fromTs=" + new Date(self.fromDt()).getTime();
            if (self.toDt())
                urlParams = urlParams + "&toTs=" + new Date(self.toDt()).getTime();

            return urlParams;
        };

        /* Inital loadnig of data*/
        loadEventData();

        /* Event listener for search click*/
        self.filterEvent = function () {
            loadEventData();
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadEventData() {
            self.ready(false);
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        self.dataObservableArray(result);
                        self.datasource = new oj.ArrayTableDataSource(self.dataObservableArray, {idAttribute: 'deviceId'});
                        self.ready(true);
                    });
        }

        self.downloadFile = function () {
            xlsOut(self.dataObservableArray(), 'Events');
        };

          /*Lookups*/
        self.devicesLkp = ko.observableArray();
        self.applicanceLkp = ko.observableArray();
        self.applicanceLkpFltr = ko.observableArray();

        let allLkp = {value: '', label: 'All'};

        lkps('deviceLkp').then(
                function (lkp)
                {
                    self.devicesLkp(lkp);
                }
        );

        lkps('applLkp').then(function (lkp) {
            self.applicanceLkp(lkp);
        });

        ko.computed(function () {
            var deviceId = self.deviceId();
            self.applicanceLkpFltr.removeAll();
            self.applicanceLkp().forEach(function (lkp) {
                if (lkp.deviceId === deviceId) {
                    self.applicanceLkpFltr.push(lkp);
                }
            });
            self.applicanceLkpFltr.unshift(allLkp);
        });

        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');

        /* chart data */
        self.lineSeriesValue = ko.observableArray(); //data for chart
        self.chartAppData = [];
        self.chartAppLkpData = ko.observableArray(); // lookup value in the chart dialog
        self.selectedAppl = ko.observable('None');
        self.chartReady = ko.observable(false);
        self.yAxis = ko.observable({title: 'Appliance Status',minStep:1});

        self.loadChartData = function () {
            self.chartReady(false);
            self.chartAppData = [];
            self.dataObservableArray().forEach(function (item) {
                var tempArr = [];
                if (self.chartAppData[item.applId]) {
                    tempArr = self.chartAppData[item.applId].data;
                }
                tempArr.push({x: item.ts, y: item.toState});
                self.chartAppData[item.applId] = {"name": item.appDesc, "data": tempArr};
            });

            self.lineSeriesValue.removeAll();
            self.chartAppLkpData.removeAll();
            //iterate the appl lookup and filter appl in current resultset
            self.applicanceLkp().forEach(function (item) {
                if (self.chartAppData[item.value]) {
                    self.chartAppLkpData().push({
                        "label": item.label,
                        "value": item.value
                    });
                }
            });
            // set chart data for first appliance in resultset
            self.selectedAppl(self.chartAppLkpData()[0].value);
            let val = self.chartAppData[self.chartAppLkpData()[0].value];
            self.lineSeriesValue().push({name: val.name, items: val.data});
            self.chartReady(true);
        };

        //event listener on appl selection in chart dialog
        self.loadAppChartData = function () {
            self.chartReady(false);
            self.lineSeriesValue.removeAll();
            let val = self.chartAppData[self.selectedAppl()];
            self.lineSeriesValue().push({name: val.name, items: val.data});
            self.chartReady(true);
        };

    }

    return eventContentViewModel;
});
