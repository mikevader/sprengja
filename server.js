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
var Session = require('./public/Session').Session;
var Player = require('./Player').Player;

/********************************
 * GAME VARIABLES
 ********************************/
var app, connection, session, players;


/********************************
 * GAME INITIALISATION
 ********************************/
function init() {
	//sessions = [];
	session = new Session;
	players = [];
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

	var newPlayer = new Player(client.id);

	if (session.playerA === 'undefined' || !session.playerA) {
		util.log('Slot A is free');
		newPlayer.name = 'A';
		newPlayer.x = 100;
		newPlayer.y = 386;
		newPlayer.visitor = false;

		session.playerA = newPlayer;
	} else if (session.playerB === 'undefined' || !session.playerB) {
		util.log('Slot B is free');
		newPlayer.name = 'B';
		newPlayer.x = 748;
		newPlayer.y = 386;
		newPlayer.angle = -Math.PI;
		newPlayer.visitor = false;

		session.playerB = newPlayer;
	} else {
		util.log('No slot is free. Visitor');
		newPlayer.name = 'Visitor';
		newPlayer.visitor = true;
	}

	// Add new player to the players array
	players.push(newPlayer);

	client.emit('joined game', newPlayer);
	util.log('Player ' + newPlayer.name + ' has joined!');

	session.activePlayer = newPlayer;
	util.log('Active player is: ' + session.activePlayer.name);

	//util.log(session.status().playerA.name);

	if (session.isReady()) {
		client.emit('game ready', session);
		client.broadcast.emit('game ready', session);
	};

	client.on('disconnect', onClientDisconnect);
	client.on('shootBullet', onShootBullet);
};

function onClientDisconnect () {
	util.log('Player has disconnected: ' + this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log('Player not found: ' + this.id);
		return;
	}

	if (session.playerA === removePlayer) {
		session.playerA = null;
	} else if (session.playerB === removePlayer) {
		session.playerB = null;
	}

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	this.broadcast.emit('remove player', {id: this.id});
};

function onShootBullet(data) {
	util.log('Player shot with angle: ' + data);
	this.broadcast.emit('shootBullet', data);
};

/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

/**************************************************
 * RUN THE GAME
 **************************************************/
init();



