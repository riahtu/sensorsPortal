/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * overallDB module
 */
define(['ojs/ojcore', 'knockout', 'moment', 'ojs/ojselectcombobox'
], function (oj, ko, moment) {
    /**
     * The view model for the main content view template
     */
    function overallDBContentViewModel() {
        var self = this;
        self.selMonth = ko.observable(moment(new Date()).month() + 1);//month are zero indexed
        self.monthLkp = ko.observableArray([{"value": 1, "label": "January"}, {"value": 2, "label": "February"},
            {"value": 3, "label": "March"}, {"value": 4, "label": "April"}, {"value": 5, "label": "May"}, {"value": 6, "label": "June"},
            {"value": 7, "label": "July"}, {"value": 8, "label": "August"},{"value": 9, "label": "September"}, {"value": 10, "label": "October"},
            {"value": 11, "label": "November"}, {"value": 12, "label": "December"}]);
        
    }

    return overallDBContentViewModel;
});
