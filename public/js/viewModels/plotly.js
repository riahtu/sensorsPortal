/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * plotly module
 */
define(['ojs/ojcore', 'knockout', 'plotly', 'util/dataload', "config", 'moment', 'ojs/ojknockout',
    'ojs/ojtimezonedata', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojinputnumber'
], function (oj, ko, plotly, jsonData, config, moment) {
    /**
     * The view model for the main content view template
     */
    function plotlyContentViewModel() {
        var self = this;
        self.handleAttached = function () {

            self.selectedAppl = ko.observable();
            self.selectedType = ko.observable();
            self.currentMonth = moment(new Date()).month() + 1;//month are zero indexed
            self.currentYear = moment(new Date()).year();
            self.chartReady = ko.observable(true);
            self.chartReady1 = ko.observable(true);
            self.chartReady2 = ko.observable(true);

            self.getUrl = function () {
                url = config.url  + 'plotly/energy/?applId=' + self.selectedAppl() + '&month=' + self.currentMonth + '&year=' + self.currentYear;
                return url;
            };

            self.getUrlEvents = function () {
                url = config.url + 'plotly/events/?applId=' + self.selectedAppl() + '&month=' + self.currentMonth + '&year=' + self.currentYear;
                return url;
            };

             self.getUrlTemp = function () {
                url = config.url + 'plotly/temp/?applId=' + self.selectedAppl() + '&month=' + self.currentMonth + '&year=' + self.currentYear;
                return url;
            };

            var colorscaleValue = [
                [0, '#add8e6'],
                [1, '#566c73']
            ];
            var colors = ['#add8e6', '#8aacb8', '#7997a1', '#67818a', '#566c73'];

            var layout = {
//                title: 'Annotated Heatmap',
                xaxis: {
                    ticks: '1',
                    side: 'top',
                    tickmode: 'auto',
                    nticks: 24,
                    title: "hour",
                    autosize: true
                },
                yaxis: {
                    ticks: '1',
                    ticksuffix: ' ',
                    autosize: true,
                    tickmode: 'auto',
                    nticks: 30,
                    title: "day"
                }
            };

            self.loadCompEventData = function () {
                self.chartReady(false);


                jsonData.fetchData(self.getUrl()).
                        then(function (result) {
                            var data = [
                                {
                                    z: result.z,
                                    x: result.x,
                                    y: result.y,
                                    type: 'heatmap',
//                                    color: colors,
                                    colorscale: colorscaleValue,
                                    color: [0, 1, 2, 3],
                                    cmin: 0,
                                    cmax: 3,
                                }
                            ];
                            self.chartReady(true);
                            plotly.newPlot('energyPlot', data, layout);

                        }
                        )
            }

            self.loadCompEventData1 = function () {
                self.chartReady1(false);
                jsonData.fetchData(self.getUrlEvents()).
                        then(function (result) {
                            var data1 = [
                                {
                                    z: result.z1,
                                    x: result.x,
                                    y: result.y,
                                    type: 'heatmap',
//                                    color: colors,
                                    colorscale: colorscaleValue,
                                    color: [0, 1, 2, 3],
                                    cmin: 0,
                                    cmax: 3,
                                }
                            ];

                            var data2 = [
                                {
                                    z: result.z2,
                                    x: result.y,
                                    y: result.x,
                                    type: 'heatmap',
//                                    color: colors,
                                    colorscale: colorscaleValue,
                                    color: [0, 1, 2, 3],
                                    cmin: 0,
                                    cmax: 3,
                                }
                            ];
                            self.chartReady1(true);
                            plotly.newPlot('cyclesPlot', data1, layout);
                            plotly.newPlot('onTimePlot', data2, layout);

                        }
                        )
            }

            self.loadCompTempData = function () {
                self.chartReady2(false);


                jsonData.fetchData(self.getUrlTemp()).
                        then(function (result) {
                            var data = [
                                {
                                    z: result.z,
                                    x: result.y,
                                    y: result.x,
                                    type: 'heatmap',
//                                    color: colors,
                                    colorscale: colorscaleValue,
                                    color: [0, 1, 2, 3],
                                    cmin: 0,
                                    cmax: 3,
                                }
                            ];
                            self.chartReady2(true);
                            plotly.newPlot('tempPlot', data, layout);

                        }
                        )
            }

            self.catTypeUrl = config.url + 'appliance/lkp/hiearchy/?locId=OMR';
            self.typeArray = ko.observableArray();
            self.applArray = [];
            self.typeApplArray = ko.observableArray();
            self.date = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));

            function loadCategoryTypeData() {
                console.log(self.catTypeUrl);
                jsonData.fetchData(self.catTypeUrl).
                        then(function (result) {
                            result.forEach(function (catitem) {
                                if (catitem.category !== 'Unknown' &&catitem.category !== 'Cooler' &&catitem.category !== 'Heater' &&catitem.category !== 'Mixer'  ) {
                                    catitem.typeArr.forEach(function (typeitem) {
                                        self.typeArray.push({value: typeitem.type, label: typeitem.type});
                                        let tempArr = [];
                                        typeitem.applArr.forEach(function (item) {
                                            tempArr.push({value: item.applId, label: item.name});
                                        });
                                        self.applArray[typeitem.type] = tempArr;
                                    });
                                }
                            });

                            self.selectedType(self.typeArray()[0].value);
                            self.typeApplArray(self.applArray[self.selectedType()]);
                            self.selectedAppl(self.applArray[self.selectedType()][0].value);
                            self.loadCompEventData();
                            self.loadCompEventData1();
                            self.loadCompTempData();
                        });
            }

            loadCategoryTypeData();

            self.typeselect = function (event) {
                self.typeApplArray([]);
                self.typeApplArray(self.applArray[self.selectedType()]);
                self.selectedAppl(self.applArray[self.selectedType()][0].value);
            };

            self.optionChange = function (event) {
                self.currentMonth = new Date(self.date()).getMonth() + 1;
                self.currentYear = new Date(self.date()).getFullYear();
            };

            self.loadData = function () {
                self.loadCompEventData();
                self.loadCompEventData1();
                self.loadCompTempData();
            };





        };
    }


    return plotlyContentViewModel;
});

