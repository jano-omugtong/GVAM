/*Main Server of the Saas Team Project*/
require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
//macku
var net = require('net'),
    JsonSocket = require('json-socket');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://192.168.223.65:27017/";
var ObjectID = require('mongodb').ObjectID;
 
//added by dyan0 --socket.io for realtime
var http = require('http').Server(app);
var io = require('socket.io')(http);

//macku
//var server = net.createServer();
var fs = require('fs');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/profile_pictures'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
 
// use JWT auth to secure the api   // edited by dyan0: added '/api/users/emailOn'
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register', '/api/users/emailOn'] }));
 
// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));
app.use('/api/rotations', require('./controllers/api/rotation.controller'));
 
//added by jeremy
app.use('/api/schedule', require('./controllers/api/schedule.controller'));
app.use('/api/fields', require('./controllers/api/fields.controller'));

//added by dyan0
io.on('connection', function(socket){
    
    //for Schedule changes in realtime
    socket.on('scheduleChange', function(){
        io.emit('scheduleChange');
    });
    socket.on('userChange', function(){
        io.emit('userChange');
    });
    socket.on('fieldsChange', function(){
        io.emit('fieldsChange');
    });
    socket.on('rotationChange', function(){
         io.emit('rotationChange');
    });

    //console.log('a user is connected');
    socket.on('disconnect', function(){
        //console.log('a user has disconnected');
    })
});

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});


 
// start server --edited by dyan0 from app.listen to http.listen
var server = http.listen(3000, function () {
    console.log('HTTP PORT listening at ' + server.address().port);
});