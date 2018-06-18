var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var request = require("request-promise");

router.get('/details/appliance', async function (req, res) {

    let month = parseInt(req.query.month) - 1;
    let year = parseInt(req.query.year);
    let date = parseInt(req.query.date);
    let toDate = parseInt(req.query.toDate);

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

        let filter = { ts: { $gte: start, $lte: end } };
        filter.applId = applId;


        let project = { _id: 0, ts: 1, applId: 1, toState: 1, tsDiff: { $divide: [{ $subtract: ["$ts", "$prevTs"] }, 1000] } };
        let sort = { ts: 1 };
        let group = { _id: applId, items: { $push: { x: "$ts", y: "$toState", tsDiff: "$tsDiff" } } };
        let postProject = { _id: 0, applId: "$_id", items: 1 };

        let onTime = 0;
        let onCycle = 0;

        let teCursor = db.collection("events").aggregate([
            { "$match": filter },
            { "$project": project },
            { "$sort": sort },
            { "$group": group },
            { "$project": postProject }
        ])

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {
            teDoc.items.forEach(function (item) {
                item.tsDiff = Math.round(item.tsDiff * 100) / 100;
                if (item.y == 0) {
                    onTime = onTime + item.tsDiff;
                    onCycle = onCycle + 1
                }
            })
            teDoc.onTime = Math.round(onTime * 100) / 100;
            teDoc.onCycle = onCycle;
            responseObj.events = teDoc;
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


router.get('/summary/appliance', async function (req, res) {

    let month = parseInt(req.query.month);
    let year = parseInt(req.query.year);
    let date = parseInt(req.query.date);

    let limit = req.query.limit || 31;

    let locId = req.query.locId;
    let applId = req.query.applId;


    let applArray = [];
    let applObj = {};

    try {

        let db = await DB.Get();
        let responseObj = [];

        // let start = new Date(year, month, date).getTime() - 19800000; //Offset for UTC
        // let end = start + 86400000; //24Hour Window;

        let filter = { "dateObj.year": year, "dateObj.month": month };
        filter.applId = applId;


        let project = { _id: 0, date: "$dateObj.date", applId: 1, cycles: 1, onTime: 1 };
        let group = { _id: { applId: "$applId", date: "$date" }, cycles: { $sum: "$cycles" }, onTime: { $sum: "$onTime" } }
        let postProject = { _id: 0, applId: "$_id.applId", date: "$_id.date", cycles: 1, onTime: 1 };
        let sort = { date: 1 };



        console.log(filter);
        let teCursor = db.collection("eventshh").aggregate([
            { "$match": filter },
            { "$project": project },
            { "$group": group },
            { "$project": postProject },
            { "$sort": sort }
        ])

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {
            teDoc.onTime = Math.round(teDoc.onTime * 100 / 60000) / 100;
            responseObj.push(teDoc);
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


async function getApplianceByCategoryType(locId, category, type) {
    var options = {
        uri: "http://localhost:3020/api/appliance/lkp",
        method: "GET",
        qs: {  // Query string like ?key=value&...
            locId: locId,
            category: category,
            type: type
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

router.get('/details/appliance/gantt', async function (req, res) {

    let month = parseInt(req.query.month) - 1;
    let year = parseInt(req.query.year);
    let fromDate = parseInt(req.query.fromDate);
    let toDate = parseInt(req.query.toDate);

    let limit = req.query.limit || 31;

    let category = req.query.category;
    let type = req.query.type;
    let locId = req.query.locId;
    let applId = req.query.applId;

    let applArray = [];
    let applObj = {};

    var applLkp = await getApplianceByCategoryType(locId, category, type)
    console.log("Appliance Lookedup")
    //  console.log(applLkp)



    applLkp.forEach(function (appl) {
        applArray.push(appl.applId);
        applObj[appl.applId] = appl.name;
    })

    try {
        let db = await DB.Get();
        let responseObj = [];

        // console.log(new Date(year, month, date).getTime());

        let start = new Date(year, month, fromDate).getTime() - 19800000; //Offset for UTC
        let end = new Date(year, month, fromDate).getTime() - 19800000 + 86400000;
        //   let end = start + 86400000; //24Hour Window;

        let filter = { fromTs: { $gte: start, $lte: end } };
        console.log(filter);

        if (applArray) {
            filter["applId"] = { "$in": applArray };
        }

        let sort = { fromTs: 1 };
        let group = { _id: "$applId", tasks: { $push: { start: "$fromTs", end: "$toTs", label: "$tsDiff" } } };
        let postProject = { _id: 0, id: "$_id", tasks: 1 };

        let teCursor = db.collection("eventsOn").aggregate([
            { "$match": filter },
            { "$sort": sort },
            { "$group": group },
            { "$project": postProject }
        ])

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {
            teDoc.label = applObj[teDoc.id];
            responseObj.push(teDoc);
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})



module.exports = router;