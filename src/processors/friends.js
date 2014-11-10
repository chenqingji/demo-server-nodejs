var qs = require('querystring');

//该方法需要输入参数cookie(来自login的返回值)，返回好友列表。这个方法是用于模拟开发者自己服务器的好友列表功能
function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        req.finish = true;
        var postBody = qs.parse(body);
        //使用cookie鉴权
        if (postBody.cookie == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        getFriends(postBody.cookie,db,res);
    });
}

//从数据库读取好友列表。原本将自己去掉了，为了方便测试，将自己也选出了
function getFriends(email,db,res){
    //db.all
    client.query("select id,username,portrait from user"/* where email <> ?",email*/,function(err,rows,fields){
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
