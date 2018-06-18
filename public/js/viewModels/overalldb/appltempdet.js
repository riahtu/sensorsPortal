/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * appltempdet module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'moment', 'util/dataload', 'ojs/ojinputtext',
    'ojs/ojdatetimepicker', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel'
], function (oj, ko, $, config, moment, jsonData) {
    /**
     * The view model for the main content view template
     */
    function appltempdetContentViewModel() {
        var self = this;
        self.ready = ko.observable(false);
        self.chartReady = ko.observable(false);
        self.applId = ko.observable("0102012048708");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(1, 'd'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.applIdArry = ko.observableArray();
        /* chart data */
        self.lineSeriesValue = ko.observableArray();
        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');
        /**
         *  URL configuration for the service end point
         */

        self.getUrl = function () {
            let url = config.url + 'db/temp/details/appliance?&locId=OMR&applId=' + self.applId() + '&fromTs=' + new Date(self.fromDt()).getTime() + '&toTs=' +
                    new Date(self.toDt()).getTime();
            return url;
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        self.loadTempDetData = function () {
            console.log(self.getUrl());
            self.chartReady(false);
            self.lineSeriesValue.removeAll();
            jsonData.fetchData(self.getUrl()).
                    then(function (result) {
                        if (result.temp) {
                            self.lineSeriesValue([
                                {name: 'Temperature', items: result.temp.items}
                            ]);
                        }
                        self.chartReady(true);
                    });
        };

        /**
         *  URL configuration for the service end point
         */

        self.url = config.url + 'db/temp/latest/appliance?locId=OMR';

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadCSTempData() {
            self.ready(false);
            jsonData.fetchData(self.url).
                    then(function (result) {
                        result.forEach(function (item) {
                            self.applIdArry().push({label: item.name, value: item.applId});
                        });
                        self.ready(true);
                        self.loadTempDetData();
                    });
        }
        loadCSTempData();

    }

    return appltempdetContentViewModel;
});
