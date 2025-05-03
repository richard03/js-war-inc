class MenuController {
    constructor(game, view) {
        this.game = game;
        this.view = view;

        this.buttons = [
            { text: 'Finance', id: 'finance' },
            { text: 'Výroba', id: 'production' },
            { text: 'Akce', id: 'action' },
            { text: 'Konec', id: 'exit' }
        ];
    }
    
    init() {
        this.view.init();
        this.hide();

        // Create buttons
        this.buttons.forEach(button => {
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
                alert('Tato sekce bude implementována později.');
                break;
        }
    }
}
