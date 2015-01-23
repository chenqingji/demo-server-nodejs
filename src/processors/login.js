var qs = require('querystring');

//输入参数email，password。该函数用于登录服务器获取授权
function process(req,res,db){
    var finish = false;
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
    	console.log('Processing login request.');
        var postBody = qs.parse(body);
        if (postBody.email == null || postBody.password == null){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "Missing parameter.".length});
            res.end("Missing parameter.");
            console.log("Missing parameter.");
            return;
        }
        loginUser(postBody.email,postBody.password,db,res,req);
    });
}

//在数据库鉴权，这一步是模拟开发者自己的鉴权行为。通过数据库获取的唯一id和名称注册。
function loginUser(email,password,db,res,req){
   // db.get
   db.query("select * from user where email = ?",email,function(err,rows){
        if (err != null){
            res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': "Server error".length});
            res.end("Server error");
            console.log(err);
        }else if (typeof rows == "undefined"){
            res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "User is not registered.".length});
            res.end("User is not registered.");
            console.log(email + " is not registered.");
        }else{
            var row = null;
            if(rows.length > 0) {
                row = rows[0];
            }
            if (row == null){
            	res.writeHead(403,{'Content-Type': 'text/plain','Content-Length': "User is not registered.".length});
            	res.end("User is not registered.");
            	console.log(email + " is not registered.");
            } else {
            	if (password == row.passwd){
                	getToken(row.id,row.username,row.portrait,row.email,res,req);
            	} else {
                	res.writeHead(401,{'Content-Type': 'text/plain','Content-Length': "Password error!".length});
                	res.end("Password error!");
                	console.log(email + " passwd error!");
            	}
            }
        }
    })
}

var conf = require("../conf.json");

var http = require('http');


//该函数是开发者真正需要在开发中实现的功能。该函数从rong.io换取相应的token用于登录
function getToken(userId,userName,userPortrait,email,res,req) {
	// Build the post string from an object
	var post_data = qs.stringify({
		'userId' : userId,
		'name': userName,
		'portraitUri': userPortrait
	});

	// An object of options to indicate where to post to
	var post_options = {
		host: conf.apiHost,
		port: conf.apiPort,
		path: '/user/getToken.json',
		method: 'POST',
		headers: {
			'appKey': conf.appKey,
			'appSecret': conf.appSecret,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(post_data,'utf8')
		}
	};

	// Set up the request
	var post_req = http.request(post_options, function(response) {
        req.finish = true;
		response.setEncoding('utf8');
        var responseString = '';
        response.on('data',function(chunk){
            responseString += chunk;
        })
		response.on('end', function () {
            responseString.cookie = userId;
            var obj = JSON.parse(responseString);
            obj.cookie = email;
            obj.userName = userName;
            responseString = JSON.stringify(obj);
			res.writeHead(response.statusCode, {'Content-Type': 'text/plain','Content-Length': Buffer.byteLength(responseString,'utf8')});
			res.end(responseString);
		});
	});

	post_req.on('error', function(e) {
        req.finish = true;
		console.log('problem with request: ' + e.message);
		res.writeHead(500,{'Content-Type': 'text/plain','Content-Length': e.message.length});
		res.end(e.message);
	});

	// post the data
	post_req.write(post_data);
	post_req.end();
}

exports.process = process;
