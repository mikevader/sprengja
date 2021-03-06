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
var Session = require('./public/js/Session').Session;
var Player = require('./Player').Player;
var Level = require('./public/js/level').Level;

/********************************
 * GAME VARIABLES
 ********************************/
var app, connection, session, players;
var waitingPlayer;
var gameSessions;
var sessionCounter;


/********************************
 * GAME INITIALISATION
 ********************************/
function init() {
	//sessions = [];
	session = new Session();
	players = [];
	gameSessions = null;
	waitingPlayer = null;
	sessionCounter = 0;
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


function createNewSession(room, playerA, playerB) {
	// gameSessions.push({roomId: room,
	// 					playerA: playerA,
	// 					playerB: playerB});
};

function onPlayerJoinGame(socket, game) {
	util.log('name: ' + game.name + '; session: ' + game.session);

	var newPlayer = new Player(socket.id);
	var roomId;

	// Add new player to the players array
	players.push(newPlayer);

	if (waitingPlayer === null) {
		waitingPlayer = newPlayer;
		roomId = 'Room_' + ++sessionCounter;
		socket.join(roomId)
		//socket.to(roomId).emit('joined game', {room: roomId, playerId: socket.id});
		util.log('created new session in room: ' + roomId);
        socket.to(roomId).emit('showMessage', "Welcome " + game.name + "!<br /><br />We're just waiting for another player...<br />Your room id is " + roomId);
	} else {
		createNewSession(roomId, waitingPlayer, newPlayer);
		roomId = 'Room_' + sessionCounter;
		socket.join(roomId)
		util.log('joined waiting player in room: ' + roomId);

		session.playerA.id = newPlayer.id;
		session.playerB.id = waitingPlayer.id;
		waitingPlayer = null;
        
        var level = createLevel(1280,960);
        console.log('level:   '+level);
        
        socket.to(roomId).emit('load level',level);
        socket.to(roomId).broadcast.emit('load level',level);

		socket.to(roomId).emit('game ready', session);
		socket.to(roomId).broadcast.emit('game ready', session);
	}
	socket.room = roomId;
};

    function createLevel(width,height){
        var level = new Level();
        var terrainContour =terrain(width,height,height/7,0.62);
        level.setLevelData(terrainContour);
        level.setRange(0,height);
        return level; 
    };
    
    function terrain(width, height, displace, roughness) {
        var points = [],
        // Gives us a power of 2 based on our width
        power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));
        

        // Set the initial left point
        points[0] = (height - height / 6) + (Math.random() * displace * 2) - displace;
        // set the initial right point
        points[power] = (height - height / 6) + (Math.random() * displace * 2) - displace;
        console.log(power);
        displace *= roughness;

        // Increase the number of segments
        for (var i = 1; i < power; i *= 2) {
            // Iterate through each segment calculating the center point
            for (var j = (power / i) / 2; j < power; j += power / i) {
                points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2);
                points[j] += (Math.random() * displace * 2) - displace
            }
            // reduce our random range
            displace *= roughness;
        }
        return points;
    };

function onSocketConnection (socket) {
	util.log('New player has connected: ' + socket.id);

	socket.on('disconnect', onClientDisconnect);
	socket.on('join game', function(game) {onPlayerJoinGame(socket, game)});
	socket.on('shootBullet', onShootBullet);
    socket.on('rotateGun', onGunRotation);
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
	util.log('Player shot with parameters: ' + data);
	this.broadcast.emit('shootBullet', data);
    this.emit('shootBullet', data);
};

function onGunRotation(angle) {
    this.broadcast.emit('rotateGun', angle);
    this.emit('rotateGun', angle);
}

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



