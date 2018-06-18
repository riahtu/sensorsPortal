var db = require(__base + 'db')
var express = require('express');
var router = express.Router();
var devices = require(__base + 'config/tempAppl');

router.get('/', function (req, res) {

    var filter = {};

    var project = { _id: 0, rssi: 0, humidity: 0, deqP: 0 };
    var sort = { ts: -1 }

    var fromTs = req.query.fromTs || new Date().getTime() - 86400000; // Default 24 Hours ago
    var toTs = req.query.toTs || new Date().getTime();

    if (req.query.applId) {
        filter.device = req.query.applId;
    }


    if (req.query.since) {
        filter.ts = { $gte: parseInt(req.query.since), $lte: parseInt(toTs) };
    } else {
        filter.ts = { $gte: parseInt(fromTs), $lte: parseInt(toTs) };
    }

    console.log(filter);

    db(function (conn) {
        conn.collection('temp')
            .find(filter)
            .project(project)
            .sort(sort)
            .limit(300)
            .toArray(function (err, docs) {
                docs.map(function (doc) {
                    doc.devDesc = devices[doc.device] || 'Unknown Device'
                })
                res.json(docs);
            });
    })

});



module.exports = router;