var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var appliance = require(__base + 'config/appliance');
var device = require(__base + 'config/device');
var request = require("request-promise");

router.get('/', async function (req, res) {

    let fromTs = req.query.fromTs;
    let toTs = req.query.toTs;
    let limit = req.query.limit || 3000;

    let attr = req.query.attr;
    let deviceId = req.query.deviceId;

    try {

        let db = await DB.Get();
        let responseObj = {};

        attra = '$' + attr + 'a';
        attrb = '$' + attr + 'b';
        attrc = '$' + attr + 'c';

        let filter = { ts: { $gte: parseInt(fromTs), $lte: parseInt(toTs) }, deviceId: deviceId };
        let project = { _id: 0, ts: 1 }
        project["r"] = attra;
        project["y"] = attrb;
        project["b"] = attrc;
        let sort = { ts: 1 }



        console.log(filter);
        console.log(project);

        let teCursor = db.collection("rawenergy").aggregate([
            { "$match": filter },
            { "$project": project },
            { "$sort": sort },
            { "$limit": parseInt(limit) }

        ])

       // let devArray = [{ name: "r", items: [] }, { name: "y", items: [] }, { name: "b", items: [] }];
       let devArray = []; 
       let sumEnergy = 0;

        for (let teDoc = await teCursor.next(); teDoc != null; teDoc = await teCursor.next()) {
            // let obj1 = { x: teDoc.ts, y: teDoc.r }
            // let obj2 = { x: teDoc.ts, y: teDoc.y }
            // let obj3 = { x: teDoc.ts, y: teDoc.b }
            // devArray[0].items.push(obj1);
            // devArray[0].items.push(obj2);
            // devArray[0].items.push(obj3);
            devArray.push(teDoc);
        }

        res.json(devArray);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


module.exports = router;