/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * coldstorepanel module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout', 'slimscroll'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function coldstorepanelContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.csTempData = ko.observableArray();
        self.meteredAppl = ko.observable(0);
        self.offAppl = ko.observable(0);

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
            console.log(self.url);
            jsonData.fetchData(self.url).
                    then(function (result) {

                        result.forEach(function (item) {
                            let tempVal = 'Offline';
                            let timeVal = '';
                            let css = "fa fa-circle";
                            if (item.temp) {
                                tempVal = item.temp + '℃';
                                self.meteredAppl(self.meteredAppl() + 1);
                            }
                            if (item.ts) {
                                timeVal = moment(item.ts).format('DD/MM/YY hh:ss A');
                                css = ((moment.duration(moment().diff(moment(item.ts)))).asMinutes()) > 15 ? css + " text-yellow" : css + " text-green";
                            }
                            self.csTempData().push({name: item.name, temp: tempVal, time: timeVal, css: css});
                        });
                        self.offAppl(result.length - self.meteredAppl());
                        self.ready(true);
                        $('#tempscroll').slimScroll({
                            color: '#A9A9A9',
                            size: '10px',
                            height: '180px',
                            alwaysVisible: true
                        });

                    });

        }

        loadCSTempData();


        self.loadEnerAnalyticsPage = function () {
            oj.Router.rootInstance.go('applianceStat');
        };

        self.loadColdStrDB = function () {
            oj.Router.rootInstance.go('coldstrdb');
        };

        self.loadCompEvents = function () {
            oj.Router.rootInstance.go('compressorEvent');
        };

        self.loadApplEvents = function () {
            oj.Router.rootInstance.go('applEvent');
        };

        self.refreshTemp = function () {
            loadCSTempData();
        };

        self.loadTempDetChart = function () {
            oj.Router.rootInstance.go('appltempdet');
        };
    }

    return coldstorepanelContentViewModel;
});
