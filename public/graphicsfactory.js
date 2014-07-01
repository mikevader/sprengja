var Sprengja = Sprengja || {};

Sprengja.GraphicsFactory = {

    createKilledBullet : function() {
            
        var bullet = game.add.sprite(0, 0, Sprengja.Resources.BULLET);
        // bullet.anchor.setTo(0.5, 0.5);
        // game.physics.p2.enable(bullet, true);
        game.physics.enable(bullet, Phaser.Physics.P2JS, false);
        bullet.kill();
        bullet.events.onKilled.add(function(bullet) {
            Sprengja.Graphics.showExplosionAt(bullet.x, bullet.y);
        }, this);

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
    
    createGroundBlockAt : function(x) {
        
        // Add the ground blocks, enable physics on each, make them immovable
        var groundBlock = game.add.sprite(x, game.height - 32, Sprengja.Resources.GROUND);
        game.physics.enable(groundBlock, Phaser.Physics.P2JS, false);
        // game.physics.p2.enable(groundBlock, true);
        // game.physics.p2.enableBody(groundBlock, true);
        groundBlock.body.immovable = true;
        groundBlock.body.allowGravity = false;
        groundBlock.body.static = true;

        return groundBlock;
    }
}