var db = require(__base + 'db')
var express = require('express');
var router = express.Router();
var alarms = require(__base + 'config/alarms');

router.get('/', function (req, res) {

    var filter = {};

    var project = { _id: 0, token: 0 };
    var fromTs = req.query.fromTs || new Date().getTime() - 86400000; // Default 24 Hours ago
    var toTs = req.query.toTs || new Date().getTime();

    if (req.query.deviceId) {
        filter.deviceId = req.query.deviceId;
    }

    filter.ts = { $gte: parseInt(fromTs), $lte: parseInt(toTs) };

    console.log(filter);

    db(function (conn) {
        conn.collection('alarms')
            .find(filter)
            .project(project)
            .limit(300)
            .toArray(function (err, docs) {
                docs.map(function (doc) {
                    doc.descr = alarms[doc.alarmId] || 'Unknown Alarm';
                })
                res.json(docs);
            });
    })

});



module.exports = router;