// server.js
'use strict';

/********************************
 *  NODE.JS REQUIREMENTS
 ********************************/
var util = require('util');
var express = require('express');
var http = require('http');
var path = require('path');
var io = require('socket.io');


/********************************
 * GAME VARIABLES
 ********************************/
var app, connection, sessions;


/********************************
 * GAME INITIALISATION
 ********************************/
function init() {
	sessions = [];
	var port = Number(process.env.PORT || 5000);

	app = express();
	app.configure(function() {
		app.use(express.static(path.join(__dirname, 'public')));
	});


	var server = http.createServer(app);
	connection = io.listen(server);

	connection.configure(function() {
		connection.set('transports', ['websocket']);
		connection.set('log level', 2);
	});

	server.listen(port, function() {
		console.log('Listen on ' + port);
	});

	setEventHandlers();
};


/********************************
 * GAME EVENT HANDLERS
 ********************************/
var setEventHandlers = function() {
	connection.sockets.on('connection', onSocketConnection);
};

function onSocketConnection (client) {
	util.log('New player has connected: ' + client.id);

	client.on('disconnect', onClientDisconnect);
	client.on('shootBullet', onShootBullet);
};

function onClientDisconnect () {
	util.log('Player has disconnected: ' + this.id);
};

function onShootBullet(data) {
	util.log('Player shot with angle: ' + data);
	this.broadcast.emit('shootBullet', data);
	this.emit('shootBullet', data);
};

/**************************************************
 * RUN THE GAME
 **************************************************/
init();



