var Sprengja = Sprengja || {};



Sprengja.Graphics = (function() {
    
    var bulletPool,
        explosionPool;
    
        function getBulletPool() {
            if (bulletPool === undefined) {
                bulletPool = game.add.group();
            }
            return bulletPool;
        }
    
        function getExplosionPool() {
            if (explosionPool === undefined) {
                explosionPool = game.add.group();
            }
            return explosionPool;
        }
        
        function createKilledBullet() {
            
            var bullet = game.add.sprite(0, 0, Sprengja.Resources.BULLET);
            bullet.anchor.setTo(0.5, 0.5);
            bullet.kill();
            bullet.events.onKilled.add(function(bullet) {
                Sprengja.Graphics.showExplosionAt(bullet.x, bullet.y);
            }, this);
            
            game.physics.enable(bullet, Phaser.Physics.ARCADE);
        }
        
        function createExplosion() {
            
            var explosion = game.add.sprite(0, 0, Sprengja.Resources.EXPLOSION);
            explosion.anchor.setTo(0.5, 0.5);

            // Add an animation for the explosion that kills the sprite when the
            // animation is complete
            var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
            animation.killOnComplete = true;

            return explosion;
        }
    
        return {
            
            getBullet : function() {
                
                var bulletPool = getBulletPool(),
                    bullet = bulletPool.getFirstDead();

                if (bullet === null) {
                    bullet = createKilledBullet();
                    bulletPool.add(bullet);
                }
                
                return bullet;
            },
            
            showExplosionAt : function(x, y) {
            
                var explosionPool = getExplosionPool(),
                    explosion = explosionPool.getFirstDead();

                if (explosion === null) {
                    explosion = createExplosion();
                    explosionPool.add(explosion);
                }
                explosion.tint = 0xffffff;
                
                // Revive the explosion (set it's alive property to true)
                // You can also define a onRevived event handler in your explosion objects
                // to do stuff when they are revived.
                explosion.revive();
                explosion.x = x;
                explosion.y = y;

                // Set rotation of the explosion at random for a little variety
                explosion.angle = game.rnd.integerInRange(0, 360);
                // Play the animation
                explosion.animations.play('boom');
            }
        } 
    })(); // Immediate execution