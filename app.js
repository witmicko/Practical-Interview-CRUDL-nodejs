'use strict';
var express = require('express'),
    routes  = require('./routes'),
    http    = require('http'),
    fs      = require('fs'),
    bodyParser = require('body-parser'),
    morgan  = require('morgan'),
    argv = require('minimist')(process.argv.slice(2)),
    swagger = require("swagger-node-express"),
    config = require('./config'),
    logger = require("./lib/logger");

var app     = express(),
    subpath = express();

var port = process.env.PORT || 5000;
app.set('port', port);

logger.debug("Overriding 'Express' logger");
app.use(morgan({ "stream": logger.stream }));

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
console.log('swagger ui running on ' + applicationUrl);
logger.info("App started", applicationUrl);
swagger.configure(applicationUrl, '1.0.0');


routes.init();

app.get('/',                routes.index);
app.post('/api/authenticate', routes.authenticate);

app.use(routes.jwt_middleware);
app.get('/api/users/find',  routes.get_user_by);
app.delete('/api/users/:id', routes.delete_user);
app.get('/api/users/:id',   routes.get_user);
app.put('/api/users/:id',   routes.update_user);
app.post('/api/users',      routes.create_user);
app.get('/api/users',       routes.get_all_users);
app.get('/api/reset_data',  routes.populate);



var server = http.createServer(app).listen(port, function () {
    console.log("Express server listening on port " + port);
});

// expose app
exports = module.exports = app;
module.exports = server;