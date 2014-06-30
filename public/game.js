'use strict';

var GameState = function(game) {
};

// Load images and sounds
GameState.prototype.preload = function() {
    this.game.load.image('cloud', '/assets/gfx/ball.png');
    this.game.load.image('bullet', '/assets/gfx/bullet.png');
    this.game.load.image('ground', '/assets/gfx/ground.png');
    this.game.load.spritesheet('explosion', '/assets/gfx/explosion.png', 128, 128);
    this.game.load.spritesheet('cyclops', '/assets/gfx/monster.png', 32, 32);
};

// Setup the example
GameState.prototype.create = function() {
    this.debug = {
        showTrajectory: false
    };

    // Set stage background color
    this.game.stage.backgroundColor = 0x4488cc;

    // Define constants
    this.SHOT_DELAY = 300; // milliseconds (10 bullets/3 seconds)
    this.BULLET_SPEED = 800; // pixels/second
    this.NUMBER_OF_BULLETS = 20;
    this.GRAVITY = 980; // pixels/second/second

    // Create an object pool of bullets
    this.bulletPool = this.game.add.group();
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, 'bullet');
        this.bulletPool.add(bullet);

        // Set its pivot point to the center of the bullet
        bullet.anchor.setTo(0.5, 0.5);

        // Enable physics on the bullet
        this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

        // Set its initial state to "dead".
        bullet.kill();

        bullet.events.onKilled.add(function(bullet1) {
            this.getExplosion(bullet1.x, bullet1.y);
        }, this);
    }

    // Turn on gravity
    game.physics.arcade.gravity.y = this.GRAVITY;

    // Let's make some clouds
    for(var x = -56; x < this.game.width; x += 80) {
        var cloud = this.game.add.image(x, -80, 'cloud');
        cloud.scale.setTo(5, 5); // Make the clouds big
        cloud.tint = 0xcccccc; // Make the clouds dark
        cloud.smoothed = false; // Keeps the sprite pixelated
    }

    // Create some ground
    this.ground = this.game.add.group();
    for(var x = 0; x < this.game.width; x += 32) {
        // Add the ground blocks, enable physics on each, make them immovable
        var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'ground');
        this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
        groundBlock.body.immovable = true;
        groundBlock.body.allowGravity = false;
        this.ground.add(groundBlock);
    }

    // Create a group for explosions
    this.explosionGroup = this.game.add.group();

    // Setup a canvas to draw the trajectory on the screen
    this.bitmap = this.game.add.bitmapData(this.game.width, this.game.height);
    this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
    this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
    this.game.add.image(0, 0, this.bitmap);

    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width/2;
    this.game.input.activePointer.y = this.game.height/2 - 100;

    // Show FPS
    this.game.time.advancedTiming = true;
    this.fpsText = this.game.add.text(
        20, 20, '', { font: '16px Arial', fill: '#ffffff' }
    );
};

GameState.prototype.initRemoteGame = function(session) {
    console.log('Start remote game');
    var host = location.origin.replace(/^http/, 'ws');
    this.socket = io.connect(host, {transports: ['websocket']})
    this.setEventHandlers();
};

GameState.prototype.initGame = function(session) {
    if (this.initialized) {
        console.log('game already initialized');
        return;
    }

    if (typeof session === 'undefined') {
        console.log('init game local');
        this.session = new Session(session);
        console.log(this.session);
        this.player = this.session.playerA;
        this.otherPlayer = this.session.playerB;
    } else {
        console.log('init game remote');
        this.player = this.session.playerById([this.session.playerA, this.session.playerB], this.socket.sessionid);
        this.otherPlayer = (this.session.playerA == this.player) ? this.session.playerB : this.session.playerA;
    }

    console.log('Player: ' + this.player.name + ' with stats: x: ' + this.player.x + ', y: ' + this.player.y+ ', angle: ' + this.player.angle + ', id: ' + this.player.id);
    console.log('Other player: ' + this.otherPlayer.name + ' with stats: x: ' + this.otherPlayer.x + ', y: ' + this.otherPlayer.y+ ', angle: ' + this.otherPlayer.angle + ', id: ' + this.otherPlayer.id);

    // Create an object representing our myGun
    this.myGun = createGun(this, this.player, 0x00ff00);


    // Create an object representing our otherGun
    this.otherGun = createGun(this, this.otherPlayer, 0xff0000);

    this.session.init();
    this.initialized = true;
};

function createGun(gameState, player, color) {
    var gun = gameState.game.add.sprite(player.x, player.y, 'bullet');
    // Set the pivot point to the center of the myGun
    gun.anchor.setTo(0.5, 0.5);
    gun.tint = color;
    gun.rotation = player.angle;
    gun.events.onKilled.add(function(myGun) {
        gameState.getExplosion(myGun.x, myGun.y, myGun);
    }, game);

    gameState.game.physics.enable(gun, Phaser.Physics.ARCADE);
    gun.body.immovable = true;
    gun.body.allowGravity = false;

    return gun;
}



GameState.prototype.setEventHandlers = function() {
    this.socket.on('connect', onSocketConnected);
    this.socket.on('disconnect', onSocketDisconnect);
    this.socket.on('shootBullet', onShootBullet);
    this.socket.on('joined game', onJoinedGame);
    this.socket.on('game ready', onGameReady);
};

function onGameReady (session) {
    console.log('game is ready')
    var gameState = game.state.getCurrentState();

    console.log(session);

    gameState.initGame(session);
}

function onJoinedGame(playerStats) {
    console.log('joined game as player ' + playerStats.name);
    console.log('--- with stats: x: ' + playerStats.x + ', y: ' + playerStats.y+ ', angle: ' + playerStats.angle);
    var gameState = game.state.getCurrentState();

    gameState.player = playerStats;
}

function onKilledPlayer(session) {
    console.log('Killed player ' + playerStats.name);

    var gameState = game.state.getCurrentState();

}

function onSocketConnected () {
    console.log('Connected to socket server');
}

function onSocketDisconnect () {
    console.log('Disconnected from socket server');
}

function onShootBullet (session) {
    console.log('Player shot with angle: ' + session.fireAtAngle);
    var gameState = game.state.getCurrentState();

    gameState.shootBullet(session);
}


GameState.prototype.drawTrajectory = function() {
    // Clear the bitmap
    this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);

    // Set fill style to white
    this.bitmap.context.fillStyle = 'rgba(255, 255, 255, 0.5)';

    // Calculate a time offset. This offset is used to alter the starting
    // time of the draw loop so that the dots are offset a little bit each
    // frame. It gives the trajectory a "marching ants" style animation.
    var MARCH_SPEED = 40; // Smaller is faster
    this.timeOffset = this.timeOffset + 1 || 0;
    this.timeOffset = this.timeOffset % MARCH_SPEED;

    // Just a variable to make the trajectory match the actual track a little better.
    // The mismatch is probably due to rounding or the physics engine making approximations.
    var correctionFactor = 0.99;

    // Draw the trajectory
    // http://en.wikipedia.org/wiki/Trajectory_of_a_projectile#Angle_required_to_hit_coordinate_.28x.2Cy.29

    var currentGun = this.getCurrentGun();

    var theta = -currentGun.rotation;
    var x = 0, y = 0;
    for(var t = 0 + this.timeOffset/(1000*MARCH_SPEED/60); t < 3; t += 0.03) {
        x = this.BULLET_SPEED * t * Math.cos(theta) * correctionFactor;
        y = this.BULLET_SPEED * t * Math.sin(theta) * correctionFactor - 0.5 * this.GRAVITY * t * t;
        this.bitmap.context.fillRect(x + currentGun.x, currentGun.y - y, 3, 3);
        if (y < -15) break;
    }

    this.bitmap.dirty = true;
};

GameState.prototype.pullTrigger = function() {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    var currentGun = this.getCurrentGun();

    var bulletData = {x: currentGun.x, y: currentGun.y, angle: currentGun.rotation, speed: this.BULLET_SPEED};

    var shootState = this.session.shootBullet(bulletData);
    this.socket.emit('shootBullet', shootState);
    this.shootBullet(shootState);
}

GameState.prototype.shootBullet = function(session) {
    var x = null;
    var y = null;
    var angle = this.session.fireAtAngle.angle;
    var speed = this.BULLET_SPEED;

    if (this.player.id == this.session.activePlayer.id) {
        x = this.myGun.x;
        y = this.myGun.y;
    } else {
        x = this.otherGun.x;
        y = this.otherGun.y;
    }

    console.log('current player: ' + this.session.activePlayer.id);
    console.log('this.player: ' + this.player.id);
    console.log('gun {x: ' + x + ', y: ' + y + ', angle: ' + angle + ', speed: ' + speed + '}')


    // Get a dead bullet from the pool
    var bullet = this.bulletPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the myGun position.
    bullet.reset(x, y);
    bullet.rotation = angle;

    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * speed;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * speed;
};

// The update() method is called every frame
GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        var hudText = this.game.time.fps + ' FPS' + ( (this.session) ? '   State: ' + this.session.statusText() : '');

        this.fpsText.setText(hudText);
    }

    // Draw the trajectory every frame
    if (this.initialized && this.debug.showTrajectory) {
        this.drawTrajectory();
    }

    this.game.physics.arcade.collide(this.monster, this.ground);


    this.game.physics.arcade.collide(this.bulletPool, this.myGun, function(gun, bullet) {
        gun.damage(10);
        bullet.kill();
        this.session.hitPlayer(this.player);
    }, null, this);
    this.game.physics.arcade.collide(this.bulletPool, this.otherGun, function(gun, bullet) {
        gun.damage(10);
        bullet.kill();
        this.session.hitPlayer(this.otherPlayer);
    }, null, this);

    // Check if bullet have collided with the monster
    this.game.physics.arcade.collide(this.bulletPool, this.monster, function(monster, bullet) {
        // Kill the monster
        bullet.kill();
        monster.damage(10);
        this.session.hitNothing();
    }, null, this);

    // Check if bullets have collided with the ground
    this.game.physics.arcade.collide(this.bulletPool, this.ground, function(bullet, ground) {
        // Kill the bullet
        this.session.hitNothing();
        bullet.kill();
    }, null, this);

    // Rotate all living bullets to match their trajectory
    this.bulletPool.forEachAlive(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);

    if (this.initialized) {

        if (this.session.isReadyForPlayer()) {

            var currentGun = this.getCurrentGun();

            // Aim the myGun at the pointer.
            // All this function does is calculate the angle using
            // Math.atan2(yPointer-ymyGun, xPointer-xmyGun)
            currentGun.rotation = this.game.physics.arcade.angleToPointer(currentGun);

            // Shoot a bullet
            if (this.game.input.activePointer.isDown) {
                this.pullTrigger();
            }
        }
    }
};

GameState.prototype.getCurrentGun = function() {
    if (this.session.activePlayer === this.player) {
        return this.myGun;
    } else if (this.session.activePlayer === this.otherPlayer) {
        return this.otherGun;
    } else {
        return null;
    }
};

// Try to get a used explosion from the explosionGroup.
// If an explosion isn't available, create a new one and add it to the group.
// Setup new explosions so that they animate and kill themselves when the
// animation is complete.
GameState.prototype.getExplosion = function(x, y, monster) {
    // Get the first dead explosion from the explosionGroup
    var explosion = this.explosionGroup.getFirstDead();

    // If there aren't any available, create a new one
    if (explosion === null) {
        explosion = game.add.sprite(0, 0, 'explosion');
        explosion.anchor.setTo(0.5, 0.5);

        // Add an animation for the explosion that kills the sprite when the
        // animation is complete
        var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
        animation.killOnComplete = true;

        // Add the explosion sprite to the group
        this.explosionGroup.add(explosion);
    }

    console.log('the monster is ' + (monster != null));

    if (monster != null) {
        explosion.tint = 0xff0000;
    } else {
        explosion.tint = 0xffffff;
    }


    // Revive the explosion (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    explosion.revive();

    // Move the explosion to the given coordinates
    explosion.x = x;
    explosion.y = y;

    // Set rotation of the explosion at random for a little variety
    explosion.angle = game.rnd.integerInRange(0, 360);

    // Play the animation
    explosion.animations.play('boom');

    // Return the explosion itself in case we want to do anything else with it
    return explosion;
};

var game = new Phaser.Game(848, 450, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);

function register(elm, func) {
    var eventType = ('ontouchstart' in window) ? 'touchstart' : 'click';
    elm.addEventListener(eventType, func, true);
};

function startLocalGame() {
    console.log('Start local game');
    game.state.getCurrentState().initialized = false;
    game.state.getCurrentState().session = null;
    game.state.getCurrentState().initGame();
}

function startRemoteGame() {
    game.state.getCurrentState().initialized = false;
    game.state.getCurrentState().session = null;
    game.state.getCurrentState().initRemoteGame();
}

register(document.getElementById('newgamebutton'), startLocalGame);
register(document.getElementById('newRemoteGame'), startRemoteGame);

