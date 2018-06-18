/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your application specific code will go here
 */
define(['ojs/ojcore', 'knockout', 'botjs', 'ojs/ojrouter', 'ojs/ojknockout', 'ojs/ojarraytabledatasource',
    'ojs/ojoffcanvas', 'ojs/ojmenu', 'ojs/ojoption', ],
        function (oj, ko, BotChat) {
            function ControllerViewModel() {
                var self = this;
                this.selectedItem = ko.observable("save");

                // Media queries for repsonsive layouts
                var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
                self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
                var mdQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
                self.mdScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

                // Router setup
                self.router = oj.Router.rootInstance;
                self.router.configure({
                  
                    'ti': {label: 'Dashboard', value: 'ti',isDefault: true}
                });
                oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

                self.title = ko.computed(function () {
                    //                    if(self.router.getState(self.router.stateId())){
                    //                    console.log(self.router.getState(self.router.stateId()).label);
                    //                }
                    let state = self.router.getState(self.router.stateId());
                    if (state) {
                        state = state.label;
                    } else {
                        state = 'dashboard';
                    }
                    return state;
                    //                    return  state.charAt(0).toUpperCase() + state.slice(1);;
                });

                // Navigation setup
                var navData = [
            
                    {
                       
                    }
                ];
                self.navDataSource = new oj.ArrayTableDataSource(navData, {idAttribute: 'id'});

                // Drawer
                // Close offcanvas on medium and larger screens
                self.mdScreen.subscribe(function () {
                    oj.OffcanvasUtils.close(self.drawerParams);
                });
                self.drawerParams = {
                    displayMode: 'push',
                    selector: '#navDrawer',
                    content: '#pageContent'
                };
                // Called by navigation drawer toggle button and after selection of nav drawer item
                self.toggleDrawer = function () {
                    return oj.OffcanvasUtils.toggle(self.drawerParams);
                }

                /*New Index.html*/
                self.domain = ko.observable('abrl');

                // Drawer
                // Called by nav drawer option change events so we can close drawer after selection
                self.navChangeHandler = function (event, data) {
                    if (data.option === 'selection' && data.value !== self.router.stateId()) {
                        self.toggleDrawer();
                    }
                }

                self.titleStyle = ko.observable('bosch_title');
                self.titleText = ko.observable('Bosch Sensor Kit');

                self.username = ko.observable("BOSCH");
                self.displayName = ko.observable("BOSCH");
                self.role = ko.observable("Supervisor");
                self.token = ko.observable();
                self.domain = ko.observable('bosch');
                self.currentLocationID = ko.observable('OMR');


                self.applassetID = ko.observable('');


                self.menuItemSelect = function (event, ui) {
                    switch (ui.item.attr("id")) {
                        case "about":
                            $("#aboutDialog").ojDialog("open");
                            break;
                        case "out":
                            window.location.href = 'logout';
                        default:
                    }
                };

                /*End new Index.html*/

                self.togglePinnedNavListButtonSetValue = ko.observableArray();
                self.togglePinnedNavListButtonSetValue.subscribe(function (newValue) {
                    if (newValue.length > 0) {
                        $("#navDrawer").show();
                        app.applyNanoScroll($("#navlistContainer")[0], true);
                    } else {
                        $("#navDrawer").hide();
                    }
                });


                // Add a close listener so we can move focus back to the toggle button when the drawer closes
                $("#navDrawer").on("ojclose", function () {
                    $('#drawerToggleButton').focus();
                });

                // Header
                // Application Name used in Branding Area
                self.appName = ko.observable("Supply Chain");
                // User Info used in Global Navigation area
                self.userLogin = ko.observable("john.hancock@oracle.com");

                self.menuItems = [
                    {id: 'new', label: 'New', disabled: false},
                    {id: 'open', label: 'Open', disabled: false},
                    {id: 'save', label: 'Save', disabled: false},
                    {id: 'saveas', label: 'Save As...', disabled: false},
                    {id: 'print', label: 'Print...', disabled: true}
                ];

                // Footer
                function footerLink(name, id, linkTarget) {
                    this.name = name;
                    this.linkId = id;
                    this.linkTarget = linkTarget;
                }
                self.footerLinks = ko.observableArray([
                    new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
                    new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
                    new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
                    new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
                    new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
                ]);


                self.botChat = function () {
                    // console.log(BotChat)
                    const params = BotChat.queryParams(location.search);

                    const user = {
                        id: params['userid'] || 'userid',
                        name: params['username'] || self.username()
                    };

                    const bot = {
                        id: params['botid'] || 'botid',
                        name: params['botname'] || 'strappy'
                    };

                    window['botchatDebug'] = params['debug'] && params['debug'] === 'true';

                    BotChat.App({
                        bot: bot,
                        locale: params['locale'],
                        //resize: 'detect',
                        // sendTyping: true,    // defaults to false. set to true to send 'typing' activities to bot (and other users) when user is typing
                        user: user,
                        // locale: 'es-es', // override locale to Spanish

                        directLine: {
                            domain: params['domain'],
                            secret: 'yJ37-dzlHKg.cwA.qgc.OjOx1YL0dUbncElB2-PeZ_BiyNDWxWqpGjC3s_LuSLw',
                            token: params['t'],
                            webSocket: params['webSocket'] && params['webSocket'] === 'true' // defaults to true
                        }
                    }, document.getElementById('chatbot'));
                }



                self.checkedState = {};
                self.checkedState['end'] = ko.observableArray([]);
                self.checkedState['bottom'] = ko.observableArray([]);

                self.offcanvasMap = ko.computed(function ()
                {
                    return {
                        "start": {
                            "selector": "#startDrawer",
                            "content": "#mainContent",
                            "modality": "modeless"
                        },
                        "end": {
                            "selector": "#endDrawer",
                            "content": "#mainContent",
                            "modality": "modeless"
                        },
                        "top": {
                            "selector": "#topDrawer",
                            "content": "#mainContent",
                            "modality": "modeless"
                        },
                        "bottom": {
                            "selector": "#bottomDrawer",
                            "content": "#mainContent",
                            "modality": "modeless"
                        }
                    };
                }, self);

                self.toggleButton = function (edge)
                {
                    self.checkedState[edge](self.checkedState[edge]().length ? [] : [edge])
                };

                var logMessage = function (message) {
                    console.log(message);
                };
                self.toggleChat = function (event)
                {


                    var edge = 'end';
                    var drawer = self.offcanvasMap()[edge];
                    drawer.edge = edge;
                    var displayMode = 'overlay';
                    if (displayMode === "none")
                        delete drawer.displayMode;
                    else
                        drawer.displayMode = displayMode;

                    // if it's the active offcanvas, close it
                    if (drawer === self._activeOffcanvas) {
                        return self.closeDrawer(drawer).catch(logMessage);
                    }

                    // if there is no active offcanvas, open it
                    else if (!self._activeOffcanvas) {

                        return self.openDrawer(drawer);
                    }

                    // if there is another open offcanvas, close it first 
                    // and then open this offcanvas
                    else {
                        return self.closeDrawer(self._activeOffcanvas)
                                .then(function () {
                                    // show offcanvas in the viewport
                                    return self.openDrawer(drawer);
                                })
                                .catch(logMessage);
                    }


                }

                // show offcanvas in the viewport
                self.openDrawer = function (drawer) {
                    self.toggleButton(drawer.edge);
                    self._activeOffcanvas = drawer;
                    console.log('Opening')
                    oj.OffcanvasUtils.open(drawer);
                    self.botChat();

                };

                // hide offcanvas from the viewport
                self.closeDrawer = function (drawer) {
                    self.toggleButton(drawer.edge);
                    return oj.OffcanvasUtils.close(drawer);
                };

                //add a close listener so when a offcanvas is autoDismissed we can synchronize the page state.
                $("#startDrawer,#endDrawer,#topDrawer,#bottomDrawer").on("ojclose",
                        function ()
                        {
                            //uncheck the button and clear the active offcanvas
                            if (self._activeOffcanvas)
                                self.checkedState[self._activeOffcanvas.edge]([]);

                            self._activeOffcanvas = null;
                        });

            }

            return new ControllerViewModel();
        }
);
