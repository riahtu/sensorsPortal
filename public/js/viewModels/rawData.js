/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * rawData module
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojnavigationlist', 'ojs/ojrouter'],
        function (oj, ko, $)
        {
            /**
             * The view model for the main content view template
             */
            function rawDataContentViewModel(params) {
                var self = this;

                var parentRouter = params.ojRouter.parentRouter;
                var routerConfig =
                        {
                            'enerReport': {label: 'Total Energy', value: 'enquiry/enerReport', isDefault: true},
                            'rawEnerRep': {label: 'Raw Energy', value: 'enquiry/rawEnerRep'},
                            'appEnerRep': {label: 'Appliance Energy', value: 'enquiry/appEnerRep'},
                            'tempReport': {label: 'Temperature', value: 'enquiry/tempReport'},
                           'event': {label: 'Events', value: 'enquiry/event'},
                            'alarm': {label: 'Alarms', value: 'enquiry/alarm'}

                        };

                // Create and configure the router
                self.dataRouter = parentRouter.createChildRouter('rawrep').configure(routerConfig);

                // This is the main logic to switch the module based on both router states.
                self.moduleConfig = ko.pureComputed(function ()
                {
                    var moduleConfig = self.dataRouter.moduleConfig;
                    return moduleConfig;
                }, this);

                this.handleActivated = function ()
                {
                    // Now that the router for this view exist, synchronise it with the URL
                    return oj.Router.sync().
                            then(
                                    null,
                                    function (error) {
                                        oj.Logger.error('Error during refresh: ' + error.message);
                                    }
                            );
                };

                this.dispose = function ()
                {
                    // Every router is destroyed on dispose.
                    self.dataRouter.dispose();
                };
            }

            return rawDataContentViewModel;
        });
