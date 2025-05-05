class MenuModel {
    constructor(game) {
        this.game = game;

        this.buttons = [
            { text: 'Finance', id: 'finance' },
            { text: 'Výroba', id: 'production' },
            { text: 'Akce', id: 'action' },
            { text: 'Konec', id: 'exit' }
        ];
    }

    init() {
        if (this.game.debugMode) console.log('init menu model');
    }
}


