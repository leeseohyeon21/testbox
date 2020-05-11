var express = require('express');
var router = express.Router();

var db_con = require('../../db/db_con')();
var connection = db_con.init();

var path = require('path');
var fs = require('fs');


router.get('/restore/:name', function(req, res){
    var filename = req.params.name;
    var username = req.user.userId;

    var oldpath = path.join('./public/trashcan', username, filename);
    var newpath = path.join('./public/images', username, filename);

    var sql1 = 'DELETE FROM trashcan WHERE trashname = (?) AND userId = (?)';
    var sql2 = 'INSERT INTO file (filename, userId) VALUES (?, ?)';

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
                console.log('file moved in storage');

            res.redirect('/drive/trashcan');
            })
            } 
        })
        }
    })
});


router.get('/delete/:name', function(req, res){
    var trashname = req.params.name;
    var username = req.user.userId;
  
    var dir = path.join('./public/trashcan', username, trashname);
  
    var sql = 'DELETE FROM trashcan WHERE trashname = (?) AND userId = (?)';
    connection.query(sql, [trashname, username], function(err){
      if (err) throw err;
      else{
        console.log('file deleted in MySQL');
  
        fs.unlink(dir, function(err){
          if (err) throw err;
          else{
            console.log('file deleted in trashcan');
      
            res.redirect('/drive/trashcan');
          }
        });   
      }
    });
});

/*
router.get('/delete/all', function(req, res){
    var username = req.user.userId;
  
    var dir = path.join('./public/trashcan', username);
  
    var sql = 'DELETE FROM trashcan WHERE userId = (?)';
    connection.query(sql, username, function(err){
      if (err) throw err;
      else{
        console.log('file deleted all in MySQL');
  
        fs.unlink(dir, function(err){
          if (err) throw err;
          else{
            console.log('file deleted all in trashcan');
      
            res.redirect('/drive/trashcan');
          }
        });   
      }
    });
});
*/


router.get('/', function(req, res){
  var username = req.user.userId;

  var sql = 'SELECT * FROM trashcan WHERE userId = (?) ORDER BY date DESC';
  connection.query(sql, [username], function(err, result){
    if (err) console.log('err :' + err)
    else{
      res.render('drive/trashcan', {title: "My TrashCan", trashes: result});
    }
  })
});


module.exports = router;