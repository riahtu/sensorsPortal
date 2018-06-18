/**
 * applianceStat module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'dataService', 'ojs/ojchart', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojinputnumber'
], function (oj, ko, $, config, jsonData, dataService) {
    /**
     * The view model for the main content view template
     */
    function applianceStatContentViewModel() {
        var self = this;
        self.ready = ko.observable(false);
        //        // assign the passed-in $params to a viewModel variable
        //        self.applParam = $params;
        self.selectedAppl = ko.observable();
        self.selectedType = ko.observable();

        self.catTypeUrl = config.url + 'appliance/lkp/hiearchy/?locId=OMR';
        self.typeArray = ko.observableArray();
        self.applArray = [];
        self.typeApplArray = ko.observableArray();
        self.dataCursorPositionValue = ko.observable(null);
        /**
         *  Fetches category and type lookup data
         * @returns {undefined}
         */
        function loadCategoryTypeData() {
            console.log(self.catTypeUrl);
            jsonData.fetchData(self.catTypeUrl).
                then(function (result) {
                    result.forEach(function (catitem) {
                        if (catitem.category === 'Cold Storage') {
                            catitem.typeArr.forEach(function (typeitem) {
                                self.typeArray.push({ value: typeitem.type, label: typeitem.type });
                                let tempArr = [];
                                typeitem.applArr.forEach(function (item) {
                                    tempArr.push({ value: item.applId, label: item.name });
                                });
                                self.applArray[typeitem.type] = tempArr;
                            });
                        }
                    });

                    self.selectedType(self.typeArray()[0].value);
                    self.typeApplArray(self.applArray[self.selectedType()]);
                    self.selectedAppl(self.applArray[self.selectedType()][0].value);

                });
        }

        loadCategoryTypeData();


        self.eventsReady = ko.observable(false);
        self.appliance = ko.observableArray([
            { value: 'Refrigerator Vertical', label: 'Refrigerator Vertical' },
            { value: 'Refrigerator Cola', label: 'Refrigerator Cola' },
            { value: 'Refrigerator Pepsi', label: 'Refrigerator Pepsi' },
        ]);
        self.date = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));

        /*Dual Y*/
        self.dualY = ko.observable('off');
        self.splitterValue = ko.observable(0.5);
        self.dualYOptions = ko.observableArray([
            { id: 'on', label: 'on' },
            { id: 'off', label: 'off' }
        ]);
        self.splitterValue = ko.observable(0.5);

        self.dataCursorPositionValue = ko.observable(null);

        self.updateDualY = function (event, ui) {
            if (ui.option === "checked") {
                self.dualY(ui.value);
                if (ui.value === "off")
                    $('#splitterPosition').ojInputNumber({ disabled: true });
                else
                    $('#splitterPosition').ojInputNumber({ disabled: false });
            }
            return true;
        };

        /* chart data */
        //        var dualYSeries = [{name: "Compressor", items: [42, 55, 36, 22, 40]},
        //            {name: "Temprature", items: [34, 52, 15, 46, 32], assignedToY2: "on"}];

        self.applianceId = ko.observable(0);
        self.applianceEnergy = ko.observable(0);
        self.applianceCount = ko.observable(0);
        self.maxTemp = ko.observable(0);
        self.minTemp = ko.observable(0);
        self.avgTemp = ko.observable(0);
        self.upTime = ko.observable(0);
        self.cycles = ko.observable(0);

        self.day = ko.observable();
        self.month = ko.observable();
        self.year = ko.observable();


        self.energyTempSeriesValue = ko.observableArray();
        var dualYGroups = ["0", "1", "2", "3", "4", "5", "6"];
        self.energyTempGroupsValue = ko.observableArray(dualYGroups);
        self.eventsArray = ko.observableArray();

        self.isParamAvailable = function () {
            var isAvailable = true;
            if (!self.selectedAppl() || !self.day() || !self.month() || !self.year()) {
                isAvailable = false;
            }
            return isAvailable;
        };

        self.lineXAxis = ko.observable({ viewportMin: new Date(2013, 7, 25), viewportMax: new Date(2013, 8, 6) });
        self.compressorXAxis = ko.observable({ viewportMin: new Date(2013, 7, 25), viewportMax: new Date(2013, 8, 6) });

        // self.updateXAxis = function (event, ui) {
        //     if (event.target.id !== 'lineChart')
        //         self.lineXAxis({ viewportMin: ui['xMin'], viewportMax: ui['xMax'] });
        //     if (event.target.id !== 'compressorChart')
        //         self.compressorXAxis({ viewportMin: ui['xMin'], viewportMax: ui['xMax'] });
        // };

        self.updateXAxis = function (event) {
            if (event.target.id != 'lineChart')
                self.lineXAxis({ viewportMin: event.detail['xMin'], viewportMax: event.detail['xMax'] });
            if (event.target.id != 'compressorChart')
                self.compressorXAxis({ viewportMin: event.detail['xMin'], viewportMax: event.detail['xMax'] });

        };

        //        self.url = config.url + 'db/aeEnergy/';


        self.createChartData = function () {

            self.ready(false);

            self.lineXAxis = ko.observable({ viewportMin: new Date(self.year(), self.month() - 1, self.day()), viewportMax: new Date(self.year(), self.month() - 1, self.day() + 1) });
            self.compressorXAxis = ko.observable({ viewportMin: new Date(self.year(), self.month() - 1, self.day()), viewportMax: new Date(self.year(), self.month() - 1, self.day() + 1) });

            let tempJson = dataService.getApplianceTemp(self.selectedAppl(), self.day(), self.month(), self.year());
            let energyJson = dataService.getApplianceEnergy(self.selectedAppl(), self.day(), self.month(), self.year());
            let eventJson = dataService.getApplianceEvents(self.selectedAppl(), self.day(), self.month(), self.year());

            Promise.all([tempJson, energyJson, eventJson]).then(function (result) {
                self.energyTempSeriesValue.removeAll();
                self.loadEnergy(result[1]);
                self.loadTemp(result[0]);
                self.loadEvents(result[2]);

                self.ready(true);
            })

        }

        self.loadTemp = function (result) {
            if (result.temp) {
                console.log(result);
                self.energyTempSeriesValue().push({ name: 'Temprature', items: result.temp.items ,  color: '#0068a5' });
                self.maxTemp(parseInt(result.temp.maxTemp) + ' ºC');
                self.minTemp(parseInt(result.temp.minTemp) + ' ºC');
                self.avgTemp(parseInt(result.temp.avgTemp) + ' ºC');
            }
        };

        self.loadEnergy = function (result) {
            if (result.energy) {
                console.log(result);
                self.energyTempSeriesValue().push({ name: 'Energy', items: result.energy.items, assignedToY2: "on" ,  color: '#00c169'});
                self.applianceEnergy(result.energy.appEnergy);
                self.applianceCount(result.energy.count);
            }

        }
        self.loadEvents = function (result) {
            if (result.events) {
                console.log(result);
                self.eventsArray.removeAll();
                self.eventsArray().push({ name: 'Events', items: result.events.items, assignedToY2: "on" });
                self.upTime(parseInt(result.events.onTime / 60));
                self.cycles(result.events.onCycle);
            }
        }


        self.typeselect = function (event) {
            console.log(event.detail.value);

            self.selectedType(event.detail.value);
            self.typeApplArray([]);
            self.typeApplArray(self.applArray[self.selectedType()]);
            self.selectedAppl(self.applArray[self.selectedType()]);

        };

        self.applselect = function (event) {
            self.selectedAppl(event.detail.value);
        };


        self.optionChange = function (event, ui) {
            if (ui.option === "rawValue") {
                self.day(new Date(self.date()).getDate());
                self.month(new Date(self.date()).getMonth() + 1);
                self.year(new Date(self.date()).getFullYear());

            }
        };

        self.loadData = function () {
            self.createChartData();
        }

    }

    return applianceStatContentViewModel;
});
