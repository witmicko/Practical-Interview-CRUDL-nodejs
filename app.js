'use strict';
var express = require('express'),
    routes  = require('./routes'),
    http    = require('http'),
    fs      = require('fs'),
    bodyParser = require('body-parser'),
    morgan  = require('morgan');

var app = express();

// Configuration
// try {
//     var configJSON = fs.readFileSync(__dirname + "/config.json");
//     var config = JSON.parse(configJSON.toString());
// } catch(e) {
//     console.error("File config.json not found or is invalid: " + e.message);
//     process.exit(1);
// }
// routes.init(config);


app.set('port', (process.env.PORT || 5000));
app.use(morgan('dev'));
app.use(bodyParser.json());


// app.configure('development', function(){
// 	app.use(express.errorHandler());
// 	app.locals.inspect = require('util').inspect;
// });

routes.init();
app.get('/',            routes.index);
app.post('/createUser',  routes.createUser);
app.get('/resetData',   routes.populate);


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
