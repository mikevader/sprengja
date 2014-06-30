'use strict';
/********************************
 *  GAME SESSION CLASS
 ********************************/

var SessionState = {
	INIT: 'init',
	READY_FOR_SHOT: 'shoot',
	MISSLE_IN_THE_AIR: 'flying',
	GAME_OVER: 'targetHit'
};

var Session = function(session) {
	this.state = SessionState.INIT;
	this.victoriousPlayer = null;
	var playerA, playerB, activePlayer, finished, fireAtAngle;

	console.log('Init: ' + this.state);

	function createNewGame() {
		console.log('Slot A is free');
		playerA = {
			name: 'A',
			x: 0.1,
			y: 0.1,
			angle: 0,
			id: 'id_A'
		};

		console.log('Slot B is free');
		playerB = {
			name: 'B',
			x: 0.9,
			y: 0.1,
			angle: -Math.PI,
			id: 'id_B'
		}

		activePlayer = playerA;
	};

	if (typeof session !== 'undefined') {
		this.playerA = session.playerA;
		this.playerB = session.playerB;
		this.finished = session.finished;
		this.activePlayer = session.activePlayer;
		this.state = session.state;
		this.fireAtAngle = session.fireAtAngle;
		this.victoriousPlayer = session.victoriousPlayer;
	} else {
		createNewGame();
		this.playerA = playerA;
		this.playerB = playerB;
		this.finished = finished;
		this.activePlayer = activePlayer;
		this.fireAtAngle = fireAtAngle;
	}

	this.createState = function(event) {
		return {
			event: event,
			playerA: this.playerA,
			playerB: this.playerB,
			activePlayer: this.activePlayer,
			fireAtAngle: this.fireAtAngle,
			state: this.state,
			victoriousPlayer: this.victoriousPlayer
		};
	}

	this.init = function() {
		console.log('Init Session');
		this.state = SessionState.READY_FOR_SHOT;
		return this.createState('init');
	}

	this.resetPlayerIds = function() {
		var players = [this.playerA, this.playerB];

	    for (var i = 0; i < players.length; i++) {
	    	var player = players[i];
	    	player.id = null;
	    }
	}

	this.playerById = function(id) {
		var players = [this.playerA, this.playerB];
	    console.log('find player by id: ' + id);

	    for (var i = 0; i < players.length; i++) {
	    	var player = players[i];
	        console.log('player with index ' + i + ' has id: ' + player.id)
	        if (players[i].id == id) {
	        	console.log('found player: ' + players[i]);
	            return players[i];
	        }
	    }

	    return null;
	}


	this.statusText = function() {
		if (this.state === SessionState.INIT) {
			return 'Waiting to start!';
		} else if (this.state === SessionState.READY_FOR_SHOT) {
			return this.activePlayer.name + ' shoot!';
		} else if (this.state === SessionState.MISSLE_IN_THE_AIR) {
			return this.activePlayer.name + ' fired. Waiting for impact';
		} else if (this.state === SessionState.GAME_OVER) {
			return 'Target destroyed. ' + this.victoriousPlayer.name + ' wins!';
		} else {
			return 'INVALID STATE';
		}
	};

	this.isReady = function() {
		return this.playerA != null && this.playerB != null;
	};

	this.isReadyForPlayer = function() {
		return this.isReady() && this.state === SessionState.READY_FOR_SHOT;
	}

	this.shootBullet = function(angle) {
		if (this.state != SessionState.READY_FOR_SHOT) {
			console.log('tryed to shoot in the wrong state!!!! current state: ' + this.state);

			return this.createState('status');
		}
		this.state = SessionState.MISSLE_IN_THE_AIR;

		this.fireAtAngle = angle;

		return this.createState('firedShot');
	};

	this.hitPlayer = function(destroyedPlayer) {
		console.log('current player: ' + this.activePlayer.name);
		console.log('destroyed player: ' + destroyedPlayer.name);

		if (destroyedPlayer === this.playerA) {
			this.victoriousPlayer = this.playerB;
		} else if (destroyedPlayer === this.playerB) {
			this.victoriousPlayer = this.playerA;
		} else {
			this.victoriousPlayer = {name: 'no one'};
		}

		this.finished = true;
		this.state = SessionState.GAME_OVER;

		return this.createState('gameover')
	};

	this.hitNothing = function() {
		if (this.activePlayer == this.playerA) {
			this.activePlayer = this.playerB;
		} else {
			this.activePlayer = this.playerA;
		}

		this.fireAtAngle = null;

		this.state = SessionState.READY_FOR_SHOT;

		return this.createState('nextPlayer')
	};

	this.status = function() {
		return this.createState('status');
	};
};

// To use insie node.js with require:
if (typeof exports !== 'undefined') {
	exports.Session = Session;
}
