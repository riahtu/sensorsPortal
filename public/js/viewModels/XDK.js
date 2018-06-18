/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * XDK module
 */
define(['ojs/ojcore', 'knockout', 'socket', 'highcharts'
], function (oj, ko, io) {
    /**
     * The view model for the main content view template
     */
    function XDKContentViewModel() {
        var self = this;
        self.temp = ko.observable();
        self.rh = ko.observable();
        self.press = ko.observable();
        self.lum = ko.observable();
        self.vib = ko.observable();
        self.xyz = ko.observable();
        self.btn = ko.observable('Off');
        self.btncss = ko.observable("text-red")

        self.series = {};
        self.series1 = {};

        self.socket = io.connect('/');

        self.socket.on('message', function (data) {
            console.log(data);
            self.lum(data.lum + ' Lumens');


            if (data.lum > 400) {
                self.lum(400)
            } else {
                self.lum(data.lum)
            }


            self.temp(data.temp);

            if (data.accMag > 12000) {
                self.vib(12000)
            } else {
                self.vib(data.accMag)
            }



            self.rh(data.rh)
            self.press(data.pres)

            if (data.b1) {
                self.btn('On');
                self.btncss('text-green')
            } else {
                self.btncss('text-red')
                self.btn('Off');
            }


            var x = (new Date()).getTime(), // current time
                    y = self.vib();
            self.series1.addPoint([x, self.lum()], true, true);
            self.series.addPoint([x, y], true, true);
        });

        self.handleAttached = function (info) {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });

            Highcharts.chart('chartContainer', {
                chart: {
                    type: 'line',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {

                            self.series = this.series[0];

                        }
                    }
                },
                title: {
                    text: 'Live Data'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 200
                },
                yAxis: {
                    title: {
                        text: 'Value'
                    },
                    plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }],
                    max: 12000,
                    min: 2000
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                                Highcharts.numberFormat(this.y, 2);
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                        name: 'Vibration Magnitude data',
                        data: (function () {
                            // generate an array of random data
                            var data = [],
                                    time = (new Date()).getTime(),
                                    i;

                            for (i = -49; i <= 0; i += 1) {
                                data.push({
                                    x: time + i * 1000,
                                    y: 2000
                                });
                            }
                            return data;
                        }())
                    }]
            });


            Highcharts.chart('chartContainer1', {
                chart: {
                    type: 'area',
                    animation: Highcharts.svg, // don't animate in old IE
                    marginRight: 10,
                    events: {
                        load: function () {

                            self.series1 = this.series[0];

                        }
                    }
                },
                title: {
                    text: 'Live Data'
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 200
                },
                yAxis: {
                    title: {
                        text: 'Value'
                    },
                    plotLines: [{
                            value: 0,
                            width: 3,
                            color: '#808080'
                        }],
                    max: 400,
                    min: 0
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + this.series.name + '</b><br/>' +
                                Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                                Highcharts.numberFormat(this.y, 2);
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                        name: 'Luminosity data',
			color: '#FF4500',
                        data: (function () {
                            // generate an array of random data
                            var data = [],
                                    time = (new Date()).getTime(),
                                    i;

                            for (i = -49; i <= 0; i += 1) {
                                data.push({
                                    x: time + i * 1000,
                                    y: 0
                                });
                            }
                            return data;
                        }())
                    }]
            });

        };

    }

    return XDKContentViewModel;
});
