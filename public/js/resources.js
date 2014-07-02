var Sprengja = Sprengja || {};

Sprengja.Resources = {
    
    CLOUD : '/img/gfx/ball.png',
    BULLET : '/img/gfx/bullet.png',
    GROUND : '/img/gfx/minecraft_ground.png',
    EXPLOSION : '/img/gfx/explosion.png',
    NEW_CLIENT_GAME : '/img/gfx/newclientgame.png',
    NEW_SERVER_GAME : '/img/gfx/newservergame.png',
    JOIN_SERVER_GAME : '/img/gfx/joinservergame.png',

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
        preloadImage(Sprengja.Resources.JOIN_SERVER_GAME);
        preloadSpritesheet(Sprengja.Resources.EXPLOSION, 128, 128);
    }
    
};