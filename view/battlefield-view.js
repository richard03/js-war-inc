class BattlefieldView {
    constructor(game) {
        this.game = game;

        this.canvas = null;
        this.ctx = null;
        this.boundingClientRectangle = null;

        this.terrain = null;        
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.boundingClientRectangle = this.canvas.getBoundingClientRect();
    }

    show() {
        this.canvas.style.display = 'block';
    }

    hide() {
        this.canvas.style.display = 'none';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.boundingClientRectangle = this.canvas.getBoundingClientRect();
        
        // // Update canvas dimensions for all units
        // for (const unit of this.units) {
        //     unit.canvasWidth = this.canvas.width;
        //     unit.canvasHeight = this.canvas.height;
        // }
    }

    draw(terrainData) {
        this.clear();
        this.drawTerrain(terrainData);
        // TODO: draw units
    }

    drawSelectBox(startX, startY, endX, endY) {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }


    drawTerrain(terrainData) {
        
        // Výpočet viditelné oblasti
        const startX = Math.floor(terrainData.xOffset / terrainData.tileSize);
        const startY = Math.floor(terrainData.yOffset / terrainData.tileSize);
        const endX = Math.min(terrainData.mapWidth, startX + Math.ceil(this.canvas.width / terrainData.tileSize) + 1);
        const endY = Math.min(terrainData.mapHeight, startY + Math.ceil(this.canvas.height / terrainData.tileSize) + 1);
        
        // Výpočet offsetu pro plynulý posun
        const offsetX = terrainData.xOffset % terrainData.tileSize;
        const offsetY = terrainData.yOffset % terrainData.tileSize;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const height = terrainData.map[y][x];
                
                // Výpočet pozice dlaždice s ohledem na offset
                const screenX = (x - startX) * terrainData.tileSize - offsetX;
                const screenY = (y - startY) * terrainData.tileSize - offsetY;

                if (this.game.debugMode) {
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.lineWidth = 0.5;
                    this.ctx.strokeRect(
                        screenX, 
                        screenY, 
                        terrainData.tileSize, 
                        terrainData.tileSize);
                }
                
                // Barva podle výšky
                const color = this.getHeightColor(height);
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    screenX, 
                    screenY, 
                    terrainData.tileSize, 
                    terrainData.tileSize);
                
                // Debug - zobrazení výšky
                if (this.game.debugMode) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.font = '12px Arial';
                    this.ctx.fillText(
                        height.toFixed(2), 
                        screenX + 2, 
                        screenY + 10);
                }
            }
        }
    }

    // Pomocná funkce pro získání barvy pro danou výšku
    getHeightColor(height) {
        // Barvy pro různé výšky (tmavší odstíny)
        const colors = [
            { height: 0.0, color: '#112266' },   // Modrá (voda)
            { height: 0.3, color: '#2d4d00' },   // Tmavá zelená
            { height: 0.5, color: '#3d6600' },   // Střední zelená
            { height: 0.7, color: '#4d3300' },   // Tmavá hnědá
            { height: 1.0, color: '#663300' }    // Velmi tmavá hnědá (hora)
        ];

        // V debug módu použijeme přesnou barvu bez interpolace
        if (this.game.debugMode) {
            for (let i = 0; i < colors.length - 1; i++) {
                if (height <= colors[i + 1].height) {
                    return colors[i].color;
                }
            }
            return colors[colors.length - 1].color;
        }

        // Normální režim s interpolací
        let lowerColor = colors[0];
        let upperColor = colors[colors.length - 1];

        for (let i = 0; i < colors.length - 1; i++) {
            if (height >= colors[i].height && height <= colors[i + 1].height) {
                lowerColor = colors[i];
                upperColor = colors[i + 1];
                break;
            }
        }

        const range = upperColor.height - lowerColor.height;
        const factor = (height - lowerColor.height) / range;

        const lowerRGB = BattlefieldView.hexToRgb(lowerColor.color);
        const upperRGB = BattlefieldView.hexToRgb(upperColor.color);

        const r = Math.round(lowerRGB.r + (upperRGB.r - lowerRGB.r) * factor);
        const g = Math.round(lowerRGB.g + (upperRGB.g - lowerRGB.g) * factor);
        const b = Math.round(lowerRGB.b + (upperRGB.b - lowerRGB.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Pomocná funkce pro převod hex na RGB
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}


