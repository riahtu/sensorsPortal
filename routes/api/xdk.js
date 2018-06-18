var express = require('express');
var router = express.Router();


router.post('/', function (req, res) {
    var io = req.app.get('socketio');
    io.emit('message',req.body);
    console.log(req.body);
    res.json({ result: "Done" });
}
)


module.exports = router;