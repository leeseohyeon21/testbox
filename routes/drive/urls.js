var express = require('express');
var router = express.Router();

var files = require('./files');

router.use(function(req, res, next){
    if(!req.user){
        res.redirect('/auth/login');
    }else{
        next();
    }
});

router.use('/files', files);
//router.use('/files/detail', express.static('public/images'));

module.exports = router;