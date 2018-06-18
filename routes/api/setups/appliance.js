var DB = require(__base + 'db1')
var express = require('express');
var router = express.Router();
var appliance = require(__base + 'config/appliance');
var device = require(__base + 'config/device');

router.get('/lkp/hiearchy', async function (req, res) {

    let locId = req.query.locId;

    try {

        let db = await DB.Get();
        let responseObj = [];

        let match = { locId: locId };
        let groupAppl = { _id: { category: "$category", type: "$type" }, applArr: { $push: { applId: "$applId", name: "$name" } } };
        let groupType = { _id: { category: "$_id.category" }, typeArr: { $push: { type: "$_id.type", applArr: "$applArr" } } };
        let finalProject = { _id: 0, category: "$_id.category", typeArr: "$typeArr" };
        let sort = { category: 1, type: 1, name: 1 };
        //  console.log(filter);

        let applCursor = db.collection("appliances").aggregate([
            { "$match": match },
            { "$sort": sort },
            { "$group": groupAppl },
            { "$group": groupType },
            { "$project": finalProject }
        ])

        for (let doc = await applCursor.next(); doc != null; doc = await applCursor.next()) {
            responseObj.push(doc);
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})


router.get('/lkp', async function (req, res) {

    let category = req.query.category;
    let type = req.query.type;
    let applId = req.query.applId;
    let locId = req.query.locId;

    try {

        let db = await DB.Get();
        let responseObj = [];

        let match = { locId: locId };

        if (category) {
            match.category = category
        }

        if (type) {
            match.type = type
        }

        if (applId) {
            match.applId = applId
        }

        let finalProject = { _id: 0, applId: 1, name: 1 };
        let sort = { applId: 1, name: 1 };
        //  console.log(filter);

        let applCursor = db.collection("appliances").aggregate([
            { "$match": match },
            { "$sort": sort },
            { "$project": finalProject }
        ])

        for (let doc = await applCursor.next(); doc != null; doc = await applCursor.next()) {
            responseObj.push(doc);
        }

        res.json(responseObj);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }

})




module.exports = router;