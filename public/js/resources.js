var Sprengja = Sprengja || {};

Sprengja.Resources = {
    
    CLOUD : '/img/gfx/ball.png',
    BULLET : '/img/gfx/bullet.png',
    GROUND : '/img/gfx/minecraft_ground.png',
    EXPLOSION : '/img/gfx/explosion.png',
    NEW_GAME : '/img/gfx/startnewgame.png',

    preloadAllImages : function (game) {
        
        function preloadImage(url) {
            game.load.image(url, url);
        }
    
        function preloadSpritesheet(url, frameWidth, frameHeight) {
            game.load.spritesheet(url, url, frameWidth, frameHeight);
        }
        
        preloadImage(Sprengja.Resources.CLOUD);
        preloadImage(Sprengja.Resources.BULLET);
        preloadImage(Sprengja.Resources.GROUND);
        preloadSpritesheet(Sprengja.Resources.EXPLOSION, 128, 128);
        preloadImage(Sprengja.Resources.NEW_GAME);
    }
    
};