class GameView {
    constructor(game) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boundingClientRectangle = this.canvas.getBoundingClientRect();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.clear();
        this.game.terrain.view.draw();
        for (const unit of this.game.units) {
            unit.view.draw();
        }
    }

    drawSelectBox(startX, startY, endX, endY) {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
}
