'use strict';

var GameState = function() {
};

// Load images and sounds
GameState.prototype.preload = function() {
    Sprengja.Resources.preloadAllImages(game);
};

// Setup the example
GameState.prototype.create = function() {

    game.stage.backgroundColor = Sprengja.Settings.BACKGROUND_COLOR;

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.setImpactEvents(true);

    // Create an object pool of bullets
    this.bulletPool = this.game.add.group();
    for(var i = 0; i < Sprengja.Settings.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, Sprengja.Resources.BULLET);
        // Set its pivot point to the center of the bullet
        bullet.anchor.setTo(0.5, 0.5);
        this.game.physics.p2.enable(bullet, true);
        this.game.physics.p2.enableBody(bullet, true);
        this.bulletPool.add(bullet);


        // Enable physics on the bullet

        // Set its initial state to "dead".
        bullet.kill();

        bullet.events.onKilled.add(function(bullet1) {
            Sprengja.Graphics.showExplosionAt(bullet1.x, bullet1.y);
        }, this);
    }

    // Turn on gravity
    this.game.physics.p2.gravity.y = Sprengja.Settings.GRAVITY;

    // Let's make some clouds
    for(var x = -56; x < this.game.width; x += 80) {
        Sprengja.GraphicsFactory.addCloudAt(x);
    }

    // Create some ground
    this.ground = this.game.add.group();
    for(var x = 0; x < this.game.width; x += 32) {
        // Add the ground blocks, enable physics on each, make them immovable
        var groundBlock = this.game.add.sprite(x, this.game.height - 32, Sprengja.Resources.GROUND);
        this.game.physics.enable(groundBlock, true);
        this.game.physics.p2.enableBody(groundBlock, true);
        groundBlock.body.static = true;
        this.ground.add(groundBlock);
    }

    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width/2;
    this.game.input.activePointer.y = this.game.height/2 - 100;

    // Show FPS
    this.game.time.advancedTiming = true;
    
    Sprengja.Menu.show();
};

GameState.prototype.initRemoteGame = function(session) {
    console.log('Start remote game');
    var host = location.origin.replace(/^http/, 'ws');
    this.socket = io.connect(host, {transports: ['websocket']})
    this.setEventHandlers();
    var session = new Session();
    session.resetPlayerIds();

    this.socket.emit('join game', {name: 'undefined', session: new Session()});
};

GameState.prototype.initGame = function(session) {
    if (this.initialized) {
        console.log('game already initialized');
        return;
    }

    this.coordinateModelX = new CoordinateModel(0, 1);
    this.coordinateModelX.setScreenSize(this.game.width);
    this.coordinateModelY = new CoordinateModel(0, 1);
    this.coordinateModelY.setScreenSize(this.game.height);
    this.coordinateModelY.setDeviceCoordinatesInverted(true);

    if (typeof session === 'undefined') {
        console.log('init game local');
        this.session = new Session(session);
        this.session.remote = false;
        console.log(this.session);
        this.player = this.session.playerA;
        this.otherPlayer = this.session.playerB;
    } else {
        console.log('init game remote');
        this.session = new Session(session);
        this.session.remote = true;
        console.log(this.socket);
        this.player = this.session.playerById(this.socket.socket.sessionid);
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
    var xPosition = gameState.coordinateModelX.worldToScreen(player.x);
    var yPosition = gameState.coordinateModelY.worldToScreen(player.y);

    var gun = gameState.game.add.sprite(xPosition, yPosition, Sprengja.Resources.BULLET);
    // Set the pivot point to the center of the myGun
    gun.anchor.setTo(0.5, 0.5);
    gameState.game.physics.enable(gun, true);
    gameState.game.physics.p2.enableBody(gun, true);
    gun.tint = color;
    gun.body.rotation = player.angle;
    gun.events.onKilled.add(function(myGun) {
        Sprengja.Graphics.showExplosionAt(x, y);
    }, game);

    gun.body.static = true;

    return gun;
}



GameState.prototype.setEventHandlers = function() {
    this.socket.on('connect', onSocketConnected);
    this.socket.on('disconnect', onSocketDisconnect);
    this.socket.on('shootBullet', onShootBullet);
    this.socket.on('game ready', onGameReady);
    this.socket.on('rotateGun', onRotateGun);
};

function onGameReady (session) {
    console.log('game is ready')
    var gameState = game.state.getCurrentState();

    console.log(session);

    gameState.initGame(session);
}

function onKilledPlayer(session) {
    console.log('Killed player ' + playerStats.name);

    var gameState = game.state.getCurrentState();

}

function onSocketConnected() {
    console.log('Connected to socket server');
}

function onSocketDisconnect() {
    console.log('Disconnected from socket server');
}

function onShootBullet(session) {
    console.log('Player shot with parameters: ' + session.bulletData);
    var gameState = game.state.getCurrentState();

    gameState.shootBullet(session);
}

function onRotateGun(angle) {
    var gameState = game.state.getCurrentState();
    gameState.rotateGun(angle);
}

GameState.prototype.pullTrigger = function(bulletSpeedRatio) {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now - this.lastBulletShotAt < Sprengja.Settings.SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    var currentGun = this.getCurrentGun();

    var bulletSpeed = Sprengja.Settings.BULLET_SPEED * bulletSpeedRatio;
    var x = this.coordinateModelX.screenToWorld(currentGun.body.x);
    var y = this.coordinateModelY.screenToWorld(currentGun.body.y);
    var angle = currentGun.body.rotation;
    var bulletData = {x: x, y: y, angle: angle, speed: bulletSpeed};

    console.log(bulletData);

    var shootState = this.session.shootBullet(bulletData);
    if (this.socket != null) {
        this.socket.emit('shootBullet', shootState);
    } else {
        this.shootBullet(shootState);
    }
}

GameState.prototype.shootBullet = function(shootState) {
    console.log(shootState);
    console.log('current player: ' + this.session.activePlayer.id);
    console.log('this.player: ' + this.player.id);

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
    bullet.body.collideWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the myGun position.
    bullet.reset(this.coordinateModelX.worldToScreen(shootState.bulletData.x), this.coordinateModelY.worldToScreen(shootState.bulletData.y));
    bullet.body.rotation = shootState.bulletData.angle;

    // Shoot it in the right direction
    var speed = this.coordinateModelX.worldToScreen(shootState.bulletData.speed);
    bullet.body.velocity.x = Math.cos(bullet.body.rotation) * speed;
    bullet.body.velocity.y = Math.sin(bullet.body.rotation) * speed;
};

GameState.prototype.triggerGunRotation = function(angle) {
    if (this.socket != null) {
        this.socket.emit('rotateGun', angle);
    } else {
        this.rotateGun(angle);
    }
}

GameState.prototype.rotateGun = function(angle) {
    this.getCurrentGun().body.rotation = angle;
}

// The update() method is called every frame
GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        var hudText = this.game.time.fps + ' FPS' + ( (this.session) ? '   State: ' + this.session.statusText() : '');
        Sprengja.Menu.text.setStatusText(hudText);
    }

    // this.game.physics.arcade.collide(this.monster, this.ground);


    // this.game.physics.arcade.collide(this.bulletPool, this.myGun, function(gun, bullet) {
    //     gun.damage(10);
    //     bullet.kill();
    //     this.session.hitPlayer(this.player);
    // }, null, this);
    // this.game.physics.arcade.collide(this.bulletPool, this.otherGun, function(gun, bullet) {
    //     gun.damage(10);
    //     bullet.kill();
    //     this.session.hitPlayer(this.otherPlayer);
    // }, null, this);

    // // Check if bullet have collided with the monster
    // this.game.physics.arcade.collide(this.bulletPool, this.monster, function(monster, bullet) {
    //     // Kill the monster
    //     bullet.kill();
    //     monster.damage(10);
    //     this.session.hitNothing();
    // }, null, this);

    // // Check if bullets have collided with the ground
    // this.game.physics.arcade.collide(this.bulletPool, this.ground, function(bullet, ground) {
    //     // Kill the bullet
    //     this.session.hitNothing();
    //     bullet.kill();
    // }, null, this);

    // Rotate all living bullets to match their trajectory
    this.bulletPool.forEachAlive(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);

    if (this.initialized) {

        if (this.session.isReadyForPlayer(this.player)) {
            // Aim the myGun at the pointer.
            // All this function does is calculate the angle using
            // Math.atan2(yPointer-ymyGun, xPointer-xmyGun)
            this.triggerGunRotation(this.game.physics.arcade.angleToPointer(this.getCurrentGun()));

            // Shoot a bullet
            if (this.session.isReadyForShot() && this.game.input.activePointer.isDown) {
                this.triggerDownTime = this.game.time.now;
                this.session.state = SessionState.TRIGGER_DOWN;
            }

            if (this.session.isTriggerDown()) {
                var downTime = this.game.time.now - this.triggerDownTime;
                var bulletSpeedRatio = Math.min(1, downTime / Sprengja.Settings.MAX_TRIGGER_DOWNTIME);

                if (this.game.input.activePointer.isDown) {
                    // Trigger is still down
                    // TODO nioe: Draw bullet speed ratio on gui
                } else {
                    // Player released trigger
                    this.triggerDownTime = null;
                    this.pullTrigger(bulletSpeedRatio);
                }
            }
        }
    }
};

GameState.prototype.getCurrentGun = function() {
    if (this.session.activePlayer.id === this.player.id) {
        return this.myGun;
    } else if (this.session.activePlayer.id === this.otherPlayer.id) {
        return this.otherGun;
    } else {
        return null;
    }
};

var gameDimension = new Sprengja.GameDimension();
var game = new Phaser.Game(gameDimension.getGameWidth(), gameDimension.getGameHeight(), Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
console.log("Drew new game canvas with dimensions: " + gameDimension.getGameWidth() + " x " + gameDimension.getGameHeight());
