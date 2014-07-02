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
        
        return {
            
            getBullet : function() {
                
                var bulletPool = getBulletPool(),
                    bullet = bulletPool.getFirstDead();

                if (bullet === null) {
                    bullet = Sprengja.GraphicsFactory.createKilledBullet();
                    bulletPool.add(bullet);
                }
                
                return bullet;
            },
            
            showExplosionAt : function(x, y) {
            
                var explosionPool = getExplosionPool(),
                    explosion = explosionPool.getFirstDead();

                if (explosion === null) {
                    explosion = Sprengja.GraphicsFactory.createExplosion();
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