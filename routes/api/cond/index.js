var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    res.render('index', { title: 'Condition Monitoring API' });
  });

  router.use('/temp', require('./temp'));


  
  module.exports=router