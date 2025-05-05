class FactoryModel {
    constructor(game) {
        this.game = game;

        this.blueprints = [
            {
                id: 'rover-mk1',
                name: 'Rover Mk1',
                price: 1000,
                image: 'assets/sprites/vehicle.png',
                description: 'Základní průzkumné vozidlo'
            }
        ];
    }

    init() {
        if (this.game.debugMode) console.log('init factory model');
    }

    /**
     * Pokusí se vyrobit jednotku
     * @param {string} blueprintId - ID blueprintu jednotky
     * @returns {boolean} - True pokud se povedlo vyrobit, false pokud ne
     */
    produceUnit(blueprintId) {
        const blueprint = this.blueprints.find(bp => bp.id === blueprintId);
        if (!blueprint) return false;

        if (this.game.model.accountBalance >= blueprint.price) {
            this.game.model.accountBalance -= blueprint.price;

            const model = new UnitModel(this);
            const view = new UnitView(this, model);
            const controller = new UnitController(this, model, view);
            
            const id = `${blueprintId}-${Date.now()}`;
            model.init({
                id: id,
                blueprintId: blueprintId,
                name: blueprint.name,
                price: blueprint.price,
                description: blueprint.description
            });
            view.init({
                image: blueprint.image,
            });
            controller.init();

            const newUnit = {
                id: id,
                blueprintId: blueprintId,
                model: model,
                view: view,
                controller: controller
            };
            this.game.unitsMVC.add(newUnit);
            return true;
        }
        return false;
    }

    /**
     * Prodat jednotku
     * @param {string} unitId - ID jednotky k prodeji
     * @returns {boolean} - True pokud se povedlo prodat, false pokud ne
     */
    sellUnit(unitId) {
        const unitIndex = this.playerUnits.findIndex(unit => unit.id === unitId);
        if (unitIndex === -1) return false;

        const unit = this.game.unitsMVC.find(unit => unit.id === unitId);

        const sellPrice = this.getSellPrice(unitId);
        this.game.model.accountBalance += sellPrice;
        this.game.unitsMVC.delete(unit);
        return true;
    }

    /**
     * Získá cenu prodeje jednotky
     * @param {string} unitId - ID jednotky
     * @returns {number} - Cena prodeje
     */
    getSellPrice(unitId) {
        const unit = this.game.unitsMVC.find(u => u.id === unitId);
        return Math.floor(unit.model.price / 2);
    }
}


