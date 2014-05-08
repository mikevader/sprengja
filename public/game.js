'use strict';

// This example uses the Phaser 2.0.4 framework

// Copyright © 2014 John Watson
// Licensed under the terms of the MIT License

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

var socket;

var bulletPool;

// Setup the example
GameState.prototype.create = function() {
    var port = document.location.port;
    var address = document.location.protocol + '//' + document.location.hostname;
    socket = io.connect(address, {port: port, transports: ['websocket']})


    // Set stage background color
    this.game.stage.backgroundColor = 0x4488cc;

    // Define constants
    this.SHOT_DELAY = 300; // milliseconds (10 bullets/3 seconds)
    this.BULLET_SPEED = 800; // pixels/second
    this.NUMBER_OF_BULLETS = 20;
    this.GRAVITY = 980; // pixels/second/second

    // Create an object representing our gun
    this.gun = this.game.add.sprite(50, this.game.height - 64, 'bullet');

    // Set the pivot point to the center of the gun
    this.gun.anchor.setTo(0.5, 0.5);


    // Create an object representing our target
    this.monster = this.game.add.sprite(this.game.width - 200, this.game.height - 64, 'cyclops');
    // Enable physics on the bullet
    this.game.physics.enable(this.monster, Phaser.Physics.ARCADE);
    this.monster.body.collideWorldBounds = true;
    this.monster.events.onKilled.add(function(monster) {
        this.getExplosion(monster.x, monster.y, monster);
    }, this);

    // Create an object pool of bullets
    bulletPool = this.game.add.group();
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, 'bullet');
        bulletPool.add(bullet);

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

    // // Create a pool of cyclopes
    // var MONSTERS = 50;
    // this.monsterGroup = this.game.add.group();
    // this.monsterGroup.enableBody = true;
    // this.monsterGroup.physicsBodyType = Phaser.Physics.ARCADE;
    // this.monsterGroup.createMultiple(MONSTERS, 'cyclops', 0);

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

    setEventHandlers();
};


var setEventHandlers = function() {
    socket.on('connect', onSocketConnected);
    socket.on('disconnect', onSocketDisconnect);
    socket.on('shootBullet', onShootBullet);
};

function onSocketConnected () {
    console.log('Connected to socket server');
}

function onSocketDisconnect () {
    console.log('Disconnected from socket server');
}

function onShootBullet (data) {
    console.log('Player shot with angle: ' + data.angle);
    GameState.prototype.shootBullet(data);
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
    var theta = -this.gun.rotation;
    var x = 0, y = 0;
    for(var t = 0 + this.timeOffset/(1000*MARCH_SPEED/60); t < 3; t += 0.03) {
        x = this.BULLET_SPEED * t * Math.cos(theta) * correctionFactor;
        y = this.BULLET_SPEED * t * Math.sin(theta) * correctionFactor - 0.5 * this.GRAVITY * t * t;
        this.bitmap.context.fillRect(x + this.gun.x, this.gun.y - y, 3, 3);
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

    socket.emit('shootBullet', {x: this.gun.x, y: this.gun.y, angle: this.gun.rotation, speed: this.BULLET_SPEED});
}

GameState.prototype.shootBullet = function(bulletData) {
    var x = bulletData.x;
    var y = bulletData.y;
    var angle = bulletData.angle;
    var speed = bulletData.speed;

    // Get a dead bullet from the pool
    var bullet = bulletPool.getFirstDead();

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

    // Set the bullet position to the gun position.
    bullet.reset(x, y);
    bullet.rotation = angle;

    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * speed;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * speed;
};

// The update() method is called every frame
GameState.prototype.update = function() {
    if (this.game.time.fps !== 0) {
        this.fpsText.setText(this.game.time.fps + ' FPS');
    }

    // Draw the trajectory every frame
    this.drawTrajectory();

    this.game.physics.arcade.collide(this.monster, this.ground);

    // Check if bullet have collided with the monster
    this.game.physics.arcade.collide(bulletPool, this.monster, function(monster, bullet) {
        // Kill the monster
        bullet.kill();
        monster.kill();
    }, null, this);

    // Check if bullets have collided with the ground
    this.game.physics.arcade.collide(bulletPool, this.ground, function(bullet, ground) {
        // Kill the bullet
        bullet.kill();
    }, null, this);

    // Rotate all living bullets to match their trajectory
    bulletPool.forEachAlive(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);

    // Aim the gun at the pointer.
    // All this function does is calculate the angle using
    // Math.atan2(yPointer-yGun, xPointer-xGun)
    this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);

    // Shoot a bullet
    if (this.game.input.activePointer.isDown) {
        this.pullTrigger();
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
        explosion = this.game.add.sprite(0, 0, 'explosion');
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
    explosion.angle = this.game.rnd.integerInRange(0, 360);

    // Play the animation
    explosion.animations.play('boom');

    // Return the explosion itself in case we want to do anything else with it
    return explosion;
};

var game = new Phaser.Game(848, 450, Phaser.AUTO, 'game');
game.state.add('game', GameState, true);