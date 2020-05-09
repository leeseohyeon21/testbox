var express = require('express');
var router = express.Router();

var login = require('./login');
var logout = require('./logout');
var join = require('./join');
var myInfo = require('./myInfo');

router.use('/login', login);
router.use('/logout', logout);
router.use('/join', join);
router.use('/myInfo', myInfo);

module.exports = router;