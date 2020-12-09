const express = require('express');
const app = express();

app.listen(8080, function(){
    console.log('listening on 8080')
});


app.get('/', function(request,response){
    



    response.sendFile(__dirname + '/index.html');
});

app.get('/url', function(request,response){


    var old_url="wwwnnavercomsfjasfksdfkljaslfjlesjlfkjsdalkjflkajsfljasfl";
    var new_url=encoding_62(old_url);

    response.send(new_url);
});

function encoding_62(origin){
    
    var n = origin.length;
    if (n === 0) {
        return '0';
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = ''; 
    while (n > 0) {
        result = digits[n % digits.length] + result;
        n = parseInt(n / digits.length, 10);
    }
    
    return result;
    

  
    
}