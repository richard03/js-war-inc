class Game {
    constructor(cfg) {
        this.debugMode = cfg.debugMode || true;
        
        this.model = {
            battlefield: new BattlefieldModel(this),
            market: new MarketModel(this),
            factory: new FactoryModel(this)
        }

        this.view = {
            menu: new MenuView(this),
            battlefield: new BattlefieldView(this),
            market: new MarketView(this),
            factory: new FactoryView(this)
        }

        this.controller = {
            menu: new MenuController(this),
            market: new MarketController(this),
            battlefield: new BattlefieldController(this)
        }

        this.controller.menu.init();
        this.controller.market.init();
        this.controller.battlefield.init();
    }
}

var game;
// Start the game when the page loads
window.addEventListener('load', () => {
    game = new Game({
        debugMode: true
    });
}); 