/**
 * rawEnerRep module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'dataService', 'moment', 'xlsOut', 'ojs/ojinputtext',
    'ojs/ojdatetimepicker', 'ojs/ojknockout', 'ojs/ojselectcombobox', 'ojs/ojtimezonedata', 'ojs/ojchart', 'ojs/ojlabel', 'ojs/ojselectcombobox', 'ojs/ojdialog'
], function (oj, ko, $, data,  moment, xlsOut) {
    /**
     * The view model for the main content view template
     */
    function rawEnerRepContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.deviceId = ko.observable("01010001");
        self.applianceId = ko.observable("");
        self.fromDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date(moment().subtract(1, 'h'))));
        self.toDt = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.dataObservableArray = ko.observableArray();
        self.getURL = function () {
            var urlParams = "?";
            if (self.deviceId())
                urlParams = urlParams + "&deviceId=" + self.deviceId();
            if (self.fromDt())
                urlParams = urlParams + "&fromTs=" + new Date(self.fromDt()).getTime();
            if (self.toDt())
                urlParams = urlParams + "&toTs=" + new Date(self.toDt()).getTime();
            return urlParams;
        };
        /* Inital loadnig of data*/
        loadRawData();
        /* Event listener for search click*/
        self.filterRaw = function () {
            loadRawData();
        };
        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        function loadRawData() {
            self.ready(false);
            data.getRawEnergyTable(self.getURL()).then(function (result) {
                self.dataObservableArray.removeAll();
                self.dataObservableArray(result);
                self.ready(true);
            }).catch(function (e) {
                self.ready(true);
                console.log(e); // "oh, no!"
            });
        }


        self.downloadFile = function () {

            xlsOut(self.dataObservableArray(), 'Raw_Energy');
        };
        /*Lookups*/
        self.devicesLkp = ko.observableArray([{"value": "01010001", "label": "Food & Veg Section"}, {"value": "01010002", "label": "Bakery Hot & Cold"},
            {"value": "01010003", "label": "Bakery Appliances"}, {"value": "01010004", "label": "Cold Room Appliances"}]);

//        lkps('deviceLkp').then(
//                function (lkp)
//                {
//                    self.devicesLkp(lkp);
//                }
//        );
        /* toggle button variables */
        self.orientationValue = ko.observable('vertical');

        /* chart data */
        self.lineSeriesValue = ko.observableArray();
        self.attrSelectValue = ko.observable();


        self.startPlotting = function () {
            console.log(self.attrSelectValue());
        };
        self.chartReady = ko.observable(false);

        self.createChartData = function (name, attr1, attr2, attr3) {
            var r = [];
            var y = [];
            var b = [];

            self.dataObservableArray().forEach(function (item) {
                r.push({x: item.ts, y: item[attr1]});
                y.push({x: item.ts, y: item[attr2]});
                b.push({x: item.ts, y: item[attr3]});
            });

            self.lineSeriesValue.removeAll();

            self.lineSeriesValue([
                {name: name + ' R', items: r},
                {name: name + ' Y', items: y},
                {name: name + ' B', items: b}
            ]);

        };

        self.loadChart = function () {
            self.chartReady(false);
            if (self.dataObservableArray()) {
                switch (self.attrSelectValue()[0]) {
                    case 'volt':
                        self.createChartData('Voltage', 'voltagea', 'voltageb', 'voltagec');
                        break;
                    case 'curr':
                        self.createChartData('Current', 'currenta', 'currentb', 'currentc');
                        break;
                    case 'pf':
                        self.createChartData('Pow Factor', 'powerfactora', 'powerfactorb', 'powerfactorc');
                        break;
                    case 'freq':
                        self.createChartData('Frequency', 'freqa', 'feqb', 'freqc');
                        break;
                    case 'thd':
                        self.createChartData('Total Harmonic Distortion', 'thdvolta', 'thdvoltb', 'thdvoltc');
                        break;
                    case 'rx':
                        self.createChartData('Reactive Power', 'rxpowa', 'rxpowb', 'rxpowc');
                        break;
                    default:
                        self.createChartData('Voltage', 'voltagea', 'voltageb', 'voltagec');
                }
            }
            self.chartReady(true);
        };
    }

    return rawEnerRepContentViewModel;
});
