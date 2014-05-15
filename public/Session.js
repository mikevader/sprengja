/********************************
 *  GAME SESSION CLASS
 ********************************/

var GameState = {
	INIT : 'init',
	READY_FOR_SHOT : 'shoot',
	MISSLE_IN_THE_AIR : 'flying',
	GAME_OVER : 'targetHit'
};

var Session = function() {
	var playerA = null, playerB = null, finished = false, activePlayer = null;
	var state = GameState;
	var fireAtAngle = 0;
	var victoriousPlayer = null;

	function createState(event) {
		return {
			event: event,
			playerA: playerA,
			playerB: playerB,
			activePlayer: activePlayer,
			fireAtAngle: fireAtAngle,
			state: state,
			victoriousPlayer: victoriousPlayer
		};
	}

	function init() {
		return createState('init');
	}

	this.isReady = function() {
		return this.playerA != null && this.playerB != null;
	};

	this.shootBullet = function(angle) {
		if (this.state != GameState.READY_FOR_SHOT) {
			console.log('tryed to shoot in the wrong state!!!! current state: ' + this.state);

			return createState('status');
		}

		fireAtAngle = angle;

		return createState('firedShot');
	};

	this.hitPlayer = function(destroyedPlayer) {
		if (destroyedPlayer == playerA) {
			victoriousPlayer = playerB;
		} else {
			victoriousPlayer = playerA;
		}

		finished = true;
		state = GameState.GAME_OVER;

		return createState('gameover')
	};

	this.hitNothing = function() {
		if (activePlayer == playerA) {
			activePlayer = playerB;
		} else {
			activePlayer = playerA;
		}

		state = GameState.READY_FOR_SHOT;

		return createState('nextPlayer')
	};

	this.status = function() {
		return createState('status');
	};

	init();
};

// To use insie node.js with require:
if (typeof exports !== undefined) {
	exports.Session = Session;
}
