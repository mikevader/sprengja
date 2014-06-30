var Sprengja = Sprengja || {};

Sprengja.Resources = {
    
    CLOUD : '/assets/gfx/ball.png',
    BULLET : '/assets/gfx/bullet.png',
    GROUND : '/assets/gfx/ground.png',
    EXPLOSION : '/assets/gfx/explosion.png',
    NEW_CLIENT_GAME : '/assets/gfx/newclientgame.png',
    NEW_SERVER_GAME : '/assets/gfx/newservergame.png',
       
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
        preloadImage(Sprengja.Resources.NEW_CLIENT_GAME);
        preloadImage(Sprengja.Resources.NEW_SERVER_GAME);
        preloadSpritesheet(Sprengja.Resources.EXPLOSION, 128, 128);
    }
    
};