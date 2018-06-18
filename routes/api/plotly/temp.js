var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var device = require(__base + 'config/device');


router.get('/', async function (req, res) {

    let month = req.query.month;
    let year = req.query.year;
    let applId = req.query.applId;

    try {

        let db = await DB.Get();
        let responseObj = {};

        let filter = { "dateObj.month": parseInt(month), "dateObj.year": parseInt(year), applId: applId };
        let sort = { "dateObj.date": 1, hh: 1 };
        let group = { _id: { date: "$dateObj.date" }, tempArr: { $push: { hh: "$hh", temp: "$maxTemp" } } };
        let project = { _id: 0, date: "$_id.date", tempArr: 1 };
        let sort2 = { date: 1 };

        console.log(filter);

        let teCursor = db.collection("temphh").aggregate([
            { "$match": filter },
            { "$sort": sort },
            { "$group": group },
            { "$project": project },
            { "$sort": sort2 }
        ]);

        let x = [];
        let y = [];
        let z = [];

        let j = 0;
        for (j = 0; j < 24; j++) {
            y.push(j);
        }

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {

            x.push(teDoc.date);
            let yObj = []

            let i = 0;
            for (i = 0; i < 24; i++) {
                yObj.push(0);
            }
            console.log(teDoc)

            if (teDoc.tempArr){
                teDoc.tempArr.forEach(function (row) {
                    yObj[row.hh - 1] = Math.round(row.temp*10)/10;
                });
            }
          

            z.push(yObj);
        }

        //z[0][0] = 3

        responseObj.x = x;
        responseObj.y = y;
        responseObj.z = z;


        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})

module.exports = router;