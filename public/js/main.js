/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
'use strict';

/**
 * Example of Require.js boostrap javascript
 */

requirejs.config(
        {
            baseUrl: 'js',

            // Path mappings for the logical module names
            // Update the main-release-paths.json for release mode when updating the mappings
            paths:
                    //injector:mainReleasePaths
                            {
                                'knockout': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/knockout/knockout-3.4.2',
                                'jquery': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/jquery/jquery-3.3.1.min',
                                'jqueryui-amd': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/jquery/jqueryui-amd-1.12.1.min',
                                'ojs': 'https://static.oracle.com/cdn/jet/v5.0.0/default/js/min',
                                'ojL10n': 'https://static.oracle.com/cdn/jet/v5.0.0/default/js/ojL10n',
                                'ojtranslations': 'https://static.oracle.com/cdn/jet/v5.0.0/default/js/resources',
                                'text': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/require/text',
                                'promise': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/es6-promise/es6-promise.min',
                                'hammerjs': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/hammer/hammer-2.0.8.min',
                                'signals': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/js-signals/signals.min',
                                'ojdnd': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/dnd-polyfill/dnd-polyfill-1.0.0.min',
                                'css': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/require-css/css.min',
                                'customElements': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/webcomponents/custom-elements.min',
                                'proj4js': 'https://static.oracle.com/cdn/jet/v5.0.0/3rdparty/proj4js/dist/proj4',
                                'bootstrap': 'libs/bootstrap/dist/js/bootstrap.min',
                                'plotly': "https://cdn.plot.ly/plotly-latest.min",
                                'moment': 'libs/moment/moment.min',
                                'lte': 'libs/lte/js/adminlte.min',
                                'slimscroll': 'libs/jQuery-slimScroll-1.3.8/jquery.slimscroll.min',
                                'config': 'appConfig',
                                'lkps': 'data/data',
                                'xlsx-populate': 'libs/xlsx-populate',
                                'daterangepicker': 'libs/bootstrap/dist/js/daterangepicker',
                                "bootstrap-datepicker": 'libs/bootstrap/dist/js/bootstrap-datepicker.min',
                                "botjs": 'https://cdn.botframework.com/botframework-webchat/latest/botchat',
                                'socket': "libs/socket.io-client/dist/socket.io.dev",
                                'canvasjs': "libs/canvasjs.min",
                                'highcharts': "libs/highcharts",
                                'smoothie': 'libs/smoothie/smoothie',
                                'gmap': 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA3P7PPCNhDvpgBwcmaLVZxPlnqoCVSd7M',
                                'knob':'https://cdnjs.cloudflare.com/ajax/libs/jQuery-Knob/1.2.13/jquery.knob.min'
                            }
                    //endinjector
                    ,
                    // Shim configurations for modules that do not expose AMD
                    shim:
                            {
                                'jquery':
                                        {
                                            exports: ['jQuery', '$']
                                        },
                                'bootstrap':
                                        {
                                            deps: ['jquery'],
                                            exports: 'bootstrap'
                                        },

                                'lte':
                                        {
                                            deps: ['jquery'],
                                            exports: 'lte'
                                        },
                                "canvasjs": {
                                    deps: ['jquery'],
                                    exports: 'canvasjs'
                                }, "highcharts": {
                                    deps: ['jquery'],
                                    exports: 'highcharts'
                                },
                                "knob": {
                                    deps: ['jquery'],
                                    exports: 'knob'
                                }


                            }
                }
        );


        require(['ojs/ojcore', 'knockout', 'appController', 'ojs/ojknockout',
            'ojs/ojmodule', 'ojs/ojrouter', 'ojs/ojnavigationlist', 'ojs/ojbutton', 'ojs/ojtoolbar', 'bootstrap', 'lte'],
                function (oj, ko, app) { // this callback gets executed when all required modules are loaded

                    $(function () {

                        function init() {
                            oj.Router.sync().then(
                                    function () {
                                        // Bind your ViewModel for the content of the whole page body.
                                        ko.applyBindings(app, document.getElementById('globalBody'));
                                    },
                                    function (error) {
                                        oj.Logger.error('Error in root start: ' + error.message);
                                    }
                            );
                        }

                        // If running in a hybrid (e.g. Cordova) environment, we need to wait for the deviceready 
                        // event before executing any code that might interact with Cordova APIs or plugins.
                        if ($(document.body).hasClass('oj-hybrid')) {
                            document.addEventListener("deviceready", init);
                        } else {
                            init();
                        }

                    });

                }
        );
