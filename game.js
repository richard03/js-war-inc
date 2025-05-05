class Game {
    constructor(cfg) {
        this.debugMode = cfg.debugMode || true;
        
        this.model = {
            accountBalance: 5000,

            menu: new MenuModel(this),
            battlefield: new BattlefieldModel(this),
            market: new MarketModel(this),
            factory: new FactoryModel(this),
        }

        this.view = {
            menu: new MenuView(this, this.model.menu),
            battlefield: new BattlefieldView(this, this.model.battlefield),
            market: new MarketView(this, this.model.market),
            factory: new FactoryView(this, this.model.factory)
        }

        this.controller = {
            menu: new MenuController(this, this.model.menu, this.view.menu),
            market: new MarketController(this, this.model.market, this.view.market),
            battlefield: new BattlefieldController(this, this.model.battlefield, this.view.battlefield),
            factory: new FactoryController(this, this.model.factory, this.view.factory)
        }

        /*
         * this.units data structure: {
         *     model: Unit,
         *     view: UnitView,
         *     controller: UnitController
         *  }
         */
        this.unitsMVC = new Set();

        

    }

    init() {
        this.controller.menu.init();
        
        this.controller.market.init();
        this.controller.battlefield.init();
        this.controller.factory.init();
        this.showMenu();
    }

    showMenu() {

        this.controller.market.hide();
        this.controller.factory.hide();
        this.controller.battlefield.hide();
        this.controller.menu.show();
    }
    
    getPlayerUnits() {
        return this.model.factory.playerUnits;
    }

    addListener(targetElementClass, eventName, callbackFunction) {
        document.body.addEventListener(eventName, (event) => {
            // go through all event.target's parents until the element with the selector is found
            let target = event.target;
            while (target.parentElement && !target.classList.contains(targetElementClass)) {
                target = target.parentElement;
            }
            if (target.classList.contains(targetElementClass)) {
                callbackFunction(target, event);
            }
        });
    }
}

var game;
// Start the game when the page loads
window.addEventListener('load', () => {
    game = new Game({
        debugMode: true
    });
    game.init();
}); 