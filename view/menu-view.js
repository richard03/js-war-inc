class MenuView {
    constructor(game) {
        this.game = game;
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'menu-container';
    }

    init() {
        // Add menu to body
        document.body.appendChild(this.menuContainer);
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


