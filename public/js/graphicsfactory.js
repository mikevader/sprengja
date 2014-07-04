var Sprengja = Sprengja || {};

Sprengja.GraphicsFactory = {
    
    createLevel: function(width,height){
        var level = new Level();
        var terrainContour = Sprengja.GraphicsFactory.terrain(width,height,height/7,0.62);
        level.setLevelData(terrainContour);
        level.setRange(0,height);
        return level; 
    },
    
    terrain : function(width, height, displace, roughness) {
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
    },

    createKilledBullet : function() {
        var bullet = game.add.sprite(0, 0, Sprengja.Resources.BULLET);
        game.physics.enable(bullet, Phaser.Physics.P2JS, Sprengja.Settings.DEBUG);
        bullet.kill();
        var gameState = game.state.getCurrentState();
        bullet.events.onKilled.add(function(bullet) {
           Sprengja.Graphics.showExplosionAt(bullet.x, bullet.y);
        }, this);
        bullet.body.collideWorldBounds = false;
        
        return bullet;
    },
        
    createExplosion : function() {
        var explosion = game.add.sprite(0, 0, Sprengja.Resources.EXPLOSION);
        explosion.anchor.setTo(0.5, 0.5);
      
        // Add an animation for the explosion that kills the sprite when the
        // animation is complete
        var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
        animation.killOnComplete = true;

        return explosion;
    },
    
    addCloudAt : function(x) {
        var cloud = game.add.image(x, -80, Sprengja.Resources.CLOUD);
        cloud.scale.setTo(5, 5); // Make the clouds big
        cloud.tint = 0xcccccc; // Make the clouds dark
        cloud.smoothed = false; // Keeps the sprite pixelated
    },
    
    createGroundBlockAt : function(x,y) {
        // Add the ground blocks, enable physics on each, make them immovable
        var groundBlock = game.add.sprite(x, y, Sprengja.Resources.GROUND);
        game.physics.enable(groundBlock, Phaser.Physics.P2JS, Sprengja.Settings.DEBUG);
        groundBlock.body.collideWorldBounds = true;
        groundBlock.body.static = true;

        return groundBlock;
    },
    
    createGunAt : function(x, y, player) {
        var gun = game.add.sprite(x, y, Sprengja.Resources.BULLET);
        // Set the pivot point to the center of the myGun
        game.physics.enable(gun, Phaser.Physics.P2JS, Sprengja.Settings.DEBUG);
        gun.tint = player.color;
        gun.body.rotation = player.angle;
        gun.events.onKilled.add(function(myGun) {
            Sprengja.Graphics.showExplosionAt(myGun.x, myGun.y);
        }, game);

        gun.body.static = false;
        gun.body.fixedRotation  = true;
        
        gun.body.setRectangle(64, 64);
        gun.body.mass = 5000;
        
        return gun;
    }
}

