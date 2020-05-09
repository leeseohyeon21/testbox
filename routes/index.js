var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var db_con = require('../db/db_con')();
var connection = db_con.init();
db_con.test_open(connection);

var bcrypt = require('bcrypt');

var secret_config = require('../db/secret');

var NaverStrategy = require('passport-naver').Strategy;


// if login success, store user in session
passport.serializeUser(function(user, done){
  done(null, user);
});

// read user in every page accesses
passport.deserializeUser(function(user, done){
  done(null, user);
});

var isAuthenticated = function(req, res, next){
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

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
router.get('/auth/login/naver',
  passport.authenticate('naver')
);
// naver 로그인 연동 콜백
router.get('/auth/login/naver/callback',
  passport.authenticate('naver', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res){
  if (req.user !== undefined){
    res.redirect('/');
  }else{
    res.render('login', {title: 'Login'});
  }
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
  function(req, res){
    res.redirect('/');
  });

router.get('/join', function(req, res){
  if (req.user != undefined){
    res.redirect('/');
  }else{
    res.render('join', {title: 'Join'});
  }
});

var isNew = function(req, res, next){
  connection.query('SELECT * FROM user WHERE userId = (?);', req.body.username, function(err, result){
    if(err){
      console.log('err: '+err)
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

router.post('/join', isNew, function(req, res){
    var userId = req.body.username;
    var nickname = req.body.nickname;
    var password = bcrypt.hashSync(req.body.password, 10);
    var email = req.body.email;
  
    var sql = 'INSERT INTO user VALUES (?)';
    connection.query(sql, [[userId, nickname, password, email]], function(err, result){
      if (err){
        console.log('err :' + err);
        console.log('db error');
        res.redirect('/join');
      } 
      else{
        console.log('회원가입 성공');
        res.redirect('/login');
      }
    })
});

/* Log out */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/myinfo', isAuthenticated, function(req, res){
  res.render('myinfo', {
    title: 'My Info',
    user_info: req.user
  })
});

module.exports = router;
