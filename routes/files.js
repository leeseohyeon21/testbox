var express = require('express');
var router = express.Router();
var db_con = require('../db/db_con')();
var connection = db_con.init();
var fs = require('fs');
var multer = require('multer');
var path = require('path');


var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/images/');
    },
    filename: function(req, file, callback){
        callback(null, file.originalname);
    }
});

var upload = multer({storage: storage});

router.post('/upload', upload.single('image'), function(req, res){
    console.log(req.file);

    connection.query('INSERT INTO file (filename) VALUES (?)', [req.file.originalname], function(){
        res.redirect('.');
    });
});


router.get('/', function(req, res) {
  //var path = __dirname + '/../public/images/';

  var sql = 'SELECT * FROM file ORDER BY date DESC';
  connection.query(sql, function(err, result){
    if (err) throw err;

    res.render('files', { title: 'Upload with multer and store filename into mysql', files: result});
  });
});


router.get('/download/:name', function(req, res){
  var filename = req.params.name;

  var file = __dirname + '/../public/images/' + filename;
  console.log(file);
  res.download(file);
})


router.get('/delete/:name', function(req, res){
  var filename = req.params.name;
  var path = './public/images/'+filename;

  var sql = 'DELETE FROM file WHERE filename = (?)';
  connection.query(sql, [filename], function(err){
    if (err) throw err;
    console.log('file deleted in MySQL');

    fs.unlink(path, function(err){
      if (err) throw err;
      console.log('file deleted in Local');

      res.redirect('/files');
    });
  });
});

module.exports = router;