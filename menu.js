class Menu {
    constructor() {
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'menu-container';
        this.setupMenu();
    }

    setupMenu() {
        // Create buttons
        const buttons = [
            { text: 'Výroba', id: 'production' },
            { text: 'Finance', id: 'finance' },
            { text: 'Akce', id: 'action' },
            { text: 'Konec', id: 'exit' }
        ];

        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = 'menu-button';
            btn.id = button.id;
            btn.textContent = button.text;
            this.menuContainer.appendChild(btn);
        });

        // Add event listeners
        this.menuContainer.querySelectorAll('.menu-button').forEach(button => {
            button.addEventListener('click', (e) => this.handleButtonClick(e));
        });

        // Add menu to body
        document.body.appendChild(this.menuContainer);
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
                this.menuContainer.style.display = 'none';
                document.getElementById('gameCanvas').style.display = 'block';
                break;
            case 'production':
            case 'finance':
                alert('Tato sekce bude implementována později.');
                break;
        }
    }
}

// Initialize menu when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menu = new Menu();
}); 