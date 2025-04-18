class TerrainView {
    constructor(terrain, viewContext, cfg = {}) {
        this.terrain = terrain;
        this.viewContext = viewContext;
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

        for (let y = 0; y < this.terrain.mapHeight; y++) {
            for (let x = 0; x < this.terrain.mapWidth; x++) {

                if (this.debugMode) {
                    this.viewContext.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    this.viewContext.lineWidth = 0.5;
                    this.viewContext.strokeRect(
                        x * this.terrain.tileSize, 
                        y * this.terrain.tileSize, 
                        this.terrain.tileSize, 
                        this.terrain.tileSize
                    );
                }

                const terrainHeight = this.terrain.terrainMap[y][x];
                const color = this.getColor(terrainHeight);
                this.viewContext.fillStyle = color;
                this.viewContext.fillRect(
                    x * this.terrain.tileSize, 
                    y * this.terrain.tileSize, 
                    this.terrain.tileSize, 
                    this.terrain.tileSize
                );
            }
        }
        
    }   
}

