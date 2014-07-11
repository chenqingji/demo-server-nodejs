/**
 * post userName and a fake password to this server to get a token 
 * for login Rong Cloud
 * Created by stirp
 * Date: 2014-05-04
 * Time: 18:01
 */ 

var host = '0.0.0.0';//demoServer服务器监听的ip地址，0.0.0.0表示监听所有网卡
var port = 8080; //demoServerb服务器监听的端口号
var http = require('http');

//解析基本的文件夹未知
var qs = require('querystring');
var path = require('path');
var basedir = path.resolve(__dirname,"..");
var source = path.resolve(__dirname);

//读取路由信息
var routes = require(path.join(source,'route.json'));

//读取配置信息
var conf = require(path.join(source,'conf.json'));

//初始化数据库，用于模拟开发者的数据库信息
var sqlite3 = require('sqlite3').verbose();
var db;
if (conf.sqliteMem){
    db = new sqlite3.Database(":memory:");
}else {
    db = new sqlite3.Database(path.join(basedir,"db",conf.sqlitedb));
}
db.serialize(function() {
    db.run(conf.dbcreatsql);
});

//创建服务器
http.createServer(function (req, res) { 
 	req.finish = false;

    for(var route in routes){
        if (routes[route].path == req.url && routes[route].method == req.method){
            var processor = require(path.join(source,"processors", req.url));

            //设置30秒超时返回值
 			setTimeout(function(){
 				if (!req.finish){
 					req.finish = true;
 					res.writeHead(500,{'Content-Type': 'text/plain','Content-Length':'Server busy.'.length });
 					res.end('Server busy.');
                    console.log(req.url + "timed out.");
                }
 			},30000);
            processor.process(req,res,db);
            return;
        }
    }
    //不合法的请求直接返回
 	res.writeHead(404,{'Content-Type': 'text/plain','Content-Length':'It\'s not a valid request.'.length});
 	res.end('It\'s not a valid request.');
    console.log(req.url + ' is not a valid request.');
    return;
}).listen(port, host); 

console.log("Server running on " + host + ":" + port + " with appId-"+ conf.appKey
 	+ " and appSecret-" + conf.appSecret);

