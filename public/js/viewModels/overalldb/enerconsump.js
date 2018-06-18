/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * home0 module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojchart'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function enerconsumpContentViewModel() {
        var self = this;
        self.chartReady = ko.observable(true);
        self.enerSeriesValue = ko.observableArray(); //data for chart

        self.currentMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed
        var currentYear = moment(new Date()).year();

        /**
         *  URL configuration for the service end point
         */

//        self.url = config.url + 'db/totEnergy/source?&month=' + currentMonth + '&year=' + currentYear;
        
        self.getURL = function () {
            var sumurl = config.url + 'db/totEnergy/source?&month=' + self.currentMonth() + '&year=' + currentYear;
            return sumurl;
        };

        var dbViewModel = ko.dataFor(document.getElementById('ovrdbid'));
        self.calcMonth = ko.computed(function () {
            self.currentMonth(dbViewModel.selMonth());
            loadSourceEnergyData();
            return dbViewModel.selMonth();
        });        

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadSourceEnergyData() {
            self.chartReady(false);
            self.enerSeriesValue.removeAll();
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        result.srcArray.forEach(function (item) {
                            let srcName = "none";
                            if (item.source === 0) {
                                srcName = "Generator";
                            } else {
                                srcName = "Grid";
                            }
                            self.enerSeriesValue().push({name: srcName, items: [item.totEnergy]});
                        });
                        console.log(self.enerSeriesValue());
                        self.chartReady(true);
                    });
        }
        loadSourceEnergyData();

        self.pieChartSliceLabel = function (dataContext) {
            return dataContext.value + " kWh";
        };
    }

    return enerconsumpContentViewModel;
});
