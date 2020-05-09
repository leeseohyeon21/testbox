var express = require('express');
var router = express.Router();

var db_con = require('../../db/db_con')();
var connection = db_con.init();

var bcrypt = require('bcrypt');


var isNew = function(req, res, next){
    connection.query('SELECT * FROM user WHERE userId = (?);', req.body.username, function(err, result){
      if(err){
        console.log('err: ' + err)
        res.redirect('/join');
      }else{
        if (result.length === 0)
          return next();
        else{
          console.log('이미 사용중인 아이디입니다');
          res.redirect('/join');
        }
      }
    });
};
  
router.post('/', isNew, function(req, res){
    var userId = req.body.username;
    var nickname = req.body.nickname;
    var password = bcrypt.hashSync(req.body.password, 10);
    var email = req.body.email;

    var sql = 'INSERT INTO user VALUES (?)';
    connection.query(sql, [[userId, nickname, password, email]], function(err, result){
    if (err){
        console.log('err :' + err);
        console.log('db error');
        res.redirect('/auth/join');
    } 
    else{
        console.log('회원가입 성공');
        res.redirect('/auth/login');
    }
    })
});

router.get('/', function(req, res){
if (req.user != undefined){
    res.redirect('/');
}else{
    res.render('auth/join', {title: 'Join'});
}
});

module.exports = router;