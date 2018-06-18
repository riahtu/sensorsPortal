var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var tempMap = require(__base + 'config/tempApplMap');

router.get('/', async function (req, res) {

    var filter = {};

    var project = { _id: 0, token: 0, fromTs: 0 };
    var sort = { ts: -1 }

    var fromTs = req.query.fromTs || new Date().getTime() - 86400000; // Default 24 Hours ago
    var toTs = req.query.toTs || new Date().getTime();


    if (req.query.deviceId) {
        filter.deviceId = req.query.deviceId;
    }

    if (req.query.applId) {
        filter.applId = req.query.applId;
    }

    if (req.query.since) {
        filter.toTs = { $gte: parseInt(req.query.since), $lte: parseInt(toTs) };
    } else {
        filter.toTs = { $gte: parseInt(fromTs), $lte: parseInt(toTs) };
    }

    console.log(filter);

    try {

        let db = await DB.Get();
        let responseObj = {};


        //Get the Appliance List
        let filterAppl = { category: "Cold Storage", locId: "OMR" };
        let projectAppl = { _id: 0, locId: 0, deviceId: 0 };
        let sortAppl = { applid: 1, type: 1, zone: 1 }
        let applListCursor = db.collection("appliances").find(filterAppl).project(projectAppl).sort(sortAppl);
        let appllist = [];


        for (let applDoc = await applListCursor.next(); applDoc != null; applDoc = await applListCursor.next()) {
            responseObj[applDoc.applId] = applDoc;
            appllist.push(applDoc.applId);
        }


        // Get the Appliance Energy
        console.log(filter);
        let filterApplList = { applId: { $in: appllist } }
        let groupAE = { _id: "$applId", energy: { $sum: "$appEnergy" } };
        let AEcursor = db.collection('appenergyhh').aggregate(
            [
                { $match: { "dateObj.month": 3, appEnergy: { $gt: 0 } } }, //Filter Time
                { $match: filterApplList }, // Filter Appliances
                { $group: groupAE }
            ]
        );

        for (let aeDoc = await AEcursor.next(); aeDoc != null; aeDoc = await AEcursor.next()) {
            if (responseObj[aeDoc._id]) {
                responseObj[aeDoc._id].energy = aeDoc;
            }

        }


        //Get the Cycles and Average Up Time
        let filterState = { fromState: 1, toState: 0 }
        let projectEv1 = {
            cycles: 1,
            onTime: 1,
            applId: 1,
            _id: 0
        }

        let eventsCursor = db.collection('eventshh').aggregate(
            [
                { $match: { "dateObj.month": 3 } }, //Filter Time
                { $match: filterApplList }, // Filter Appliances
                // { $match: filterState },
                { $project: projectEv1 },
                // { $match: { nonDup: true } }, /*Remove Duplicates */
                { $group: { _id: "$applId", cycles: { $sum: "$cycles" }, onTime: { $sum: "$onTime" }, avgTime: { $avg: "$onTime" } } }
            ]
        );

        for (let evDoc = await eventsCursor.next(); evDoc != null; evDoc = await eventsCursor.next()) {
            if (responseObj[evDoc._id]) {
                responseObj[evDoc._id].event = evDoc;
            }

        }

        //Get the Temperature

        let tempCursor = db.collection('tempavg5').aggregate(
            [
                { $match: { ts: { $gte: parseInt(toTs)-86400000, $lte: parseInt(toTs) } } }, //Filter Time
                { $project: { _id: 0, temp: 1, ts: 1, device: 1 } },
                { $sort: { "ts": -1 } },
                { $group: { _id: "$device", temps: { $push: "$$ROOT" } } },
                { $replaceRoot: { newRoot: { $arrayElemAt: ["$temps", 0] } } }

            ]
        );

        for (let tempDoc = await tempCursor.next(); tempDoc != null; tempDoc = await tempCursor.next()) {

            let tempApplID = tempMap[tempDoc.device];
            tempDoc.temp = Math.round( tempDoc.temp*100)/100
            if (responseObj[tempApplID]) {
                responseObj[tempApplID].temp = tempDoc;
            }
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

function getColdStorageAppl() {

}

module.exports = router;