/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * chart module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'util/stats', 'config', 'util/dataload', 'ojs/ojchart'],
        function (oj, ko, $, stats, config, jsonData) {

            function energyChartContentVM($params) {
                var self = this;
                // assign the passed-in $params to a viewModel variable
                self.enerChartData = $params;
                self.enerSeriesData = new ko.observableArray([]);
                self.applianceDataArray = [];
                self.applianceArray = [];
                self.attributeValue = ko.observable("voltage");
                self.attributeOptions = ko.observableArray([{"value": "voltage", "label": "Voltage"}, {"value": "current", "label": "Current"}, {"value": "frequency", "label": "Frequency"}, {"value": "powerfactor", "label": "Power Factor"}, {"value": "powerdemand", "label": "Power Demand"}, {"value": "totalharmonicdist", "label": "Total Harmonic Distortions"}, {"value": "totalenergy", "label": "Total Energy"}, {"value": "deltaenergy", "label": "Delta Energy"}]);
                self.enerGroupsDefault = ["Group A", "Group B", "Group C", "Group D"];
                self.enerGroupsValue = ko.observableArray(self.commonGroupsDefault);

                //statical variables
                self.maxPower = ko.observable(0);
                self.minPower = ko.observable(0);
                self.meanPower = ko.observable(0);
                self.variancePower = ko.observable(0);

                self.getURL = function () {

                    var urlParams = config.url + "appenergy?";

                    if (self.deviceId())
                        urlParams = urlParams + "&deviceId=01010001"; //+ self.deviceId();
                    if (self.applianceId())
                        urlParams = urlParams + "&applId=" + self.applianceId();
                    if (self.fromDt())
                        urlParams = urlParams + "&fromTs=" + new Date(self.fromDt()).getTime();
                    if (self.toDt())
                        urlParams = urlParams + "&toTs=" + new Date(self.toDt()).getTime();

                    return urlParams;
                };

                function loadEnergyData() {
                    var url = "data/energyDataTD.json";
                    if (self.enerChartData.date) {
                        url = "data/energyData" + self.enerChartData.date + ".json";
                    }
                    
                    $.getJSON(url).then(function (energyData) {
                        energyData.forEach(function (item) {
                            var tempDataArr = [];
                            var appliancePower = [];
                            if (self.applianceDataArray[item.APP]) {
                                tempDataArr = self.applianceDataArray[item.APP].data;
                                appliancePower = self.applianceDataArray[item.APP].pow;
                            }
                            tempDataArr.push({x: item.DATE, y: item.POWER});
                            appliancePower.push(item.POWER);
                            self.applianceDataArray[item.APP] = {"data": tempDataArr, "pow": appliancePower};
                            self.applianceArray.push(item.APP);
                        });
                        self.applianceArray = ko.utils.arrayGetDistinctValues(self.applianceArray).sort();
                        self.applianceArray.forEach(function (app) {
                            seriesData = {};
                            seriesData.name = app;
                            seriesData.items = self.applianceDataArray[app].data;
                            self.enerSeriesData.push(seriesData);
                            self.maxPower(Math.max.apply(null, self.applianceDataArray[app].pow).toFixed(3));
                            self.minPower(Math.min.apply(null, self.applianceDataArray[app].pow).toFixed(3));
                            self.meanPower(stats.meanValue(self.applianceDataArray[app].pow).toFixed(3));
                            self.variancePower(stats.variance(self.applianceDataArray[app].pow).toFixed(3));
                        });
                    });

                }
                ;
                loadEnergyData();
            }

            return energyChartContentVM;

        }
);