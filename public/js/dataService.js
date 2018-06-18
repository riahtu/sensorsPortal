'use strict';
define(['jquery'], function ($) {

    var baseUrl = "http://abrl.store-monit.com/api/"
    //    var baseUrl = "/api/"
    let backendHeaders = {
        "Content-Type": 'application/json'
    };

    var baseHeaders = backendHeaders;

    var localUrl = 'demoData/';
    var isOnline = true;

    function getRawEnergyTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `nilm/rawenergy${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }


    function getEventsTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `nilm/events${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getAlarmsTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `nilm/alarms${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getApplEnergyTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `nilm/appenergy${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getTotalEnergyTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `nilm/totenergy${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getTemperatureTable(urlParams) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `cond/temp${urlParams}`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getColdStrData() {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `applDB/all`
            });
        else {
            return $.get(localUrl + 'users.txt');
        }
    }

    function getApplianceTemp(applID,day, month, year) {
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `db/temp/details/appliance?&month=${month}&year=${year}&date=${day}&locId=OMR&applId=${applID}`
            });

    }

    function getApplianceEnergy(applID,day, month, year) {
        console.log('ener applID'+applID);
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `db/aeEnergy/details/appliance?&month=${month}&year=${year}&date=${day}&locId=OMR&applId=${applID}`
            });

    }

    function getApplianceEvents(applID,day, month, year) {
        console.log('event applID'+applID);
        if (isOnline)
            return $.ajax({
                type: 'GET',
                headers: baseHeaders,
                url: baseUrl + `db/events/details/appliance?&month=${month}&year=${year}&date=${day}&locId=OMR&applId=${applID}`
            });

    }


    //    function signIn(userName, password) {
    //
    //        if (isOnline) {
    //            return $.ajax({
    //                type: 'POST',
    //                headers: baseHeaders,
    //                url: baseUrl + `loginUser`,
    //                data: JSON.stringify({userId: userName, password: password})
    //            });
    //        } else {
    //            return $.get(localUrl + 'loginUser' + '.json');
    //        }
    //        return $.when(null);
    //    }

    return {
        getRawEnergyTable: getRawEnergyTable,
        getEventsTable: getEventsTable,
        getAlarmsTable: getAlarmsTable,
        getApplEnergyTable: getApplEnergyTable,
        getTotalEnergyTable: getTotalEnergyTable,
        getTemperatureTable: getTemperatureTable,
        getColdStrData: getColdStrData,

        getApplianceTemp: getApplianceTemp,
        getApplianceEnergy: getApplianceEnergy,
        getApplianceEvents: getApplianceEvents
    };
});
