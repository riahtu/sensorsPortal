var express = require('express'),
app = express(),
MongoClient = require('mongodb').MongoClient,
assert = require('assert');



MongoClient.connect('mongodb://abrl:abrl@13.229.175.200:27017/abrl', function(err, conn) {
    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");
    let db=conn.db('abrl');
   
    
    app.get('/appEnergy', function(req, res){
        var deviceId = {};
        var ts={};
        var applId={};
        var findReq={};
        if (req.query.deviceId)
        {
            console.log(deviceId);
            findReq.deviceId=req.query.deviceId;
            
        }
        if (req.query.applId)
        {
            console.log(applId);
            findReq.applId=req.query.applId;
            
        }
        
        if (req.query.fromTs)
        {
            findReq.fromTs={$gte:parseInt(req.query.fromTs)};
        }
        if (req.query.toTs)
        {
            findReq.toTs={$lte:parseInt(req.query.toTs)};
        }
        console.log(findReq);
        
        db.collection('appenergy').find(findReq).limit(300).toArray(function(err, docs) {
            console.log(docs);
            res.json(docs) ;
        });
    });
    app.get('/events', function(req, res){
        var deviceId = {};
        var ts={};
        var applId={};
        var findReq={};
        if (req.query.deviceId)
        {
            console.log(deviceId);
            findReq.deviceId=req.query.deviceId;
            
        }
        if (req.query.applId)
        {
            console.log(applId);
            findReq.applId=req.query.applId;
            
        }
        
        if (req.query.fromTs && req.query.toTs)
        {
            findReq.ts={$gte:parseInt(req.query.fromTs),$lte:parseInt(req.query.toTs)};
        }
        console.log(findReq);
        
        db.collection('events').find(findReq).limit(300).toArray(function(err, docs) {
            console.log(docs);
            res.json(docs) ;
        });
    });
    app.get('/rawEnergy', function(req, res){
        var deviceId = {};
        var ts={};
        var applId={};
        var findReq={};
        if (req.query.deviceId)
        {
            console.log(deviceId);
            findReq.deviceId=req.query.deviceId;
            
        }
               
        if (req.query.fromTs && req.query.toTs)
        {
            findReq.ts={$gte:parseInt(req.query.fromTs),$lte:parseInt(req.query.toTs)};
        }
        console.log(findReq);
        
        db.collection('rawenergy').find(findReq).limit(300).toArray(function(err, docs) {
            console.log(docs);
            res.json(docs) ;
        });
    });
    app.get('/temp', function(req, res){
        var deviceId = {};
        var ts={};
        var applId={};
        var findReq={};
        if (req.query.deviceId)
        {
            console.log(deviceId);
            findReq.device=req.query.deviceId;
            
        }
               
        if (req.query.fromTs && req.query.toTs)
        {
            findReq.ts={$gte:parseInt(req.query.fromTs),$lte:parseInt(req.query.toTs)};
        }
        console.log(findReq);
        
        db.collection('temp').find(findReq).limit(300).toArray(function(err, docs) {
            console.log(docs);
            res.json(docs) ;
        });
    });
    app.get('/totEnergy', function(req, res){
        var deviceId = {};
        var ts={};
        var applId={};
        var findReq={};
        if (req.query.deviceId)
        {
            console.log(deviceId);
            findReq.deviceId=req.query.deviceId;
            
        }
               
         if (req.query.fromTs)
        {
            findReq.fromTs={$gte:parseInt(req.query.fromTs)};
        }
        if (req.query.toTs)
        {
            findReq.toTs={$lte:parseInt(req.query.toTs)};
        }
        console.log(findReq);
        
        db.collection('totenergy').find(findReq).limit(300).toArray(function(err, docs) {
            console.log(docs);
            res.json(docs) ;
        });
    });
    app.use(function(req, res){
        res.sendStatus(404);
    });
 
    var server = app.listen(3010, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    });
});
