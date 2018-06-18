var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(200, 'API')
});
router.use('/xdk', require('./api/xdk'));

module.exports = router;
