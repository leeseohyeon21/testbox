var express = require('express');
var router = express.Router();

var db_con = require('../db/db_con')();
var connection = db_con.init();
db_con.test_open(connection);


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'testbox' });
});

module.exports = router;