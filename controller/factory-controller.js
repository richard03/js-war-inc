class FactoryController {
    constructor(game, model, view) {
        this.game = game;
        this.model = model;
        this.view = view;
    }

    init() {
        if (this.game.debugMode) console.log('init factory controller');

        this.model.init();
        this.view.init();
        this.update();

        // event delegation for the to menu button
        this.game.addListener('to-menu-button', 'click', () => {
            this.hide();
            this.game.showMenu();
        });

        // event delegation for the produce button
        this.game.addListener('produce-button', 'click', (btnElement, event) => {
            const blueprintId = btnElement.dataset.blueprintId;
            if (this.model.produceUnit(blueprintId)) {
                this.update();
            }
        });

        // event delegation for the sell button
        this.game.addListener('sell-button', 'click', (btnElement, event) => {
            const unitId = btnElement.dataset.unitId;
            const sellPrice = this.model.getSellPrice(unitId);
            if (confirm(`Opravdu chcete prodat ${unitId} za ${sellPrice} KR?`)) {
                if (this.model.sellUnit(unitId)) {
                    this.update();
                }
            }
        });
    }

    show() {
        if (this.game.debugMode) console.log('factory controller: show');
        this.view.show();
    }

    hide() {
        if (this.game.debugMode) console.log('factory controller: hide');
        this.view.hide();
    }

    update() {
        this.view.updateCredits();
        this.view.updateBlueprints();
        this.view.updatePlayerUnits();
    }
}
