var Sprengja = Sprengja || {};

Sprengja.Resources = {
    
    CLOUD : '/img/gfx/ball.png',
    BULLET : '/img/gfx/bullet.png',
    GROUND : '/img/gfx/minecraft_ground.png',
    EXPLOSION : '/img/gfx/explosion.png',

    NEW_CLIENT_GAME : '/img/gfx/newclientgame.png',
    NEW_SERVER_GAME : '/img/gfx/newservergame.png',
    JOIN_SERVER_GAME : '/img/gfx/joinservergame.png',
    FIRE1 : '/img/gfx/fire1.png',
    FIRE2 : '/img/gfx/fire2.png',
    FIRE3 : '/img/gfx/fire3.png',
    SMOKE : '/img/gfx/smoke-puff.png',
    

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

        preloadImage(Sprengja.Resources.NEW_CLIENT_GAME);
        preloadImage(Sprengja.Resources.NEW_SERVER_GAME);

        preloadImage(Sprengja.Resources.JOIN_SERVER_GAME);

        preloadImage(Sprengja.Resources.FIRE1);
        preloadImage(Sprengja.Resources.FIRE2);
        preloadImage(Sprengja.Resources.FIRE3);
        preloadImage(Sprengja.Resources.SMOKE);

        preloadSpritesheet(Sprengja.Resources.EXPLOSION, 128, 128);
        preloadImage(Sprengja.Resources.NEW_GAME);
    }
    
};