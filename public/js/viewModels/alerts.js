/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * incidents module
 */
define(['ojs/ojcore', 'knockout', 'data/mockData', 'config', "moment", "daterangepicker", 'bootstrap-datepicker'
], function (oj, ko, jsonData, config, moment) {
    /**
     * The view model for the main content view template
     */
    function incidentsContentViewModel() {
        var self = this;
        self.loadIncident = function (data) {
            console.log(data);
            history.pushState(null, '', 'index.html?root=incident&id=' + data);
            oj.Router.sync();
        };

        self.getUrl = function () {
            var urlParams = config.url + 'alerts/';
            urlParams = urlParams + "?loc=" + rootViewModel.currentLocationID();
            urlParams = urlParams + "&type=" + self.alertType();
            urlParams = urlParams + "&start=" + self.start;
            urlParams = urlParams + "&end=" + self.end;
            return urlParams;
        };

        self.alertType = ko.observable('Temp');

        self.setAlertType = function (alertType) {
            console.log(alertType);
            self.alertType(alertType);
            self.loadData();
        };

        self.ready = ko.observable(false);
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        self.currentLocation = ko.observable();

        self.incidents = ko.observableArray();
        self.tempTotal = ko.observable(0);
        self.energyTotal = ko.observable(0);
        self.otherTotal = ko.observable(0);





        //        self.prod = rootViewModel.prod();
        self.prod = true;



        /*Load Data*/
        self.loadData = function () {
            return new Promise(function (resolve, reject) {

                if (self.prod) {
                    url = self.getUrl();
                    console.log(url)
                } else {
                    url = 'js/data/mock/incidents.json';
                }

                jsonData.fetchData(url).then(function (incidents) {
                    self.incidents.removeAll();
                    
                    if(self.alertType()==='Temp'){
                    self.tempTotal(incidents.length)    
                    }
                    
                    if(self.alertType()==='Energy'){
                    self.energyTotal(incidents.length)    
                    }
                    
                    
                    self.incidents(incidents);
                    self.ready(true);
                    resolve(true);
                }).fail(function (error) {
                    console.log(error);
                    resolve(false);
                });
            });

        };

        /*Location Change*/
        self.locationChange = ko.computed(function () {
            //      self.currentLocation(rootViewModel.currentLocationID());
            //  self.loadData();
        });

        self.start = moment().subtract(6, 'days');
        self.end = moment();
        self.dateText = ko.observable();



        self.handleAttached = function () {
            $("#reportrange").daterangepicker({startDate: self.start,
                endDate: self.end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, self.datePicked);
        };

        //  $('#reportrange span').html(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'));

        self.datePicked = function (start, end) {
            // console.log(moment(start).unix(), moment(end).unix());
            self.start = start;
            self.end = end;
            self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
            self.loadData();
        };

//        self.datePicked(self.start, self.end);
        self.dateText(self.start.format('MMMM D, YYYY') + ' - ' + self.end.format('MMMM D, YYYY'))
        self.loadData();
    }

    return incidentsContentViewModel;
});
