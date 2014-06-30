var Sprengja = Sprengja || {};

Sprengja.Resources = {
    
    CLOUD : '/assets/gfx/ball.png',
    BULLET : '/assets/gfx/bullet.png',
    GROUND : '/assets/gfx/ground.png',
    EXPLOSION : '/assets/gfx/explosion.png',
    NEW_CLIENT_GAME : '/assets/gfx/newclientgame.png',
    NEW_SERVER_GAME : '/assets/gfx/newservergame.png',
       
    preloadAllImages : function(game) {
        game.load.image(Sprengja.Resources.CLOUD, '/assets/gfx/ball.png');
        game.load.image(Sprengja.Resources.BULLET, '/assets/gfx/bullet.png');
        game.load.image(Sprengja.Resources.GROUND, '/assets/gfx/ground.png');
        game.load.spritesheet(Sprengja.Resources.EXPLOSION, '/assets/gfx/explosion.png', 128, 128);
    }
    
};