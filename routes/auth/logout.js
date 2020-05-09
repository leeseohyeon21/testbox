var express = require('express');
var router = express.Router();


/* Log out */
router.get('/', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = router;