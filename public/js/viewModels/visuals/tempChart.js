/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * chart module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'util/stats', 'ojs/ojchart'],
        function (oj, ko, $, stats) {

            function tempChartContentVM($params) {
                var self = this;
                // assign the passed-in $params to a viewModel variable
                self.tempChartData = $params;
                self.tempSeriesData = new ko.observableArray([]);
                self.applianceDataArray = [];
                self.applianceArray = [];
                self.tempGroupsDefault = ["Group A", "Group B", "Group C", "Group D"];
                self.tempGroupsValue = ko.observableArray(self.commonGroupsDefault);

                //statical variables
                self.maxTemp = ko.observable(0);
                self.minTemp = ko.observable(0);
                self.meanTemp = ko.observable(0);
                self.varianceTemp = ko.observable(0);

                self.dataReady = ko.observable(false);

                function loadTempData() {
                    self.dataReady(false);
                    var url = "data/temperatureDataTD.json";
                    if (self.tempChartData.date) {
                        url = "data/temperatureData" + self.tempChartData.date + ".json";
                    }
                    //   console.log("inside the loadData");
                    $.getJSON(url).then(function (temperatureData) {
                        temperatureData.forEach(function (item) {
                            var tempDataArr = [];
                            var applianceTemp = [];
                            if (self.applianceDataArray[item.APP]) {
                                tempDataArr = self.applianceDataArray[item.APP].data;
                                applianceTemp = self.applianceDataArray[item.APP].temp;
                            }
                            tempDataArr.push({x: item.DATE, y: item.TEMP});
                            applianceTemp.push(item.TEMP);
                            self.applianceDataArray[item.APP] = {"data": tempDataArr, "temp": applianceTemp};
                            self.applianceArray.push(item.APP);
                        });
                        self.applianceArray = ko.utils.arrayGetDistinctValues(self.applianceArray).sort();
                        self.applianceArray.forEach(function (app) {
                            seriesData = {};
                            seriesData.name = app;
                            seriesData.items = self.applianceDataArray[app].data;
                            self.tempSeriesData.push(seriesData);
                            self.maxTemp(Math.max.apply(null, self.applianceDataArray[app].temp).toFixed(3));
                            self.minTemp(Math.min.apply(null, self.applianceDataArray[app].temp).toFixed(3));
                            self.meanTemp(stats.meanValue(self.applianceDataArray[app].temp).toFixed(3));
                            self.varianceTemp(stats.variance(self.applianceDataArray[app].temp).toFixed(3));
                        });
                    });
                    self.dataReady(true);
                }
                ;

                loadTempData();
            }

            return tempChartContentVM;

        }
);