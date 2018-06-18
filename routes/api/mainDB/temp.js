var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var tempMap = require(__base + 'config/tempApplMap');

var request = require("request-promise");

router.get('/details/appliance', async function (req, res) {

    let month = parseInt(req.query.month) - 1;
    let year = parseInt(req.query.year);
    let date = parseInt(req.query.date);
    let toDate = parseInt(req.query.toDate);

    let fromTs = parseInt(req.query.fromTs);
    let toTs = parseInt(req.query.toTs);


    let limit = req.query.limit || 31;

    let locId = req.query.locId;
    let applId = req.query.applId;


    let applArray = [];
    let applObj = {};

    try {

        let db = await DB.Get();
        let responseObj = {};

        console.log(new Date(year, month, date).getTime());



        let start = new Date(year, month, date).getTime() - 19800000; //Offset for UTC

        let end;

        if (toDate) {
            end = new Date(year, month, toDate).getTime() - 19800000 + 86400000; //24Hour Window;
            console.log(end);
        } else {
            end = start + 86400000; //24Hour Window;
            console.log(end);
        }

        let filter = {}

        if (fromTs && toTs) {
            filter = { ts: { $gte: fromTs, $lte: toTs } };
        } else {
            filter = { ts: { $gte: start, $lte: end } };
        }

	console.log(filter);
        filter.applId = applId;

        let project = { _id: 0, ts: 1, applId: 1, temp: 1 };
        let sort = { ts: 1 };
        let group = { _id: applId, items: { $push: { x: "$ts", y: "$temp" } } };
        let postProject = { _id: 0, applId: "$_id", items: 1 };

        let max = -100;
        let min = 1000;
        let sumTemp = 0;

        let teCursor = db.collection("tempavg5").aggregate([
            { "$match": filter },
            { "$project": project },
            { "$sort": sort },
            { "$group": group },
            { "$project": postProject }
        ])

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {

            teDoc.items.forEach(function (item) {

                //Get the Max Temp
                if (item.y < min) {
                    min = item.y;
                }

                //Get the Min Temo
                if (item.y > max) {
                    max = item.y;
                }

                sumTemp = sumTemp + item.y;

            });

            teDoc.maxTemp = max;
            teDoc.minTemp = min;
            if (teDoc.items.length) {
                teDoc.avgTemp = Math.round((sumTemp / teDoc.items.length) * 100) / 100;
            }


            responseObj.temp = teDoc;
        }



        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


async function getApplianceByCategoryType(locId) {
    var options = {
        uri: "http://localhost:3020/api/appliance/lkp",
        method: "GET",
        qs: {  // Query string like ?key=value&...
            locId: locId,
            category: 'Cold Storage'
        },
        json: true
    }

    try {
        var result = await request(options);
        return result;
    } catch (err) {
        console.error(err);
    }
}



router.get('/latest/appliance', async function (req, res) {

    let locId = req.query.locId;

    let applArray = [];
    let applObj = {};

    var applLkp = await getApplianceByCategoryType(locId)
    console.log("Appliance Lookedup")

    applLkp.forEach(function (appl) {
        applArray.push(appl.applId);
        applObj[appl.applId] = appl.name;
    })

    try {

        let db = await DB.Get();
        let responseObj = [];

        var fromTs = req.query.fromTs || new Date().getTime() - 86400000; // Default 240 Hours ago
        var toTs = req.query.toTs || new Date().getTime();

        let max = -100;
        let min = 1000;

        let tempCursor = db.collection('temp').aggregate(
            [
                { $match: { ts: { $gte: parseInt(fromTs), $lte: parseInt(toTs) } } }, //Filter Time
                { $project: { _id: 0, temp: 1, ts: 1, device: 1 } },
                { $sort: { "ts": -1 } },
                { $group: { _id: "$device", temps: { $push: "$$ROOT" } } },
                { $replaceRoot: { newRoot: { $arrayElemAt: ["$temps", 0] } } }
            ]
        );

        for (let tempDoc = await tempCursor.next(); tempDoc != null; tempDoc = await tempCursor.next()) {
            let tempApplID = tempMap[tempDoc.device];
            let applName = applObj[tempApplID];
            tempDoc.applId = tempApplID;
            tempDoc.name = applName;

            responseObj.push(tempDoc);
        }

        applArray.forEach(function (applId) {
            let found = false;
            responseObj.forEach(function (item) {
                if (applId === item.applId) {
                    found = true;
                }
            })
            if (!found) {
                responseObj.push({
                    applId: applId,
                    name: applObj[applId]
                })
            }
        })

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

module.exports = router;