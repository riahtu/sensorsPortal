var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Nilm API' });
  res.send(200,'All')
});
  router.use('/all', require('./all'));


  
  module.exports=router