var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs=require('fs'),
    users = [];
//specify the html we will use
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/www'));
//var connect = require("connect");
app.use(express.cookieParser());
app.use(express.session({
	secret: 'www.ssforum.top', 
	cookie: { domain:'www.ssforum.com'},	
	//store:sessionStore,
	//key:''
	}));
app.get('/',function(req,res){
 console.log(req.cookies);
var sessionid=req.cookies['connect.sid'];
 var id=sessionid.replace(/[&\|\\\\/*!$()^%$#,@\:;.-]/g,"");
var user=JSON.parse(fs.readFileSync('/root/Code/sessions/'+id+'.json'));
console.log(user);
res.render('index',{user:user});
});
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);
//handle the socket
io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
