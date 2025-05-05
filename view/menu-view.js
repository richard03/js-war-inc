class MenuView {
    constructor(game) {
        this.game = game;
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'menu-container';
    }

    init() {
        if (this.game.debugMode) console.log('init menu view');

        // Add menu to body
        document.body.appendChild(this.menuContainer);
        
        // // const title = document.createElement('h1');
        // // title.textContent = 'JS War Inc.';
        
        // const factoryButton = document.createElement('button');
        // factoryButton.textContent = 'Výroba';
        // factoryButton.addEventListener('click', () => {
        //     this.game.showFactory();
        // });
        
        // const battlefieldButton = document.createElement('button');
        // battlefieldButton.textContent = 'Boj';
        // battlefieldButton.addEventListener('click', () => {
        //     this.game.showBattlefield();
        // });
        
        // this.container.appendChild(title);
        // this.container.appendChild(factoryButton);
        // this.container.appendChild(battlefieldButton);
    }

    show() {
        this.menuContainer.style.display = 'flex';
    }

    hide() {
        this.menuContainer.style.display = 'none';
    }

    addButton(text, id) {
        const btn = document.createElement('button');
        btn.className = 'menu-button';
        btn.id = id;
        btn.textContent = text;
        this.menuContainer.appendChild(btn);
    }

    getButtons() {
        return this.menuContainer.querySelectorAll('.menu-button');
    }
}


