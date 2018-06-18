var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var appliance = require(__base + 'config/appliance');
var device = require(__base + 'config/device');
var request = require("request-promise");

router.get('/summary', async function (req, res) {

    let month = req.query.month;
    let year = req.query.year;
    let date = req.query.date;
    let limit = req.query.limit || 31;

    try {

        let db = await DB.Get();
        let responseObj = {};

        let filter = { "dateObj.month": parseInt(month), "dateObj.year": parseInt(year), "appEnergy": { "$gt": 0 } };
        if (date) {
            filter["dateObj.date"] = parseInt(date)
        }

        let group = { _id: { deviceId: "$deviceId", applId: "$applId" }, appEnergy: { $sum: "$appEnergy" } }
        let project = { _id: 0, deviceId: "$_id.deviceId", applId: "$_id.applId", appEnergy: "$appEnergy" }
        let sort = { appEnergy: -1 }

        console.log(filter);

        let teCursor = db.collection("appenergyhh").aggregate([
            { "$match": filter },
            { "$group": group },
            { "$project": project },
            { "$sort": sort },
            { "$limit": parseInt(limit) }

        ])

        let devArray = [];
        let sumEnergy = 0;

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {

            teDoc.appDesc = appliance[teDoc.applId]
            teDoc.devDesc = appliance[teDoc.deviceId]
            teDoc.appEnergy = Math.round(teDoc.appEnergy * 100) / 100;
            sumEnergy = sumEnergy + teDoc.appEnergy;
            devArray.push(teDoc);
        }
        responseObj.sumEnergy = Math.round(sumEnergy * 100) / 100;
        responseObj.devArray = devArray;

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


router.get('/details', async function (req, res) {

    let month = req.query.month;
    let year = req.query.year;
    let date = req.query.date;
    let limit = req.query.limit || 31;

    let category = req.query.category;
    let type = req.query.type;
    let locId = req.query.locId;
    let applId = req.query.applId;

    var applLkp = await getApplianceByCategoryType(locId, category, type)
    console.log("Appliance Lookedup")
    //  console.log(applLkp)

    let applArray = [];
    let applObj = {};

   
	
	if (applId){
		   applArray.push(applId);
		   applObj[applId]='-';
	}else{
		 applLkp.forEach(function (appl) {
        applArray.push(appl.applId);
        applObj[appl.applId] = appl.name;
    })
		
	}
    //  console.log(applObj);

    try {

        let db = await DB.Get();
        let responseObj = {};

        let filter = { "dateObj.month": parseInt(month), "dateObj.year": parseInt(year), "appEnergy": { "$gt": 0 } };
        if (date) {
            filter["dateObj.date"] = parseInt(date)
        }

        if (applArray) {
            filter["applId"] = { "$in": applArray };
        }

        let group = { _id: { deviceId: "$deviceId", applId: "$applId", date: "$dateObj.date", dateTs: "$dateObj.start" }, appEnergy: { $sum: "$appEnergy" } }
        //        let groupArr = { _id: { date: "$_id.date", dateTs: "$_id.dateTs" }, applArray: { $push: { deviceId: "$_id.deviceId", applId: "$_id.applId", appEnergy: "$appEnergy" } } }
        let groupArr = { _id: { date: "$_id.date", dateTs: "$_id.dateTs" }, applArray: { $push: { applId: "$_id.applId", appEnergy: "$appEnergy" } } }
        let project = { _id: 0, date: "$_id.date", dateTs: "$_id.dateTs", applArray: "$applArray" }

        let sort = { date: -1, "applArray.appEnergy": -1 }

        //  console.log(filter);

        let teCursor = db.collection("appenergyhh").aggregate([
            { "$match": filter },
            { "$group": group },
            { "$group": groupArr },
            { "$project": project },
            { "$sort": sort }
        ])

        let dateArray = [];

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {
            teDoc.applArray.forEach(appl => {
                appl.appEnergy = Math.round(appl.appEnergy * 100) / 100;
                appl.appDesc = applObj[appl.applId] || 'Unknown Appliance'
                //   appl.devDesc = device[appl.deviceId] || "Unknown Device"

            });
            dateArray.push(teDoc);
        }

        res.json(dateArray);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


router.get('/details/appliance', async function (req, res) {

    let month = parseInt(req.query.month) - 1;
    let year = parseInt(req.query.year);
    let date = parseInt(req.query.date);

    let limit = req.query.limit || 31;

    let locId = req.query.locId;
    let applId = req.query.applId;
    let toDate = req.query.toDate;


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

       

        let filter = { toTs: { $gte: start, $lte: end } };
        filter.applId = applId;


        let project = { _id: 0, ts: "$toTs", applId: 1, appEnergy: 1 };
        let sort = { ts: 1 };
        let group = { _id: applId, items: { $push: { x: "$ts", y: "$appEnergy" } } };
        let postProject = { _id: 0, applId: "$_id", items: 1 };

        let sumEnergy = 0;

        let teCursor = db.collection("appenergy").aggregate([
            { "$match": filter },
            { "$project": project },
            { "$sort": sort },
            { "$group": group },
            { "$project": postProject }
        ])

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {

            teDoc.items.forEach(function (item) {
                item.y = Math.round(item.y * 100) / 100
                sumEnergy = sumEnergy + item.y;
            })

            teDoc.appEnergy = Math.round(sumEnergy * 100) / 100
            teDoc.count = teDoc.items.length;
            responseObj.energy = teDoc;
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})






module.exports = router;