/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * eneralert module
 */
define(['ojs/ojcore', 'knockout', 'util/dataload', 'config', 'moment', 'slimscroll'
], function (oj, ko, jsonData, config, moment) {
    /**
     * The view model for the main content view template
     */
    function eneralertContentViewModel() {
        var self = this;

        self.ready = ko.observable(true);
        self.eneralerts = ko.observableArray();
        var dateNow = moment().format('MMM Do, h:mm a');
        self.period = ko.observableArray(["TD"]);
        var noAlarms = {
            'alarmText': "No notifications Today No notifications Today",
            'alarmTime': dateNow,
            'severity': 'High',
            'color': 'label-danger'
        };

        self.eneralerts().push(noAlarms);

        function loadenerAlertData() {
            var url = "data/eneralert.json";
            self.ready(false);
            console.log(url);
            let alarmsArray = [];
//            jsonData.getTotalEnergyTable(url).
            $.getJSON(url).then(function (result) {
                result.forEach(function (alarm) {
                    var alarmObj = {};
                    alarmObj.alarmText = alarm.appDesc;
                    alarmObj.alarmTime = alarm.toTs;
                    alarmObj.ener = alarm.ener;
                    alarmObj.color = alarm.color;
                    alarmObj.severity = alarm.severity;
                    alarmsArray.push(alarmObj);
                });
                self.eneralerts(alarmsArray);
                console.log(self.eneralerts());
                self.ready(true);
            });
        };
        loadenerAlertData();
    }

    return eneralertContentViewModel;
});
