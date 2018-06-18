/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * dayenergy module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout', 'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function dayenergyContentViewModel() {
        var self = this;
        self.chartReady = ko.observable(true);

        self.enerSeriesValue = ko.observableArray(); //data for chart

        self.currentMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed
        var currentYear = moment(new Date()).year();
        /**
         *  URL configuration for the service end point
         */

//        self.url = config.url + 'db/totEnergy/details?&month=' + currentMonth + '&year=' + currentYear;

        self.getURL = function () {
            var sumurl = config.url + 'db/totEnergy/details?&month=' + self.currentMonth() + '&year=' + currentYear;
            return sumurl;
        };

        var dbViewModel = ko.dataFor(document.getElementById('ovrdbid'));
        self.calcMonth = ko.computed(function () {
            self.currentMonth(dbViewModel.selMonth());
            loadMonthEnergyData();
            return dbViewModel.selMonth();
        });

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadMonthEnergyData() {
            self.chartReady(false);
            self.enerSeriesValue.removeAll();
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        let dataArr = [];
                        result.dateArray.forEach(function (item) {
                            dataArr.push({x: item.dateTs, y: [item.totEnergy]});
                        });
                        self.enerSeriesValue().push({name: 'Energy', items: dataArr});
                        self.chartReady(true);
                    });
        }
        loadMonthEnergyData();

        self.loadApplRawChart = function () {
            oj.Router.rootInstance.go('applrawdata');
        };
    }

    return dayenergyContentViewModel;
});
