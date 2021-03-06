var express = require('express');
var router = express.Router();


/*
var isAuthenticated = function(req, res, next){
    if (req.isAuthenticated())
      return next();
    res.redirect('/auth/login');
};
*/

const onlyPublic = function(req, res, next){
  if (!req.user){
    res.redirect('/auth/login');
  }else{
    next();
  }
}

router.get('/', onlyPublic, function(req, res){
  res.render('auth/myinfo', {
    title: 'My Info',
    user_info: req.user
  })
});


module.exports = router;