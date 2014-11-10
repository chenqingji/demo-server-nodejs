var qs = require('querystring');

//璇ユ柟娉曢渶瑕佽緭鍏ュ弬鏁癱ookie(鏉ヨ嚜login鐨勮繑鍥炲€?锛岃繑鍥炲ソ鍙嬪垪琛ㄣ€傝繖涓柟娉曟槸鐢ㄤ簬妯℃嫙寮€鍙戣€呰嚜宸辨湇鍔″櫒鐨勫ソ鍙嬪垪琛ㄥ姛鑳?
function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        req.finish = true;
        var postBody = qs.parse(body);
        //浣跨敤cookie閴存潈
        if (postBody.cookie == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        getFriends(postBody.cookie,db,res);
    });
}

//浠庢暟鎹簱璇诲彇濂藉弸鍒楄〃銆傚師鏈皢鑷繁鍘绘帀浜嗭紝涓轰簡鏂逛究娴嬭瘯锛屽皢鑷繁涔熼€夊嚭浜?
function getFriends(email,db,res){
    //db.all
    db.query("select id,username,portrait from user"/* where email <> ?",email*/,function(err,rows,fields){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof rows == "undefined"){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(rows);
        }else{
            var responseString = JSON.stringify(rows);
            res.writeHead(200,{'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
            res.end(responseString);
        }
    })
}

exports.process = process;
