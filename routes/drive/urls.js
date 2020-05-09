var express = require('express');
var router = express.Router();

var files = require('./files');

router.use('/files', files);
router.use('/files/detail', express.static('public/images'));

module.exports = router;