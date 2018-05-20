
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app);
var bodyParser    = require("body-parser");
var path = require('path');
var engines = require('consolidate');

var config = require('./config.js');
var routes = require('./routes/routes.js');

server.listen(config.serverConfig.port, ()=>{
    console.log('server listening at port '+config.serverConfig.port);
});

process.on('uncaughtException', (err)=>{
    console.log("uncaughtException Error: "+err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', engines.mustache);

app.use("/", routes);