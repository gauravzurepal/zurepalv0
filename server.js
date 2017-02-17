/**
 * Created by root on 2/16/17.
 */
var path = require('path');
var fs = require('fs');
var express = require('express');
var parseurl = require('parseurl');
var session = require('express-session');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

var config = require('./public/config/config');

// Server part
var app = express();
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(favicon('./public/assets/img/fav/favicon.ico'));

app.use(session({
    secret: 'gaurav zure pal',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var server = app.listen(80);
console.log('Server listening on port 80');

// Socket.IO part
var io = require('socket.io')(server);

var redis = require('redis');

var redisClient = redis.createClient(config.redisPort, config.redisHost);

redisClient.auth(config.redisPassword, function (err) { if (err) logger.info("redis connection error"); });

var sendComments = function (socket) {
    fs.readFile('_comments.json', 'utf8', function(err, comments) {
        comments = JSON.parse(comments);
        socket.emit('comments', comments);
    });
};

io.on('connection', function (socket) {
    console.log('New client connected!');

    socket.on('fetchComments', function () {
        sendComments(socket);
    });

    socket.on('newComment', function (comment, callback) {
        fs.readFile('_comments.json', 'utf8', function(err, comments) {
            comments = JSON.parse(comments);
            comments.push(comment);
            fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function (err) {
                io.emit('comments', comments);
                callback(err);
            });
        });
    });
});

app.post('/zure/hello', function (req, res) {
    res.send('Got a POST request')
});

app.post('/zure/start', function (req, res) {
    console.log("request coming here", req.body.comment);

    /***
     * Store the name in redis
     */
    try{
        redisClient.set(req.session.id, {name:req.body.comment}, redis.print);
    }catch (err){
        logger.info("unable to add socket id mapping with redis store");
    }

    res.send('Sending... '+req.body.comment);

});