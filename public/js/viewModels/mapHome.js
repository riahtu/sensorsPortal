/**
 * mapHome module
 */
define(['ojs/ojcore', 'knockout', 'gmap'
], function (oj, ko) {
    /**
     * The view model for the main content view template
     */
    function mapHomeContentViewModel() {
        var self = this;

        self.map;
        self.ready = ko.observable(true);

        self.getCenter = function () {
            var HMIL = {lat: 12.9165, lng: 79.1325};
            var MSIL = {lat: 21.1458, lng: 79.0882};
            var BLR = {lat: 12.9716, lng: 77.5946}
            return BLR
        };

        self.zoomLevel = function () {
            return 10;
        };

        self.mapProp = {
            center: self.getCenter(),
            zoom: self.zoomLevel()
        };

        var marker;





        self.mapReady = ko.observable(false);

        self.refresh = function () {
            self.mapProp = {
                center: self.getCenter(),
                zoom: self.zoomLevel()
            };
            self.map = new google.maps.Map(document.getElementById("locationMap"), self.mapProp);
        };

        $(document).ready(function () {
            self.map = new google.maps.Map(document.getElementById("locationMap"), self.mapProp);
            marker = new google.maps.Marker({
                position: {lat: -25.363, lng: 131.044},
                map: self.map,
                title: 'My Shipment'
            });

        });

        var autoDriveSteps = new Array();
        var speedFactor = 100; // 10x faster animated drive

        function setAnimatedRoute(origin, destination, map) {
            // init routing services
            var directionsService = new google.maps.DirectionsService;
            var directionsRenderer = new google.maps.DirectionsRenderer({
                map: map
            });

            //calculate route
            directionsService.route({
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING
            },
                    function (response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            // display the route
                            directionsRenderer.setDirections(response);

                            // calculate positions for the animation steps
                            // the result is an array of LatLng, stored in autoDriveSteps
                            autoDriveSteps = new Array();
                            var remainingSeconds = 0;
                            var leg = response.routes[0].legs[0]; // supporting single route, single legs currently
                            leg.steps.forEach(function (step) {
                                var stepSeconds = step.duration.value;
                                var nextStopSeconds = speedFactor - remainingSeconds;
                                while (nextStopSeconds <= stepSeconds) {
                                    var nextStopLatLng = getPointBetween(step.start_location, step.end_location, nextStopSeconds / stepSeconds);
                                    autoDriveSteps.push(nextStopLatLng);
                                    nextStopSeconds += speedFactor;
                                }
                                remainingSeconds = stepSeconds + speedFactor - nextStopSeconds;
                            });
                            if (remainingSeconds > 0) {
                                autoDriveSteps.push(leg.end_location);
                            }

                            var flightPath = new google.maps.Polyline({
                                path: autoDriveSteps,
                                geodesic: true,
                                strokeColor: '#FF0000',
                                strokeOpacity: 1.0,
                                strokeWeight: 2
                            });

                            flightPath.setMap(self.map);


                            startRouteAnimation(marker);
                        } else {
                            window.alert('Directions request failed due to ' + status);
                        }
                    });
        }

// helper method to calculate a point between A and B at some ratio
        function getPointBetween(a, b, ratio) {
            return new google.maps.LatLng(a.lat() + (b.lat() - a.lat()) * ratio, a.lng() + (b.lng() - a.lng()) * ratio);
        }

// start the route simulation   
        function startRouteAnimation(marker) {
            var autoDriveTimer = setInterval(function () {
                // stop the timer if the route is finished
                if (autoDriveSteps.length === 0) {
                    clearInterval(autoDriveTimer);
                } else {
                    // move marker to the next position (always the first in the array)
                    marker.setPosition(autoDriveSteps[0]);

                    if (autoDriveSteps[0]) {



                    }

                    // remove the processed position
                    autoDriveSteps.shift();
                }
            },
                    500);
        }

        setAnimatedRoute("Electronic City, Bangalore", "Bosch,Koramangala", self.map);

    }

    return mapHomeContentViewModel;
});