/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * XDK module
 */
define(['ojs/ojcore', 'knockout', 'socket', 'smoothie', 'knob', 'ojs/ojgauge', 'slimscroll'
], function (oj, ko, io) {
    /**
     * The view model for the main content view template
     */
    function XDKContentViewModel() {
        var self = this;
        self.mapHome = ko.observable('mapHome');
        self.temp = ko.observable(20);
        self.rh = ko.observable(60);
        self.press = ko.observable(60);
        self.lum = ko.observable(50);

        self.lumReady = ko.observable(false);

        self.vib = ko.observable();
        self.xyz = ko.observable();
        self.btn = ko.observable('Off');
        self.btncss = ko.observable("text-red")

        self.alarmsArray = ko.observableArray();


        self.acc = ko.observable([1, 1, 1]);
        self.mag = ko.observable([0, 0, 0]);
        self.gyr = ko.observable([0, 0, 0]);

        self.id = ko.observable();
        self.lap = ko.observable(0);
        self.id = ko.observable();

        self.batt = ko.observable(0);

        self.series = {};
        self.series1 = {};

        self.socket = io.connect('/');

        self.socket.on('tiClient', function (event, data) {


            switch (event) {
                case "lux" :
                    self.lumReady(false);
                    self.lum(data.lux);
                    lux.append(new Date().getTime(), self.lum());
                    $("#lumGuage").trigger('change');

                    if (data.lux < 20) {
                        self.alarmsArray.push(
                                {DESCRIPTION: "Light threshold " + data.lux, FROM_TIMESTAMP: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), SEVERITY: "Low"}
                        );
                    }

                    self.lumReady(true);
                    break;
                case "rh" :
                    self.rh(data.rh);
                    self.temp(data.temp);
                    $("#rhGuage").trigger('change');
                    $("#tempGuage").trigger('change');
                    break;
                case "press" :
                    self.press(data.press);
                    $("#pressGuage").trigger('change');
                    break;
                case "acc" :
                    self.acc(data.acc);
                    //self.acc(Math.round(Math.sqrt(Math.pow(data.acc[0], 2) + Math.pow(data.acc[1], 2) + Math.pow(data.acc[2], 2))))

                    let shock = Math.round(Math.sqrt(Math.pow(data.acc[0], 2) + Math.pow(data.acc[1], 2) + Math.pow(data.acc[2], 2)))
                    console.log(shock);
                    if (shock > 6) {
                        if (shock > 8) {
                            self.alarmsArray.push(
                                    {DESCRIPTION: "High Shock Detected " + shock, FROM_TIMESTAMP: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), SEVERITY: "High"}
                            );
                        } else {
                            self.alarmsArray.push(
                                    {DESCRIPTION: "Shock Detected " + shock, FROM_TIMESTAMP: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(), SEVERITY: "Medium"}
                            );
                        }

                    }

                    line1.append(new Date().getTime(), shock);
//                    line1.append(new Date().getTime(), self.acc()[0]);
//                    line2.append(new Date().getTime(), self.acc()[1]);
//                    line3.append(new Date().getTime(), self.acc()[2]);

                    break;
                case "mag" :
                    self.mag(data.mag);
                    break;
                case "gyr" :
                    self.gyr(data.gyr);
                    gyr1.append(new Date().getTime(), self.gyr()[0]);
                    gyr2.append(new Date().getTime(), self.gyr()[1]);
                    gyr3.append(new Date().getTime(), self.gyr()[2]);
                    break;
                case "batt" :
                    self.batt(data.batt);
                    break;
                case "id" :
                    self.lap(self.lap() + 1);
                    self.id(data.id);
                    break;
                default:
                    console.log(event);
                    break;
            }
            console.log(self.alarmsArray().length)
            if (self.alarmsArray().length > 5) {
                self.alarmsArray().shift();
            }
        });


        self.getSevColor = function (severity) {
            switch (severity) {
                case "Low":
                    return "label-info";
                    break;
                case "Medium":
                    return "label-warning";
                    break;
                case "High":
                    return "label-danger";
                    break;
            }
        }


        var smoothie = new SmoothieChart(
                {grid: {sharpLines: true, millisPerLine: 500, verticalSections: 10, fillStyle: 'rgba(255,255,255,0.88)', strokeStyle: '#c0c0c0'},
                    labels: {fontSize: 16, precision: 0, fillStyle: '#000000'},
                    timestampFormatter: SmoothieChart.timeFormatter,
                    minValue: -6,
                    maxValue: 10,
                    horizontalLines: [{color: '#008080', lineWidth: 2, value: 8}, {color: '#3F51B5', lineWidth: 2, value: -2}]
                })


        var smoothieGyr = new SmoothieChart(
                {grid: {sharpLines: true, millisPerLine: 500, verticalSections: 10, fillStyle: 'rgba(255,255,255,0.88)', strokeStyle: '#c0c0c0'},
                    labels: {fontSize: 16, precision: 0, fillStyle: '#000000'},
                    timestampFormatter: SmoothieChart.timeFormatter,
                    minValue: -60,
                    maxValue: 60})

        var smoothieLux = new SmoothieChart(
                {grid: {sharpLines: true, millisPerLine: 500, verticalSections: 10, fillStyle: 'rgba(255,255,255,0.88)', strokeStyle: '#c0c0c0'},
                    labels: {fontSize: 16, precision: 0, fillStyle: '#000000'},
                    timestampFormatter: SmoothieChart.timeFormatter,
                    minValue: -100,
                    maxValue: 500,
                    horizontalLines: [{color: '#880000', lineWidth: 2, value: 20}]},
                )


        series = new TimeSeries();


        $(document).ready(function () {
            smoothie.streamTo(document.getElementById("mycanvas"), 500 /*delay*/);
            smoothieGyr.streamTo(document.getElementById("GyrCanvas"), 500 /*delay*/);
            smoothieLux.streamTo(document.getElementById("LuxCanvas"), 500 /*delay*/);
        })


// Data
        var line1 = new TimeSeries();
//        var line2 = new TimeSeries();
//        var line3 = new TimeSeries();


        var gyr1 = new TimeSeries();
        var gyr2 = new TimeSeries();
        var gyr3 = new TimeSeries();

        var lux = new TimeSeries();

// Add to SmoothieChart
        smoothie.addTimeSeries(line1, {lineWidth: 1.0, strokeStyle: '#000000'});
//        smoothie.addTimeSeries(line2, {lineWidth: 1.0, strokeStyle: '#ff0000'});
//        smoothie.addTimeSeries(line3, {lineWidth: 1.0, strokeStyle: '#00ff00'});


        smoothieGyr.addTimeSeries(gyr1, {lineWidth: 1.0, strokeStyle: '#ffff00'});
        smoothieGyr.addTimeSeries(gyr2, {lineWidth: 1.0, strokeStyle: '#ff0000'});
        smoothieGyr.addTimeSeries(gyr3, {lineWidth: 1.0, strokeStyle: '#00ff00'});


        smoothieLux.addTimeSeries(lux, {lineWidth: 1.0, strokeStyle: '#000000'});


        $(document).ready(function () {
            $('.knob').knob({
                "readOnly": true
            });

            $('#alertBox').slimScroll({
                height: '365px',
                color: '#E0E0E0',
                size: '7px',

                alwaysVisible: true
            });
        });



    }

    return XDKContentViewModel;
});
