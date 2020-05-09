var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var db_con = require('../../db/db_con')();
var connection = db_con.init();

var bcrypt = require('bcrypt');

var secret_config = require('../../db/secret');

var NaverStrategy = require('passport-naver').Strategy;


/*
var isAuthenticated = function(req, res, next){
  if (req.isAuthenticated())
    return next();
  res.redirect('/auth/login');
};
*/

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, username, password, done){
  connection.query('SELECT * FROM user WHERE userId = (?)', username, function(err, result){
    if (err){
      console.log('err :' + err);
      return done(false, null);
    }else{
      if (result.length === 0){
        console.log('해당 유저가 없습니다');
        return done(false, null);
      }else{
        if (!bcrypt.compareSync(password, result[0].password)){
          console.log('패스워드가 일치하지 않습니다');
          return done(false, null);
        }else{
          console.log('로그인 성공');
          return done(null, {
            userId: result[0].userId,
            nickname: result[0].nickname
          });
        }
      }
    }
  })
}));


/**
 * 1. 중복성 검사
 * 2. 신규 유저
 *  2.1 신규 유저 가입 시키기
 * 3. 올드유저
 *  3.1 바로 로그인 처리
 **/

function loginByThirdparty(info, done){
  console.log('process : ' + info.auth_type);
  var stmt_duplicated = 'SELECT * FROM user WHERE userId = (?)';

  connection.query(stmt_duplicated, info.auth_id, function(err, result){
    if (err){
      return done(err);
    }else{
      if (result.length === 0){
        // TODO 신규 유저 가입 시켜야함
        var stmt_thirdparty_signup = 'INSERT INTO user SET userId = (?), nickname = (?)';
        connection.query(stmt_thirdparty_signup, [info.auth_id, info.auth_name], function(err, result){
          if (err){
            return done(err);
          }else{
            done(null, {
              'userId': info.auth_id,
              'nickname': info.auth_name
            });
          }
        });
      }else{
        // TODO 기존유저 로그인 처리
        console.log('Old User');
        done(null, {
          'userId': result[0].userId,
          'nickname': result[0].nickname
        });
      }
    }
  });
} 

// naver login
passport.use(new NaverStrategy({
  clientID: secret_config.federation.naver.client_id,
  clientSecret: secret_config.federation.naver.secret_id,
  callbackURL: secret_config.federation.naver.callback_url
}, function(accessToken, refreshToken, profile, done){
  var _profile = profile._json;

  console.log('Naver login info');
  console.info(_profile);

  loginByThirdparty({
    'auth_type': 'naver',
    'auth_id': _profile.id,
    'auth_name': _profile.nickname,
    'auth_email': _profile.email
  }, done);
}));

// naver 로그인
router.get('/naver',
  passport.authenticate('naver')
);
// naver 로그인 연동 콜백
router.get('/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/auth/login'
  })
);


router.get('/', function(req, res){
  if (req.user !== undefined){
    res.redirect('/');
  }else{
    res.render('auth/login', {title: 'Login'});
  }
});

router.post('/', passport.authenticate('local', {failureRedirect: '/auth/login', failureFlash: true}),
  function(req, res){
    res.redirect('/');
  });


module.exports = router;
