'use strict';

var GameState = function () {
};

// Load images and sounds
GameState.prototype.preload = function () {
    Sprengja.Resources.preloadAllImages(game);
};

// Setup the example
GameState.prototype.create = function () {
    game.stage.backgroundColor = Sprengja.Settings.BACKGROUND_COLOR;

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.restitution = 0.9;
    this.game.physics.p2.setImpactEvents(true);
    
    //Particle emitter declaration
    this.emitter = game.add.emitter(game.world.centerX, game.world.centerY, 400);
    this.emitter.makeParticles( [ Sprengja.Resources.FIRE1, Sprengja.Resources.FIRE2, Sprengja.Resources.FIRE3, Sprengja.Resources.SMOKE ] );
    this.emitter.gravity = 200;
    this.emitter.setAlpha(1, 0, 1000);
    this.emitter.setScale(0.5, 0, 0.5, 0, 1000);
    //this.emitter.start(false, 3000, 5);

    
    
    // might be interessting to use
    // game.physics.p2.setPostBroadphaseCallback(checkPossibleColl, this);
    this.bulletsCollisionGroup = game.physics.p2.createCollisionGroup();
    this.gunCollisionGroup = game.physics.p2.createCollisionGroup();
    this.groundCollisionGroup = game.physics.p2.createCollisionGroup();
    
    game.physics.p2.updateBoundsCollisionGroup();

    // Create an object pool of bullets
    this.bulletPool = this.game.add.group();
    for(var i = 0; i < Sprengja.Settings.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = Sprengja.GraphicsFactory.createKilledBullet();
        bullet.body.setCollisionGroup(this.bulletsCollisionGroup);
        bullet.body.collides(this.gunCollisionGroup, hitGun, this);
        bullet.body.collides(this.groundCollisionGroup, hitGround, this);
        this.bulletPool.add(bullet);
    }

    // Turn on gravity
    this.game.physics.p2.gravity.y = Sprengja.Settings.GRAVITY;

    // Let's make some clouds
    for(var x = -56; x < this.game.width; x += 80) {
        Sprengja.GraphicsFactory.addCloudAt(x);
    }

    
    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width/2;
    this.game.input.activePointer.y = this.game.height/2 - 100;

    // Show FPS
    this.game.time.advancedTiming = true;
    
    Sprengja.Menu.newGameMenu.show();
};

GameState.prototype.drawTerrainCountour = function(contour,shouldDraw) {   
    if(shouldDraw){
        var bmd = game.add.bitmapData(this.game.width,this.game.height);   
            bmd.ctx.beginPath();
            bmd.ctx.moveTo(0, contour[0]);
            for (var t = 1; t < contour.length; t++) {
                bmd.ctx.lineTo(t, contour[t]);
            }
            bmd.ctx.lineWidth = 2;

            bmd.ctx.strokeStyle = '#d44d0e';
            bmd.ctx.stroke();
    
            var spriteTerrainContour = this.game.add.sprite(0,0,bmd);
    }
};

GameState.prototype.initRemoteGame = function(session) {
    console.log('Start remote game');
    var host = location.origin.replace(/^http/, 'ws'),
        socket = io.connect(host, {transports: ['websocket']});

    this.socket = socket;
    this.setEventHandlers();
    var session = new Session();
    session.resetPlayerIds();

    Sprengja.Message.query('Username:', 'Create new game', function () {
        socket.emit('join game', {name: Sprengja.Message.getInputText(), session: new Session()});
        Sprengja.Message.hide();
    });
};

GameState.prototype.initGame = function(session) {
    if (this.initialized) {
        return;
    }
    
    if(this.ground == null){
        console.log('level is null');
        var level = Sprengja.GraphicsFactory.createLevel(this.game.width,this.game.height);
        this.createLevel(level);
    }

    this.coordinateModelX = new CoordinateModel(0, 1);
    this.coordinateModelX.setScreenSize(this.game.width);
    this.coordinateModelY = new CoordinateModel(0, 1);
    this.coordinateModelY.setScreenSize(this.game.height);
    this.coordinateModelY.setDeviceCoordinatesInverted(true);

    if (typeof session === 'undefined') {
        this.session = new Session(session);
        this.session.remote = false;
        this.player = this.session.playerA;
        this.otherPlayer = this.session.playerB;
    } else {
        this.session = new Session(session);
        this.session.remote = true;
        this.player = this.session.playerById(this.socket.socket.sessionid);
        this.otherPlayer = (this.session.playerA == this.player) ? this.session.playerB : this.session.playerA;
    }

    // Create an object representing our myGun
    this.myGun = createGun(this, this.player);
  
    // Create an object representing our otherGun
    this.otherGun = createGun(this, this.otherPlayer);
   
    this.session.init();
    this.initialized = true;
};

function createGun(gameState, player) {
    var xPosition = gameState.coordinateModelX.worldToScreen(player.x);
    var yPosition = gameState.coordinateModelY.worldToScreen(player.y);

    var gun = Sprengja.GraphicsFactory.createGunAt(xPosition, yPosition, player);
    gun.body.setCollisionGroup(gameState.gunCollisionGroup);
    gun.body.collides(gameState.bulletsCollisionGroup);
    gun.body.collides(gameState.groundCollisionGroup, gunHitGround, gameState);
    return gun;
};

GameState.prototype.setEventHandlers = function() {
    this.socket.on('connect', onSocketConnected);
    this.socket.on('disconnect', onSocketDisconnect);
    this.socket.on('shootBullet', onShootBullet);
    this.socket.on('game ready', onGameReady);
    this.socket.on('rotateGun', onRotateGun);
    this.socket.on('showMessage', onShowMessage);
    this.socket.on('hideMessage', onHideMessage);
    this.socket.on('load level',onLevelInit);
};

GameState.prototype.createLevel = function(level) {
    console.log('Creating new level');
    var rescaledLevel = [];
    var levelData = level.terrainPoints;
    var levelMin = level.minimumBound;
    var levelMax = level.maximumBound;
    var terrainContour = [];
    for(var i = 0;i<levelData.length;i++){
        terrainContour[i] = this.game.height / (levelMax - levelMin) * (levelData[i] - levelMin);
    }
    this.drawTerrainCountour(terrainContour,Sprengja.Settings.DEBUG);

    // Create some ground
    this.ground = this.game.add.group();
    for(var x = 6; x < this.game.width; x += 12) {
        var terrainBoundY = terrainContour[x];       
        for(var y = this.game.height - 6;y > terrainBoundY; y -= 12){
            var groundBlock = Sprengja.GraphicsFactory.createGroundBlockAt(x,y);
            groundBlock.body.setCollisionGroup(this.groundCollisionGroup);      
            groundBlock.body.collides([this.gunCollisionGroup,this.bulletsCollisionGroup]);
            this.ground.add(groundBlock);
        }
    }
};

function onGameReady(session) {
    console.log('Event: onGameReady')
    var gameState = game.state.getCurrentState();
    gameState.initGame(session);
    Sprengja.Message.hide();
}

function onLevelInit(level){
    var gameState = game.state.getCurrentState();
    console.log('Event: onLevelInit: '+level);
    gameState.createLevel(level);
}

function onKilledPlayer(session) {
    console.log('Event: onKilledPlayer (' + playerStats.name + ')');

    var gameState = game.state.getCurrentState();
}

function onSocketConnected() {
    console.log('Event: onSocketConnected');
}

function onSocketDisconnect() {
    console.log('Event: onSocketDisconnect');
}

function onShootBullet(session) {
    console.log('Event: onShootBullet(' + session.bulletData + ')');
    var gameState = game.state.getCurrentState();
    gameState.shootBullet(session);
}

function onRotateGun(angle) {
    var gameState = game.state.getCurrentState();
    gameState.rotateGun(angle);
}

function onShowMessage(message) {
    Sprengja.Message.show(message);
}

function onHideMessage() {
    Sprengja.Message.hide();
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
    var angle = currentGun.body.rotation;
    var x = this.coordinateModelX.screenToWorld(currentGun.body.x + 50 * Math.cos(angle));
    var y = this.coordinateModelY.screenToWorld(currentGun.body.y + 50 * Math.sin(angle));

    var bulletData = {x: x, y: y, angle: angle, speed: bulletSpeed};

    var shootState = this.session.shootBullet(bulletData);
    if (this.socket != null) {
        this.socket.emit('shootBullet', shootState);
    } else {
        this.shootBullet(shootState);
        this.emitter.start(false, 2000, 5);
    }
}

GameState.prototype.shootBullet = function(shootState) {
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



function hitGun(bulletBody, gunBody) {
    var gameState = game.state.getCurrentState();

    var gun = gunBody.sprite;
    var bullet = bulletBody.sprite;
    
    gun.damage(10);
    bullet.kill();
    this.emitter.kill();

    if (gun == gameState.myGun) {
        console.log('hit myself: loose!');
        gameState.session.hitPlayer(gameState.player);
    } else {
        console.log('hit other player: win!');
        gameState.session.hitPlayer(gameState.otherPlayer);
        Sprengja.Menu.newGameMenu.show();
    }
}

function hitGround(bulletBody, groundBlockBody) {
    console.log('hit ground');
    var groundBlock = groundBlockBody.sprite;
    var bullet = bulletBody.sprite;
   
    var gameState = game.state.getCurrentState();
    groundBlock.kill();
    this.emitter.kill();
    
    if (bullet.alive) {
        bullet.kill();
        gameState.session.hitNothing();
    }
}

function gunHitGround(gunBody, groundBlockBody) {
    console.log('gun landed on ground');
    gunBody.static = true;
    gunBody.fixedRotation = false;
    //gunBody.setRectangle(32, 32);
}

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

    // Rotate all living bullets to match their trajectory
    this.bulletPool.forEachAlive(function(bullet) {
        bullet.body.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x) + Math.PI;
        
        var px = bullet.body.velocity.x;
        var py = bullet.body.velocity.y;

        px *= -1;
        py *= -1;

        this.emitter.minParticleSpeed.set(px, py);
        this.emitter.maxParticleSpeed.set(px, py);

        this.emitter.emitX = bullet.body.x;
        this.emitter.emitY = bullet.body.y;
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
                    Sprengja.Menu.text.setCenteredText(Math.floor(bulletSpeedRatio * 100) + '%');
                } else {
                    // Player released trigger
                    Sprengja.Menu.text.hideCenteredText();
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

GameState.prototype.getOtherGun = function() {
    if (this.session.activePlayer.id === this.player.id) {
        return this.otherGun;
    } else if (this.session.activePlayer.id === this.otherPlayer.id) {
        return this.myGun;
    } else {
        return null;
    }
};

var gameDimension = new Sprengja.GameDimension();
var game = new Phaser.Game(gameDimension.getGameWidth(), gameDimension.getGameHeight(), Phaser.AUTO, 'game');
game.state.add('game', GameState, true);
console.log("Drew new game canvas with dimensions: " + gameDimension.getGameWidth() + " x " + gameDimension.getGameHeight());
