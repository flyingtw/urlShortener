const express = require('express');
const app = express();

const ejs = require('ejs');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var db_config = require(__dirname + '/config/database.js');
var conn = db_config.init();
db_config.connect(conn);


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


var base62 = require("base62/lib/ascii");




// DB 목록들 보여주기
app.get('/list',function(req,res){
    var sql='select * from urls';
    conn.query(sql, function(err, rows, fields){
        if(err) console.log('query is not executed. select fail...\n' + err);
        else res.render('list',{list : rows});
    });
});


// url 입력받기
app.get('/input', function(req,res){
    
    res.render('input');
});

app.post('/input', function(req,res){
    
    var url=req.body.oldURL;
    var sql = 'select * from urls where oldURL = "'+url+'";';
    conn.query(sql, function(err,rows, fields){
        if(err)console.log('input query is not executed.\n'+err);
        else {
            console.log("sql = ",sql);
            console.log(rows);
            if(rows.length==0){
                var basic = "http://localhost/";
                // 검색했을때 없음 -> 변환 후, insert 후, 표시
                console.log("비어있음 -> 변환하고 저장해야함");
                // 변환하고 
                console.log(url);
                var shortenedURL = encoding_62(url);
                console.log("변환된 url :" +basic+ shortenedURL);
                
                // DB에 insert 해주고 변환된 url 출력
                sql = 'INSERT INTO urls (oldURL, shortURL, clicked) VALUES("'+url+'", "'+shortenedURL+'", 1);';
                conn.query(sql, function(err,result){
                    if(err) throw err;
                    console.log("새로운 URL 추가됨 : " + url );
                });

                
            }else{
                
                console.log("이미 변환한것. -> 변환된거 출력")
                console.log(rows[0].shortURL);
                
            }

            
            
            
            res.redirect('/input');
        }
    });
});

// index 화면
app.get('/', function(request,response){
    response.sendFile(__dirname + '/index.html');
});




function encoding_62(origin){
    
    var result="";

    var n = origin.length;
    var urlASCII = 0;
    for(var i = 0;i<n;i++){
        urlASCII+=origin.charCodeAt(i);
    }
    /*(8자리 맞추고 싶을 경우) 

    if(urlASCII<1000000){
        urlASCII+=1000000;
    }
    */

    var encoded = base62.encode(urlASCII);
    console.log("숫자로 변환한 아스키값 :"+urlASCII);
    console.log("base62로 변환한 아스키값 합 :"+encoded);
  
    
    return encoded;
    

  
    
}


app.listen(8080, function(){
    console.log('listening on 8080')
});