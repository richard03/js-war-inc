class FactoryView {
    constructor(game, model) {
        this.game = game;
        this.model = model;

        this.container = null;
        this.creditsDisplay = null;
        this.blueprintsContainer = null;
        this.playerUnitsContainer = null;
    }

    init() {
        if (this.game.debugMode) console.log('init factory view');

        this.container = document.createElement('div');
        this.container.className = 'factory-container';
        
        // Navigation buttons
        const navigation = document.createElement('div');
        navigation.className = 'navigation';
        
        const toMenuButton = document.createElement('button');
        toMenuButton.classList.add('to-menu-button');
        toMenuButton.textContent = 'Zpět do menu';
        
        navigation.appendChild(toMenuButton);
        this.container.appendChild(navigation);
        
        this.creditsDisplay = document.createElement('div');
        this.creditsDisplay.className = 'credits-display';
        
        this.blueprintsContainer = document.createElement('div');
        this.blueprintsContainer.className = 'blueprints-container';
        
        this.playerUnitsContainer = document.createElement('div');
        this.playerUnitsContainer.className = 'player-units-container';
        
        this.container.appendChild(this.creditsDisplay);
        this.container.appendChild(this.blueprintsContainer);
        this.container.appendChild(this.playerUnitsContainer);
        document.body.appendChild(this.container);
    }
    
    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    updateCredits() {
        this.creditsDisplay.textContent = `Kredity: ${this.game.model.accountBalance} KR`;
    }

    updateBlueprints() {
        this.blueprintsContainer.innerHTML = '';
        this.model.blueprints.forEach(blueprint => {
            const blueprintCard = this.createBlueprintCard(blueprint);
            this.blueprintsContainer.appendChild(blueprintCard);
        });
    }

    updatePlayerUnits() {
        this.playerUnitsContainer.innerHTML = '';
        this.game.unitsMVC.forEach(unit => {
            const unitCard = this.createUnitCard(unit);
            this.playerUnitsContainer.appendChild(unitCard);
        });
    }

    createBlueprintCard(blueprint) {
        const card = document.createElement('div');
        card.className = 'blueprint-card';
        
        const name = document.createElement('h3');
        name.textContent = blueprint.name;
        
        const image = document.createElement('img');
        image.src = blueprint.image;
        image.alt = blueprint.name;
        
        const price = document.createElement('div');
        price.className = 'price';
        price.textContent = `${blueprint.price} KR`;
        
        const description = document.createElement('p');
        description.textContent = blueprint.description;
        
        const produceButton = document.createElement('button');
        produceButton.textContent = 'Vyrobit';
        produceButton.disabled = this.game.model.accountBalance < blueprint.price;
        
        card.appendChild(name);
        card.appendChild(image);
        card.appendChild(price);
        card.appendChild(description);
        card.appendChild(produceButton);
        
        return card;
    }

    createUnitCard(unit) {
        const card = document.createElement('div');
        card.className = 'unit-card';
        
        const name = document.createElement('h3');
        name.textContent = unit.name;
        
        const image = document.createElement('img');
        image.src = unit.image;
        image.alt = unit.name;
        
        const sellButton = document.createElement('button');
        sellButton.textContent = 'Prodat';
        
        card.appendChild(name);
        card.appendChild(image);
        card.appendChild(sellButton);
        
        return card;
    }
}


