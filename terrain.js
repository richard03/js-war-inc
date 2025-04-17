class Terrain {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.tileSize = cfg.tileSize || 32;
        this.mapWidth = Math.ceil(game.view.boundingClientRectangle.width / this.tileSize) * 10;
        this.mapHeight = Math.ceil(game.view.boundingClientRectangle.height / this.tileSize) * 10;
        this.xOffset = Math.random() * 10000;
        this.yOffset = Math.random() * 10000;
        this.terrainMap = this.generateTerrainMap();
        this.view = new TerrainView(this, game.view.ctx);
        
    }

    // Generování výškové mapy pomocí Perlinova šumu
    generateTerrainMap() {
        const terrainMap = new Array(this.mapHeight);
        const scale = 0.02;
        const persistence = 0.7;
        const octaves = 5;

        for (let y = 0; y < this.mapHeight; y++) {
            terrainMap[y] = new Array(this.mapWidth);
            for (let x = 0; x < this.mapWidth; x++) {
                let amplitude = 1;
                let frequency = 1;
                let noiseHeight = 0;

                for (let i = 0; i < octaves; i++) {
                    const sampleX = (x + this.xOffset) * scale * frequency;
                    const sampleY = (y + this.yOffset) * scale * frequency;
                    
                    const perlinValue = Math.sin(sampleX) * Math.cos(sampleY);
                    noiseHeight += perlinValue * amplitude;
                    
                    amplitude *= persistence;
                    frequency *= 2;
                }

                noiseHeight = (noiseHeight + 1) / 2;
                terrainMap[y][x] = noiseHeight;
            }
        }

        return terrainMap;
    }

} 