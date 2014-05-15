/********************************
 *  GAME PLAYER CLASS
 ********************************/

var Player = function(startId) {
	var id = startId, x = 0, y = 0, visitor = true, angle = 0, name = '';

	return {
		x: x,
		y: y,
		angle: angle,
		visitor: visitor,
		id: id
	}
};

exports.Player = Player;
