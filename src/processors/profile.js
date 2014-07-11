var qs = require('querystring');

//该函数用于模拟开发者的用户资料功能,查询单个用户的资料
//输入参数用户id
function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        req.finish = true;
        var postBody = qs.parse(body);
        if (postBody.id == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        getProfile(postBody.id,db,res);
    });
}

function getProfile(id,db,res){
    db.get("select id,username,portrait from user where id = ?",id,function(err,row){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof row == "undefined"){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(row);
        }else{
            var responseString = JSON.stringify(row);
            res.writeHead(200,{'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
            res.end(responseString);
        }
    })
}

exports.process = process;
