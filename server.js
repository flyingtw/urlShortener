var http = require('http');

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

// 서버 연결
app.listen(8080, function(){
    console.log('listening on 8080')
});


// 화면 띄워주기
app.get('/urlShorten', function(req,res){
    res.sendFile(__dirname + '/views/urlShorten.html');
});


// 버튼 클릭시 post 형식으로 url 보내면 DB에서 조회 후 처리하기
app.post('/ajax',function(req,res){


    var url=req.body.url;
    var responseData ={};
    var basic = "http://localhost:8080/";

    var sql = 'select * from urls where oldURL = "'+url+'";';
    conn.query(sql, function(err,rows, fields){
        if(err)console.log('input query is not executed.\n'+err);
        else {
            console.log("sql = ",sql);
            console.log(rows);
            if(rows.length==0){
                
                // 검색했을때 없음 -> 변환 후, insert 후, 표시
                console.log(url);
                var shortenedURL = encoding_62(url);
                console.log("변환된 url :" +basic+ shortenedURL);

                // DB에 insert 해주고 변환된 url 출력
                sql = 'INSERT INTO urls (oldURL, shortURL, clicked) VALUES("'+url+'", "'+shortenedURL+'", 1);';
                conn.query(sql, function(err,result){
                    if(err) throw err;
                    console.log("새로운 URL 추가됨 : " + url );
                });

                // 변환된 url 반환
                responseData.status="새로 변환됨";
                responseData.url=basic + shortenedURL;
                res.json(responseData);                
            }else{
                
                console.log("이미 변환한것. -> 변환된거 출력")
                console.log(rows[0].shortURL);
                responseData.status="이미 있음";
                responseData.url = basic + rows[0].shortURL;
                res.json(responseData);
            }
        }
    });
});

// 브라우저에서 short URL을 입력하면
// DB에서 검색해서 원래 URL로 redirect
app.get("/:url",function(req,res){
    var shortUrl = req.params.url;
    var sql = 'select oldURL from urls where shortURL = "'+shortUrl+'";';
    conn.query(sql, function(err,rows, fields){
        if(err)console.log('input query is not executed.\n'+err);
        else {
            console.log("sql = ",sql);
            console.log(rows);
            if(rows.length==0){
                console.log("old URL이 없음");
            }else{
                var urlForRedirect = rows[0].oldURL;
                res.redirect(301,urlForRedirect);
            }
        }
    });
})
