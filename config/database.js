var mysql = require('mysql2');
var db_info = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'abcd1234',
    database: 'db_url'
}

module.exports = {
    init: function(){
        return mysql.createConnection(db_info);//mysql db 와 연결
    },
    // 연결 됬을 경우엔
    connect: function(conn){
        conn.connect(function(err){
            if(err) console.error('mysql connection error :' + err);
            else console.log('mysql is connected successfully');
        });
    }
}