'use strict';
var express = require('express'),
    routes  = require('./routes'),
    http    = require('http'),
    fs      = require('fs'),
    bodyParser = require('body-parser'),
    morgan  = require('morgan'),
    argv = require('minimist')(process.argv.slice(2)),
    swagger = require("swagger-node-express");

var app     = express(),
    subpath = express();


// Configuration
// try {
//     var configJSON = fs.readFileSync(__dirname + "/config.json");
//     var config = JSON.parse(configJSON.toString());
// } catch(e) {
//     console.error("File config.json not found or is invalid: " + e.message);
//     process.exit(1);
// }
// routes.init(config);

var port = process.env.PORT || 5000;
app.set('port', port);
app.use(morgan('dev'));
app.use(bodyParser());
app.use(bodyParser.json());

// swagger setup
app.use('/v1', subpath);
swagger.setAppHandler(subpath);
app.use(express.static('swagger'));
swagger.setApiInfo({
    title: "Practical Interview API",
    description: "Production quality API to do CRUDL on users dataset",
    termsOfServiceUrl: "",
    contact: "mjogrodniczak@gmail.com",
    license: "",
    licenseUrl: ""
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/swagger/index.html');
});

swagger.configureSwaggerPaths('', 'api-docs', '');

// Configure the API domain
var domain = 'localhost';
if (argv.domain !== undefined) {
    domain = argv.domain;
} else {
    console.log('No --domain=xxx specified, taking default hostname "localhost".')
}
var applicationUrl = 'http://' + domain + ':' + port;
console.log('snapJob API running on ' + applicationUrl);
swagger.configure(applicationUrl, '1.0.0');


routes.init();
app.get ('/'                     , routes.index);
app.post('/api/createUser'       , routes.create_user);
app.get ('/api/getUserByEmail'   , routes.get_user_by);
app.get ('/api/getUserByUsername', routes.get_user_by);
app.get ('/api/getUserByPps'     , routes.get_user_by);
app.get ('/api/resetData'        , routes.populate);


http.createServer(app).listen(port, function () {
    console.log("Express server listening on port " + port);
});

// expose app
exports = module.exports = app;