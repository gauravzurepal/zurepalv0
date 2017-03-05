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
var Promise = require("bluebird");

var util = require('./src/utils');
var cache = require('./src/cache/cache');
var uuidV4 = require('uuid/v4');


// Server part
var app = express();
console.log(__dirname);
app.use(favicon(__dirname + '/public/assets/img/fav/favicon.ico'));

app.use('/', express.static(path.join(__dirname, 'public')));

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

//var redis = require('redis');

//var redisClient = redis.createClient(config.redisPort, config.redisHost);

//redisClient.auth(config.redisPassword, function (err) { if (err) logger.info("redis connection error"); });

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

app.get('/zure/init', function (req, res) {
    res.send({uuid:uuidV4()})
});

app.post('/zure/start', function (req, res) {
    console.log("request coming here %o", req.body.uuid);


    //util.getContent('https://api.wit.ai/message?q='+req.body.comment+'&access_token=K6IGHXBDFHO5VOV74BXSL2GFDV4RP7EU')
    util.getApiAiContent(req.body.comment).then(function(data){
        //console.log("Data received from API.ai ", JSON.stringify(data));

        if(data.result.metadata.intentName == 'welcome_intent'){
            // process the welcome intent
            //console.log("Api Response "+body.result.fullFillMent.speech);
            cache.put(req.body.uuid, {name:req.body.comment});
            res.send(data.result.fulfillment.speech);
        }else {
            /***
             * Store the name in redis
             */
            try{
                var result = cache.get(req.body.uuid);
                console.log("Cache value " + result);
                if(typeof result !== 'undefined' && result !== null){
                    //util.getContent('https://api.wit.ai/message?q='+req.body.comment+'&access_token=K6IGHXBDFHO5VOV74BXSL2GFDV4RP7EU')
                    util.getApiAiContent(req.body.comment).then(function(data){
                        console.log("Data received from API.ai ", data);
                        //console.log("Api Response "+body.result.fullFillMent.speech);
                        res.send(data.result.fulfillment.speech);
                    });
                }else{
                    cache.put(req.body.uuid, {name:req.body.comment});
                    res.send("Nice to meet you again!, I am a bot and have name like you, human calls me Zure. I discuss algorithms and love to help if you have a question for me. You can ask-- Array rotation, stack, remove duplicates..  ");
                }
            }catch (err){
                logger.info("unable to add socket id mapping with redis store");
            }
        }
    });

});

module.exports = app;