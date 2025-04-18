class Terrain {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.tileSize = cfg.tileSize || 32;
        this.mapWidth = Math.ceil(game.view.boundingClientRectangle.width / this.tileSize) * 100;
        this.mapHeight = Math.ceil(game.view.boundingClientRectangle.height / this.tileSize) * 100;
        this.xOffset = Math.random() * 10000;
        this.yOffset = Math.random() * 10000;
        this.terrainMap = this.generateTerrainMap();
        this.view = new TerrainView(this, game.view.ctx);
        
    }

    // Generování výškové mapy pomocí Perlinova šumu
    generateTerrainMap() {
        const terrainMap = new Array(this.mapHeight);
        const scale = 0.02; // scale is the distance between the points on the map
        const persistence = 0.7; // persistence is the amplitude of the noise
        const octaves = 5; // octaves is the number of noise layers
        
        for (let y = 0; y < this.mapHeight; y++) {
            terrainMap[y] = new Array(this.mapWidth);
            for (let x = 0; x < this.mapWidth; x++) {
                let amplitude = 1; // amplitude je výška šumu
                let frequency = 1; // frequency je frekvence šumu
                let noiseHeight = 0; // noiseHeight je výsledná výška šumu. Narozdíl od amplitude, maximální hodnota noiseHeight je 1.

                for (let i = 0; i < octaves; i++) {
                    const sampleX = (x + this.xOffset) * scale * frequency;
                    const sampleY = (y + this.yOffset) * scale * frequency;
                    
                    const perlinValue = Math.sin(sampleX) * Math.cos(sampleY);
                    noiseHeight += perlinValue * amplitude;
                    
                    amplitude *= persistence;
                    frequency *= 2;
                }

                // Normalizace výšky na rozsah 0-1
                noiseHeight = (noiseHeight + 1) / 2;
                
                // Výpočet vzdálenosti od nejbližšího okraje
                const distanceFromEdge = Math.min(
                    x,                          // vzdálenost od levého okraje
                    this.mapWidth - x - 1,      // vzdálenost od pravého okraje
                    y,                          // vzdálenost od horního okraje
                    this.mapHeight - y - 1      // vzdálenost od dolního okraje
                );
                
                // Faktor pro snížení výšky u okrajů
                // Záměrem je, aby u okrajů byla voda.
                let heightFactor = Math.sqrt(distanceFromEdge) / 5;
                if (heightFactor > 1) {
                    heightFactor = 1;
                }
                
                // Aplikace faktoru na výšku
                // U okrajů bude výška nižší (blíže k vodě)
                terrainMap[y][x] = 0.2 + noiseHeight * Math.pow(heightFactor, 2);
                
            }
        }

        return terrainMap;
    }

    moveTerrain(x, y) {
        this.xOffset += x;
        this.yOffset += y;
    }

} 