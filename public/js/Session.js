'use strict';
/********************************
 *  GAME SESSION CLASS
 ********************************/

var SessionState = {
	INIT: 'init',
	READY_FOR_SHOT: 'shoot',
    TRIGGER_DOWN: 'tiggerPressed',
	MISSLE_IN_THE_AIR: 'flying',
	GAME_OVER: 'targetHit'
};

var Session = function(session) {
	this.state = SessionState.INIT;
	this.victoriousPlayer = null;
	var playerA, playerB, activePlayer, finished, bulletData, remote;

	console.log('Init: ' + this.state);

	function createNewGame() {
		console.log('Slot A is free');
		playerA = {
			name: 'A',
			x: 0.1,
			y: 0.9,
			angle: 0,
			id: 'id_A',
            color: 0x00ff00
		};

		console.log('Slot B is free');
		playerB = {
			name: 'B',
			x: 0.9,
			y: 0.9,
			angle: -Math.PI,
			id: 'id_B',
            color: 0xff0000
		}

		activePlayer = playerA;
	};

	if (typeof session !== 'undefined') {
		this.playerA = session.playerA;
		this.playerB = session.playerB;
		this.finished = session.finished;
		this.activePlayer = session.activePlayer;
		this.state = session.state;
		this.bulletData = session.bulletData;
		this.victoriousPlayer = session.victoriousPlayer;
		this.remote = session.remote;
	} else {
		createNewGame();
		this.playerA = playerA;
		this.playerB = playerB;
		this.finished = finished;
		this.activePlayer = activePlayer;
		this.bulletData = bulletData;
        this.remote = remote;
	}

	this.createState = function(event) {
		return {
			event: event,
			playerA: this.playerA,
			playerB: this.playerB,
			activePlayer: this.activePlayer,
			bulletData: this.bulletData,
			state: this.state,
			victoriousPlayer: this.victoriousPlayer,
			remote: remote
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

	    for (var i = 0; i < players.length; i++) {
	    	var player = players[i];
	        if (player.id == id) {
	            return player;
	        }
	    }

	    return null;
	}


	this.statusText = function() {
		if (this.state === SessionState.INIT) {
			return 'Waiting to start!';
		} else if (this.state === SessionState.READY_FOR_SHOT) {
            return this.activePlayer.name + ' shoot!';
        } else if (this.state === SessionState.TRIGGER_DOWN) {
            return this.activePlayer.name + ' release trigger to shoot!';
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

    this.isReadyForShot = function() {
        return this.state === SessionState.READY_FOR_SHOT;
    };

    this.isTriggerDown = function() {
        return this.state === SessionState.TRIGGER_DOWN;
    };

	this.isReadyForPlayer = function(player) {
		var readyForPlayerLocal = this.isReady() && (this.isReadyForShot() || this.isTriggerDown());
        
        if (this.remote) {
            return readyForPlayerLocal && this.activePlayer.id == player.id;
        } else {
            return readyForPlayerLocal;
        }
	};

	this.shootBullet = function(bulletData) {
		if (this.state != SessionState.TRIGGER_DOWN) {
			return this.createState('status');
		}

        this.state = SessionState.MISSLE_IN_THE_AIR;
		this.bulletData = bulletData;

		return this.createState('firedShot');
	};

	this.hitPlayer = function(destroyedPlayer) {
		if (destroyedPlayer.id === this.playerA.id) {
			this.victoriousPlayer = this.playerB;
		} else if (destroyedPlayer.id === this.playerB.id) {
			this.victoriousPlayer = this.playerA;
		} else {
			this.victoriousPlayer = {name: 'no one'};
		}

		this.finished = true;
		this.state = SessionState.GAME_OVER;

		return this.createState('gameover')
	};

	this.hitNothing = function() {
		if (this.activePlayer.id == this.playerA.id) {
			this.activePlayer = this.playerB;
		} else {
			this.activePlayer = this.playerA;
		}

		this.bulletData = null;
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
