/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * applGantt module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'config', 'util/dataload', 'moment', 'ojs/ojknockout', 'slimscroll',
    'ojs/ojgantt', 'ojs/ojselectcombobox', 'ojs/ojdatetimepicker', 'ojs/ojinputnumber'
], function (oj, ko, $, config, jsonData, moment) {
    /**
     * The view model for the main content view template
     */
    function applGanttContentViewModel() {
        var self = this;
        self.ready = ko.observable(true);
        self.applData = ko.observableArray();
        self.applTasks = ko.observableArray();
        self.projectStartDate = new Date("Feb 20, 2018");
        self.projectEndDate = new Date("Feb 21, 2018");

//        self.currentDateString = "Feb 21, 2018";
//        self.currentDateString = moment(new Date());

        self.date = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
        self.currentDate = new Date(self.date());

        self.frmdate = ko.observable();
        self.todate = ko.observable();
        self.month = ko.observable();
        self.year = ko.observable();

        self.selectedCat = ko.observable();
        self.selectedType = ko.observable();

        /**
         *  URL configuration for the service end point
         */

        self.getUrl = function () {
            let url = config.url + 'db/events/details/appliance/gantt?&month=' + self.month() + '&year=' + self.year() + '&fromDate=' + self.frmdate() + '&toDate=' + self.todate() + '&locId=OMR&category=' + self.selectedCat() + '&type=' + self.selectedType();
            return url;
        };

        /**
         *  Fetches data from serials service endpoint
         * @returns {undefined}
         */
        self.loadGanttData = function () {
            console.log(self.getUrl());
            self.ready(false);
            self.applData.removeAll();
            self.applTasks.removeAll();
            jsonData.fetchData(self.getUrl()).
                    then(function (result) {
                        result.sort(function (left, right) {
                            return left.label === right.label ? 0 : (left.label < right.label ? -1 : 1);
                        });
                        result.forEach(function (item) {
                            self.applTasks.push({name: item.label, events: item.tasks.length});
                        });
                        self.applData(result);
                        self.ready(true);
                        $('#eventscroll').slimScroll({
                            color: '#A9A9A9',
                            size: '10px',
                            height: '300px',
                            alwaysVisible: true
                        });
                    });
        };

        self.catTypeUrl = config.url + 'appliance/lkp/hiearchy/?locId=OMR';
        self.categoryArray = ko.observableArray();
        self.typeArray = [];
        self.catTypeArray = ko.observableArray();
        /**
         *  Fetches category and type lookup data
         * @returns {undefined}
         */
        function loadCategoryTypeData() {
            console.log(self.catTypeUrl);
            jsonData.fetchData(self.catTypeUrl).
                    then(function (result) {
                        result.forEach(function (catitem) {
                            self.categoryArray.push({value: catitem.category, label: catitem.category});
                            let tempArr = [];
                            catitem.typeArr.forEach(function (item) {
                                tempArr.push({value: item.type, label: item.type});
                            });
                            self.typeArray[catitem.category] = tempArr;
                        });

                        self.selectedCat(self.categoryArray()[0].value);
                        self.catTypeArray(self.typeArray[self.selectedCat()]);
                        self.selectedType(self.typeArray[self.selectedCat()][0].value);
                        self.loadGanttData();
                    });
        }

        loadCategoryTypeData();

        self.catselect = function (event)
        {
            self.catTypeArray([]);
            self.catTypeArray(self.typeArray[self.selectedCat()]);
            self.selectedType(self.typeArray[self.selectedCat()][0].value);
        };

        self.optionChange = function (event, ui) {
            if (ui.option === "rawValue") {
                self.todate(new Date(self.date()).getDate());
                self.frmdate(moment(new Date(self.date())).subtract(1, 'days').date());
                self.month(new Date(self.date()).getMonth() + 1);
                self.year(new Date(self.date()).getFullYear());
                self.currentDate = new Date(self.date());
                self.projectEndDate = self.currentDate;
                self.projectStartDate = new Date(moment(new Date(self.date())).subtract(1, 'days'));
            }
        };

        self.loadData = function () {
            self.loadGanttData();
        };

    }

    return applGanttContentViewModel;
});
