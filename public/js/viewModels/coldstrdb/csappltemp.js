/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * csappltemp module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'dataService', 'moment', 'ojs/ojknockout', 'ojs/ojbutton', 'ojs/ojtoolbar', 'ojs/ojselectcombobox',
    'ojs/ojdatetimepicker', 'ojs/ojtimezonedata', 'ojs/ojinputnumber', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojdialog'
], function (oj, ko, $, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function csappltempContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.period = ko.observableArray(["TD"]);
        self.fromDate = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.toDate = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.applianceTypeDataArray = [];
        self.applianceTypeArray = [];
        self.coldStrDataArray = ko.observableArray();
        self.chillerArray = ko.observableArray();
        self.coolerArray = ko.observableArray();
        self.refrigratorArray = ko.observableArray();
        self.freezerArray = ko.observableArray();
        self.coldRoomArray = ko.observableArray();
        self.odcArray = ko.observableArray();
        self.enerGroupsDefault = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
        self.enerGroupsValue = ko.observableArray(self.commonGroupsDefault);
        this.dateChangedHandler = function (event) {
            self.period(event.detail.value);
        };
        function loadCSData() {
            self.ready(false);
            jsonData.getColdStrData().then(function (energyData) {

                for (var prop in energyData) {
                    //initialize variables for data construction
                    let  ener = 0;
                    let count = 0;
                    let lastSeen = 0;
                    let cycles = 0;
                    let dur = 0;
                    let lastSeenClass = "colddbtbleicon fa fa-circle";
                    let time = 0;
                    let temp = 0;
                    let device = 0;

                    if (energyData.hasOwnProperty(prop)) {
                        //if event data present 
                        if (energyData[prop].event) {
                            cycles = energyData[prop].event.cycles;
                            dur = energyData[prop].event.onTime;
                            dur = (parseInt(dur) / 60000).toFixed(2);
                        }
                        ;
                        //if energy data present 
                        if (energyData[prop].energy) {
                            ener = energyData[prop].energy.energy;
                            ener = parseFloat(ener).toFixed(2);
                            count = energyData[prop].energy.count;
                            lastSeen = energyData[prop].energy.lastSeen;
                            //  var day = moment(new Date(lastSeen));
                            lastSeen = (new Date().getTime() - lastSeen) / 60000;

                        }
                        ;
                        //if temp data present 
                        if (energyData[prop].temp) {
                            temp = energyData[prop].temp.temp;
                            device = energyData[prop].temp.device;
                            time = energyData[prop].temp.ts;
                        }
                        ;
                        //set lastseen style for status icon
                        if (lastSeen > 1) {
                            lastSeenClass = "text-red " + lastSeenClass;
                        } else if (lastSeen > 10) {
                            lastSeenClass = "text-yellow " + lastSeenClass;
                        } else if (lastSeen < 5) {
                            lastSeenClass = "text-green " + lastSeenClass;
                        }

                        //create the data object
                        var type = energyData[prop].type;
                        var obj = {
                            "applId": energyData[prop].applId,
                            "name": energyData[prop].name,
                            "zone": energyData[prop].zone,
                            "type": energyData[prop].type,
                            "category": energyData[prop].category,
                            "ener": ener,
                            "count": count,
                            "lastSeen": lastSeen,
                            "lastSeenClass": lastSeenClass,
                            "cycles": cycles,
                            "dur": dur,
                            "temp": temp,
                            "device": device,
                            "time": time
                        };
                        // type based data array collection and their count
                        var tempDataArr = [];
                        let cnt = 0;
                        if (self.applianceTypeDataArray[type]) {
                            tempDataArr = self.applianceTypeDataArray[type].data;
                        }
                        tempDataArr.push(obj);
                        cnt = tempDataArr.length;
                        self.applianceTypeDataArray[type] = {"data": tempDataArr, "cnt": cnt};
                        self.applianceTypeArray.push(type);
                    }
                }
                ;
                //get distinct types for data list
                self.applianceTypeArray = ko.utils.arrayGetDistinctValues(self.applianceTypeArray);
                let tempcntArray = [];
                self.applianceTypeArray.forEach(function (appType) {
                    tempcntArray.push([appType, self.applianceTypeDataArray[appType].cnt]);
                });
                //sort type based dataarray based on the length
                tempcntArray.sort(function (a, b) {
                    return a[1] - b[1];
                });
                tempcntArray.forEach(function (appType) {
                    self.coldStrDataArray().push({"name": appType[0], "typedata": self.applianceTypeDataArray[appType[0]].data});
                });
                self.ready(true);
            });

        }
        ;
        loadCSData();

        self.loadAnalyticsPage = function () {
            oj.Router.rootInstance.go('applianceStat');
        };
        /* chart data */

        self.enerSeriesValue = ko.observableArray(); //data for chart
        self.cySeriesValue = ko.observableArray(); //data for chart
        self.tempSeriesValue = ko.observableArray(); //data for chart
        self.lineSeriesValue = ko.observableArray(); //data for chart
        self.chartEnerData = [];
        self.chartCycleData = [];
        self.chartTempData = [];
//        self.chartAppLkpData = ko.observableArray(); // lookup value in the chart dialog
//        self.selectedAppl = ko.observable('None');
        self.chartReady = ko.observable(false);
        self.loadChartData = function () {
            self.chartReady(false);
            self.chartEnerData = [];
            self.chartCycleData = [];
            self.chartTempData = [];
            var url = "data/coldStrChartData.json";
            $.getJSON(url).then(function (charData) {
                charData.forEach(function (item) {
//                    var tempArr = [];
//                    if (self.chartAppData[item.applId]) {
//                        tempArr = self.chartAppData[item.applId].data;
//                    }
                    self.chartEnerData.push({x: item.DATE, y: item.ener});
                    self.chartCycleData.push({x: item.DATE, y: item.cycles});
                    self.chartTempData.push({x: item.DATE, y: item.temp});
//                    self.chartAppData[item.applId] = {"name": item.appDesc, "data": tempArr};
                });
            });
            self.enerSeriesValue.removeAll();
            self.cySeriesValue.removeAll();
            self.tempSeriesValue.removeAll();
            self.enerSeriesValue().push({name: "Appliance 1", items: self.chartEnerData});
            self.cySeriesValue().push({name: "Appliance 1", items: self.chartCycleData});
            self.tempSeriesValue().push({name: "Appliance 1", items: self.chartTempData});
            self.lineSeriesValue().push({name: "Energy", items: self.chartEnerData});
            self.lineSeriesValue().push({name: "Cycle", items: self.chartCycleData});
            self.lineSeriesValue().push({name: "Temperature", items: self.chartTempData});
            self.chartReady(true);
        };

        self.chartHdr = ko.observable("None selected"); //data for chart
        self.statData = ko.observable(); //data for chart
        self.loadApplChart = function (data) {
            self.chartHdr('(' + data.name + ')');
            self.statData(data.applId);
//            self.loadChartData();
            document.querySelector('#modalDialog1').open();
        };
    }

    return csappltempContentViewModel;
});
