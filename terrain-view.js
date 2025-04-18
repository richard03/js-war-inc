class TerrainView {
    constructor(terrain, cfg = {}) {
        this.terrain = terrain;
        this.viewContext = terrain.game.view.ctx;
        this.canvas = terrain.game.view.canvas;
        this.debugMode = terrain.debugMode;
    }

    // Pomocná funkce pro převod hex na RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Pomocná funkce pro získání barvy pro danou výšku
    getColor(height) {
        // Barvy pro různé výšky (tmavší odstíny)
        const colors = [
            { height: 0.0, color: '#112266' },   // Modrá (voda)
            { height: 0.3, color: '#2d4d00' },   // Tmavá zelená
            { height: 0.5, color: '#3d6600' },   // Střední zelená
            { height: 0.7, color: '#4d3300' },   // Tmavá hnědá
            { height: 1.0, color: '#663300' }    // Velmi tmavá hnědá (hora)
        ];

        // V debug módu použijeme přesnou barvu bez interpolace
        if (this.debugMode) {
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

        const lowerRGB = this.hexToRgb(lowerColor.color);
        const upperRGB = this.hexToRgb(upperColor.color);

        const r = Math.round(lowerRGB.r + (upperRGB.r - lowerRGB.r) * factor);
        const g = Math.round(lowerRGB.g + (upperRGB.g - lowerRGB.g) * factor);
        const b = Math.round(lowerRGB.b + (upperRGB.b - lowerRGB.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    draw() {
        const ctx = this.viewContext;
        const terrain = this.terrain;
        const tileSize = terrain.tileSize;
        
        // Výpočet viditelné oblasti
        const startX = Math.floor(terrain.xOffset / tileSize);
        const startY = Math.floor(terrain.yOffset / tileSize);
        const endX = Math.min(terrain.mapWidth, startX + Math.ceil(this.canvas.width / tileSize) + 1);
        const endY = Math.min(terrain.mapHeight, startY + Math.ceil(this.canvas.height / tileSize) + 1);
        
        // Výpočet offsetu pro plynulý posun
        const offsetX = terrain.xOffset % tileSize;
        const offsetY = terrain.yOffset % tileSize;
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const height = terrain.terrainMap[y][x];
                
                // Výpočet pozice dlaždice s ohledem na offset
                const screenX = (x - startX) * tileSize - offsetX;
                const screenY = (y - startY) * tileSize - offsetY;

                if (this.debugMode) {
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(screenX, screenY, tileSize, tileSize);
                }
                
                // Barva podle výšky
                const color = this.getColor(height);
                ctx.fillStyle = color;
                ctx.fillRect(screenX, screenY, tileSize, tileSize);
                
                // Debug - zobrazení výšky
                if (terrain.debugMode) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.font = '12px Arial';
                    ctx.fillText(height.toFixed(2), screenX + 2, screenY + 10);
                }
            }
        }
    }   
}

