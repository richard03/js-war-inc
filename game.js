class Game {
    constructor(cfg) {
        this.model = {
            mousePosition: { x: 0, y: 0 },
            isDragging: false,
            dragStart: null,
            dragEnd: null,
            debugMode: cfg.debugMode || true,

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
            market: new MarketController(this)
        }

        this.controller.menu.init();
        this.controller.market.init();
    }
}

var game;
// Start the game when the page loads
window.addEventListener('load', () => {
    game = new Game({
        debugMode: true
    });
}); 