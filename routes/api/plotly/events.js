var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var device = require(__base + 'config/device');


router.get('/', async function (req, res) {

    let month = req.query.month;
    let year = req.query.year;
    let applId = req.query.applId;
    // let days = req.query.days;

    try {

        let db = await DB.Get();
        let responseObj = {};

        let filter = {"dateObj.month": parseInt(month), "dateObj.year": parseInt(year), applId: applId};
        let sort = {"dateObj.date": 1, hh: 1};
        let group = {_id: {date: "$dateObj.date"}, events: {$push: {hh: "$hh", cycles: "$cycles", onTime: "$onTime"}}};
        let project = {_id: 0, date: "$_id.date", events: 1};
        let sort2 = {date: 1};

        console.log(filter);

        let teCursor = db.collection("eventshh").aggregate([
            {"$match": filter},
            {"$sort": sort},
            {"$group": group},
            {"$project": project},
            {"$sort": sort2}
        ]);

        let x = [];
        let y = [];
        let z1 = [];
        let z2 = [];

        let j = 0;
        for (j = 0; j < 24; j++) {
            y.push(j);
        }

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {

            x.push(teDoc.date);
            let yObj1 = []
            let yObj2 = []

            let i = 0;
            for (i = 0; i < 24; i++) {
                yObj1.push(0);
                yObj2.push(0);
            }

            teDoc.events.forEach(function (row) {
                yObj1[row.hh - 1] = row.cycles;
                yObj2[row.hh - 1] = Math.round((row.onTime / 1000 / 60 / 60) * 1000) / 1000;
            });

            z1.push(yObj1);
            z2.push(yObj2);
        }

        responseObj.x = x;
        responseObj.y = y;
        responseObj.z1 = z1;
        responseObj.z2 = z2;


        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

module.exports = router;