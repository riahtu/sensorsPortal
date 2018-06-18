/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * enerplanel module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function enerplanelContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.totEnergy = ko.observable(0);
        self.totCost = ko.computed(function () {
            return (parseInt(self.totEnergy()) * 8.5).toString().replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
        }, this);

        self.deviceEnergyArray = ko.observableArray();

        self.currentMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed
        var currentYear = moment(new Date()).year();

        /**
         *  URL configuration for the service end point
         */

//        self.url = config.url + 'db/totEnergy/summary?&month=' + currentMonth + '&year=' + currentYear;

        self.getURL = function () {
            var sumurl = config.url + 'db/totEnergy/summary?&month=' + self.currentMonth() + '&year=' + currentYear;
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
            self.ready(false);
            self.deviceEnergyArray.removeAll();
            console.log(self.getURL());
            jsonData.fetchData(self.getURL()).
                    then(function (result) {
                        self.totEnergy(result.sumEnergy);
                        let enerArray = result.devArray;
                        enerArray.forEach(function (item) {
                            let devicepercent = 0;
                            devicepercent = ((item.totEnergy / result.sumEnergy) * 100).toFixed(2);
                            self.deviceEnergyArray().push({name: item.devDesc, energy: item.totEnergy, percent: devicepercent + '%'});
                        });
                        self.ready(true);
                    });
        }

        /* Inital loadnig of data*/
        loadMonthEnergyData();
    }

    return enerplanelContentViewModel;
});
