class Terrain {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.tileSize = cfg.tileSize || 32;
        this.mapWidth = Math.ceil(game.view.boundingClientRectangle.width / this.tileSize) * 10;
        this.mapHeight = Math.ceil(game.view.boundingClientRectangle.height / this.tileSize) * 10;
        this.xOffset = 0
        this.yOffset = 0
        this.terrainMap = null;
        this.waterLevel = 0.3;
        this.view = new TerrainView(this, game.view.ctx);
        this.seed = Math.random() * 1000000; // Náhodný seed pro generování terénu
    }

    init() {
        this.terrainMap = this.generateTerrainMap();
    }

    isTileWalkable(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.terrainMap[tileY][tileX] > this.waterLevel;
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
                let noiseHeight = 0; // noiseHeight je výsledná výška šumu

                for (let i = 0; i < octaves; i++) {
                    const sampleX = (x + this.xOffset + this.seed) * scale * frequency;
                    const sampleY = (y + this.yOffset + this.seed) * scale * frequency;
                    
                    // Jednoduchá implementace Perlinova šumu
                    const x0 = Math.floor(sampleX);
                    const x1 = x0 + 1;
                    const y0 = Math.floor(sampleY);
                    const y1 = y0 + 1;
                    
                    // Náhodné gradienty pro každý roh
                    const grad00 = this.randomGradient(x0, y0);
                    const grad01 = this.randomGradient(x0, y1);
                    const grad10 = this.randomGradient(x1, y0);
                    const grad11 = this.randomGradient(x1, y1);
                    
                    // Interpolace
                    const sx = sampleX - x0;
                    const sy = sampleY - y0;
                    
                    const n0 = this.dotGridGradient(x0, y0, sampleX, sampleY, grad00);
                    const n1 = this.dotGridGradient(x0, y1, sampleX, sampleY, grad01);
                    const ix0 = this.lerp(n0, n1, sy);
                    
                    const n2 = this.dotGridGradient(x1, y0, sampleX, sampleY, grad10);
                    const n3 = this.dotGridGradient(x1, y1, sampleX, sampleY, grad11);
                    const ix1 = this.lerp(n2, n3, sy);
                    
                    const perlinValue = this.lerp(ix0, ix1, sx);
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
                let heightFactor = Math.sqrt(distanceFromEdge) / 5;
                if (heightFactor > 1) {
                    heightFactor = 1;
                }
                
                // Aplikace faktoru na výšku
                terrainMap[y][x] = 0.2 + noiseHeight * Math.pow(heightFactor, 2);
            }
        }

        return terrainMap;
    }

    // Pomocné funkce pro Perlinův šum
    randomGradient(x, y) {
        // Deterministický generátor náhodných čísel
        const a = x * 7919 + y * 2971 + this.seed;
        const b = Math.sin(a) * 10000;
        const angle = (b - Math.floor(b)) * Math.PI * 2;
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    dotGridGradient(ix, iy, x, y, grad) {
        const dx = x - ix;
        const dy = y - iy;
        return dx * grad.x + dy * grad.y;
    }

    lerp(a0, a1, w) {
        return a0 + w * (a1 - a0);
    }

    moveTerrain(x, y) {
        this.xOffset += x;
        this.yOffset += y;
    }
} 