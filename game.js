class Game {
    constructor(cfg) {
        this.debugMode = cfg.debugMode || true;
        
        this.model = {
            accountBallance: 5000,

            battlefield: new BattlefieldModel(this),
            market: new MarketModel(this),
            factory: new FactoryModel(this),
        }

        this.view = {
            menu: new MenuView(this),
            battlefield: new BattlefieldView(this, this.model.battlefield),
            market: new MarketView(this, this.model.market),
            factory: new FactoryView(this, this.model.factory)
        }

        this.controller = {
            menu: new MenuController(this, this.view.menu),
            market: new MarketController(this, this.model.market, this.view.market),
            battlefield: new BattlefieldController(this, this.model.battlefield, this.view.battlefield),

        }

        /*
         * this.units data structure: {
         *     model: Unit,
         *     view: UnitView,
         *     controller: UnitController
         *  }
         */
        this.unitsMVC = new Set();

        this.controller.menu.init();
        this.controller.menu.show();
        this.controller.market.init();
        this.controller.battlefield.init();

        // mockup: add three units to the game
        // later this would be done a the factory
        for (let i = 0; i < 3; i++) {
            const model = new UnitModel(this);
            const view = new UnitView(this, model);
            const controller = new UnitController(this, model, view);
            controller.init();

            const newUnit = {
                model: model,
                view: view,
                controller: controller
            };
            this.unitsMVC.add(newUnit);
        }
    }
}

var game;
// Start the game when the page loads
window.addEventListener('load', () => {
    game = new Game({
        debugMode: true
    });
}); 