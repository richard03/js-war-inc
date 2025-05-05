class MenuController {
    constructor(game, model, view) {
        this.game = game;

        this.model = model;
        this.view = view;
    }
    
    init() {
        if (this.game.debugMode) console.log('init menu controller');

        this.view.init();
        this.hide();

        // Create buttons
        this.model.buttons.forEach(button => {
            this.view.addButton(button.text, button.id);
        });

        // Add event listeners
        this.view.getButtons().forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });
    }

    show() {
        this.view.show();
    }

    hide() {
        this.view.hide();
    }

    handleButtonClick(event) {
        const buttonId = event.target.id;
        
        switch(buttonId) {
            case 'exit':
                if (confirm('Opravdu chcete ukončit hru?')) {
                    window.close();
                }
                break;
            case 'action':
                // Hide menu and show game
                this.hide();
                this.game.controller.battlefield.startBattle(this.game.unitsMVC);
                this.game.controller.battlefield.show();
                break;
            case 'finance':
                // Hide menu and show market
                this.hide();
                this.game.controller.market.show();
                break;
            case 'production':
                this.hide();
                this.game.controller.factory.show();
                break;
        }
    }
}
