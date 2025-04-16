class GameView {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        const rect = this.canvas.getBoundingClientRect();
        this.canvasLeft = rect.left;
        this.canvasTop = rect.top;
        this.canvasWidth = rect.width;
        this.canvasHeight = rect.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawSelectBox(startX, startY, endX, endY) {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
}
