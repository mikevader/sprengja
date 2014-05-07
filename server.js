// server.js
var express = require('express');
var path = require('path');
var app = express();
//var server = require('http').createServer(app);

app.configure(function() {
	app.use(express.static(path.join(__dirname, 'public')));
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
	console.log("Listen on " + port);
});