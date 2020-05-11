var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var db_con = require('../../db/db_con')();
var connection = db_con.init();

var multer = require('multer');
var path = require('path');
var fs = require('fs');


var storage = multer.diskStorage({
  destination: function(req, file, callback){
    var dir = path.join('./public/images', req.user.userId);
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    callback(null, dir);
  },
  filename: function(req, file, callback){
    callback(null, file.originalname);
  }
});

var upload = multer({storage: storage});

router.post('/upload', upload.single('image'), function(req, res){
  console.log(req.file);

  var sql = 'INSERT INTO file (filename, userId) VALUES (?)'
  connection.query(sql, [[req.file.originalname, req.user.userId]], function(){
      res.redirect('/drive/files');
  });
});


router.get('/download/:name', function(req, res){
  var filename = req.params.name;
  var username = req.user.userId;

  var file = path.join('./public/images', username, filename);
  console.log(file);
  res.download(file);
});


var trashcan = multer.diskStorage({
  destination: function(req, file, callback){
    var dir = path.join('./public/trashcan', req.user.userId);
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    callback(null, dir);
  },
  filename: function(req, file, callback){
    callback(null, file.originalname);
  }
});

var trashcan = multer({trashcan: trashcan});

router.get('/delete/:name', function(req, res){
  var filename = req.params.name;
  var username = req.user.userId;

  var oldpath = path.join('./public/images', username, filename);
  var newpath = path.join('./public/trashcan', username, filename);

  var sql1 = 'DELETE FROM file WHERE filename = (?) AND userId = (?)';
  var sql2 = 'INSERT INTO trashcan (trashname, userId) VALUES (?, ?)';

  connection.query(sql1, [filename, username], function(err1){
    if (err1) console.log('err1: ' + err1)
    else{
      console.log('file deleted in MySQL');
      connection.query(sql2, [filename, username], function(err2){
        if (err2) console.log('err2: ' + err2)
        else{  
          !fs.existsSync(newpath + '/../') && fs.mkdirSync(newpath + '/../');
          fs.rename(oldpath, newpath, function(err){
            if (err) throw err;
            console.log('file moved in trashcan');
  
          res.redirect('/drive/files');
          })
        } 
      })
    }
  })
});


router.get('/', function(req, res){
  var username = req.user.userId;

  var sql = 'SELECT * FROM file WHERE userId = (?) ORDER BY date DESC';
  connection.query(sql, [username], function(err, result){
    if (err) console.log('err :' + err)
    else{
      res.render('drive/files', {title: "My Drive", files: result});
    }
  })
});

router.get('/detail/:name', function(req, res){
  var filename = req.params.name;
  var username = req.user.userId;

  var file = path.join('./public/images', username, filename);
  fs.readFile(file, function(err, data){
    res.end(data);
  })
});

module.exports = router;