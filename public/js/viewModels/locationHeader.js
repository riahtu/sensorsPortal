/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * locationHeader module
 */
define(['ojs/ojcore', 'knockout', 'data/data', 'config'
], function (oj, ko, jsonData, config) {
    /**
     * The view model for the main content view template
     */
    function locationHeaderContentViewModel() {
        var self = this;
        self.location = ko.observableArray();
        self.currentLocation = ko.observable();
        self.readyLoc = ko.observable(false);
        self.locationArray = ko.observableArray();

        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));

        // Dropdown menu Locations
        self.menuLocSelect = function (event, ui) {
            self.currentLocation(ui.item.attr("title"));
            rootViewModel.currentLocationID(ui.item.attr("id"));
        };

        /*Get Location Info for the Menu*/
        self.loadLocations = function () {



            self.location.push({id: "OMR", title: "OMR Bangalore"});

            self.locationArray.push({value: "OMR", label: "OMR Bangalore"});

            if ("OMR" === rootViewModel.currentLocationID()) {
                self.currentLocation("OMR Bangalore");
            }
 self.readyLoc(true);
//            return new Promise(function (resolve, reject) {
//
//                var locURL = config.url + '/locations';
//
//                jsonData.fetchData(locURL).then(function (locations) {
//                    locations.forEach(function (location) {
//                        self.location.push({id: location.LOC_ID, title: location.AREA});
//                        self.locationArray.push({value: location.LOC_ID, label: location.AREA});
//                        self.readyLoc(true);
//                        if (location.LOC_ID === rootViewModel.currentLocationID()) {
//                            self.currentLocation(location.AREA);
//                        }
//                    });
//                    resolve(true);
//
//                }).fail(function (error) {
//                    console.log(error);
//                    reject(true);
//                });
//            });

        };

        self.loadLocations();
    }

    return locationHeaderContentViewModel;
});
