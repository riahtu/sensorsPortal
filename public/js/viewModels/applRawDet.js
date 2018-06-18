/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * applRawDet module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'moment', 'util/dataload', 'ojs/ojinputtext',
    'ojs/ojdatetimepicker', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojselectcombobox'
], function (oj, ko, $, config,  moment, jsonData) {
    /**
     * The view model for the main content view template
     */
    function applRawDetContentViewModel() {
        var self = this;
        self.chartReady = ko.observable(false);
        self.deviceId = ko.observable("01010002");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(1, 'h'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.selectedAttr = ko.observable("current");
        self.attributeOptions = ko.observableArray([{"value": "voltage", "label": "Voltage"}, {"value": "current", "label": "Current"},
            {"value": "freq", "label": "Frequency"}, {"value": "powerfactor", "label": "Power Factor"},
            {"value": "rxpow", "label": "Reactive Power"}, {"value": "thdvolt", "label": "Delta Energy"}]);

        /* chart data */
        self.lineSeriesValue = ko.observableArray();
        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');
        /**
         *  URL configuration for the service end point
         */

        self.getUrl = function () {
            let url = config.url + 'db/raw?&deviceId=' + self.deviceId() + '&fromTs=' + new Date(self.fromDt()).getTime() + '&toTs=' +
                    new Date(self.toDt()).getTime() + '&attr=' + self.selectedAttr();
            return url;
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        self.loadRawData = function () {
            console.log(self.getUrl());
            self.chartReady(false);
            self.lineSeriesValue.removeAll();
            jsonData.fetchData(self.getUrl()).
                    then(function (result) {
                        var r = [];
                        var y = [];
                        var b = [];
                        result.forEach(function (item) {
                            r.push({x: item.ts, y: item.r});
                            y.push({x: item.ts, y: item.y});
                            b.push({x: item.ts, y: item.b});
                        });
                        self.lineSeriesValue([
                            {name:  ' R', items: r},
                            {name: ' Y', items: y},
                            {name: ' B', items: b}
                        ]);
                        console.log( self.lineSeriesValue());
                        self.chartReady(true);
                    });
        };

        /*Lookups*/
        self.devicesLkp = ko.observableArray([{"value": "01010001", "label": "Food & Veg Section"}, {"value": "01010002", "label": "Bakery Hot & Cold"},
            {"value": "01010003", "label": "Bakery Appliances"}, {"value": "01010004", "label": "Cold Room Appliances"}]);
//        lkps('deviceLkp').then(
//                function (lkp)
//                {
//                    self.devicesLkp(lkp);
//                }
//        );

        self.loadRawData();
    }

    return applRawDetContentViewModel;
});
