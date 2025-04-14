class Map {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 64;
        this.tileWidth = this.tileSize;
        this.tileHeight = this.tileSize / 2;
    }

    draw() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += this.tileWidth) {
            for (let y = 0; y < this.canvas.height; y += this.tileHeight) {
                // Draw diamond shape
                this.ctx.beginPath();
                this.ctx.moveTo(x, y + this.tileHeight);
                this.ctx.lineTo(x + this.tileWidth/2, y);
                this.ctx.lineTo(x + this.tileWidth, y + this.tileHeight);
                this.ctx.lineTo(x + this.tileWidth/2, y + this.tileHeight * 2);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        }
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
} 