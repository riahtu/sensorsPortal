/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * tempalert module
 */
define(['ojs/ojcore', 'knockout', 'util/dataload', 'config', 'moment', 'slimscroll'
], function (oj, ko, jsonData, config, moment) {
    /**
     * The view model for the main content view template
     */
    function tempalertContentViewModel() {
        var self = this;

        self.ready = ko.observable(true);
        self.alarms = ko.observableArray();
        var dateNow = moment().format('MMM Do, h:mm a');
        self.period = ko.observableArray(["TD"]);
        var noAlarms = {
            'alarmText': "No notifications Today No notifications Today",
            'alarmTime': dateNow,
            'severity': 'High',
            'color': 'label-danger'
        };

        self.alarms().push(noAlarms);

        function loadtempAlertData() {
            var url = "data/tempalert.json";
            self.ready(false);
            console.log(url);
            let alarmsArray = [];
//            jsonData.getTotalEnergyTable(url).
            $.getJSON(url).then(function (result) {
                result.forEach(function (alarm) {
                    var alarmObj = {};
                    alarmObj.alarmText = alarm.appDesc;
                    alarmObj.alarmTime = alarm.toTs;
                    alarmObj.temp = alarm.temp;
                    alarmObj.color = alarm.color;
                    alarmObj.severity = alarm.severity;
                    alarmsArray.push(alarmObj);
                });
                self.alarms(alarmsArray);
                console.log(self.alarms());
                self.ready(true);
            });
        };
        
        loadtempAlertData();
//        self.loadData = function (loc) {
//            return new Promise(function (resolve, reject) {
//                url = 'js/data/alarms_' + loc + '.json';
//
//                jsonData.fetchData(url).then(function (alarmsData) {
//                    self.alarms([]);
//
//                    var alarmsArray = [];
//                    alarmsData.alarms.forEach(function (alarm) {
//                        var alarmObj = {};
//                        alarmObj.alarmText = alarm.alarmText;
//                        alarmObj.alarmTime = moment(alarm.alarmTime).format('Do, h:mm a');
//                        alarmObj.color = alarm.color;
//                        alarmObj.severity = alarm.severity;
//                        alarmsArray.push(alarmObj);
//                    });
//
//                    self.alarms(alarmsArray);
//                    self.ready(true);
//                    resolve(true);
//                }).fail(function (error) {
//                    console.log('Error: ' + error);
//                    resolve(false);
//                });
//            });
//
//        };
    }

    return tempalertContentViewModel;
});
