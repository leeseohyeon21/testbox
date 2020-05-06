var express = require('express');
var router = express.Router();
var db_con = require('../db/db_con')();
var connection = db_con.init();
var bcrypt = require('bcrypt');


// /api/v1/login
router.post('/login', function(req, res, next){
    var
        userId = req.body.username,
        password = req.body.password;
    
    console.log(userId, password);
    console.log(bcrypt.hashSync(password, 10));

    connection.query('SELECT * FROM user WHERE userId = (?)', userId, function(err, result){
        if (err){
            console.log('err :' + err);
        }else{
            console.log(result);
            if (result.length === 0){
                res.json({success: false, msg: '해당 유저가 존재하지 않습니다'})
            }else{
                if (!bcrypt.compareSync(password, result[0].password)){
                    res.json({success: false, msg: '비밀번호가 일치하지 않습니다'});
                }else{
                    res.json({success: true});
                }
            }
        }
    });
});

module.exports = router;