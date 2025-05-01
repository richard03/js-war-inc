class BattlefieldModel {
    constructor(game, cfg = {}) {
        this.game = game;

        this.units = new Set();
        this.selectedUnits = new Set();
        // this.formations = new Set();
        // this.currentFormation = null;

        this.terrain = {
            map: [],
            xOffset: 0,
            yOffset: 0,
            tileSize: 32,
            mapWidth: 100, // width of the map, in tiles
            mapHeight: 100, // height of the map, in tiles  
            waterLevel: 0.3,
            seed: Math.random() * 1000000,
            scale: 0.02, // scale is the distance between the points on the map
            persistence: 0.7, // persistence is the amplitude of the noise
            octaves: 5 // octaves is the number of noise layers
        }
        
    }

    init() {
        this.generateTerrainMap();
        // this.initUnits();
    }

    // initUnits() {
    //     // TODO: init units
    // }

    // addUnit(unitCfg) {
    //     const unit = new UnitModel({
    //         x: unitCfg.x,
    //         y: unitCfg.y,
    //         isEnemy: unitCfg.isEnemy
    //     });
    //     this.units.add(unit);
    // }

    isTileWalkable(x, y) {
        const tileX = Math.floor(x / this.terrain.tileSize);
        const tileY = Math.floor(y / this.terrain.tileSize);
        return this.terrain.map[tileY][tileX] > this.terrain.waterLevel;
    }

    /**
     * Finds a walkable tile within a given area
     * @param {number} startX - The x coordinate of the starting point
     * @param {number} startY - The y coordinate of the starting point
     * @param {number} areaRadius - The radius of the area to search
     * @param {number} maxAttempts - The maximum number of attempts to find a walkable tile
     * @returns {Object} The coordinates of the walkable tile or null if no walkable tile is found
     */
    findWalkableTile(startX, startY, areaRadius, maxAttempts = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * areaRadius;
            const x = startX + Math.cos(angle) * distance;
            const y = startY + Math.sin(angle) * distance;
            
            if (this.isTileWalkable(x, y)) {
                return { x, y };
            }
        }
        return null;
    }

    /**
     * Shifts the terrain by a given amount
     * @param {number} x - The amount to shift the terrain by on the x axis
     * @param {number} y - The amount to shift the terrain by on the y axis
     */
    shiftTerrain(x, y) {
        this.terrain.xOffset += x;
        this.terrain.yOffset += y;
    }

    /**
     * Generování výškové mapy pomocí Perlinova šumu
     */
    generateTerrainMap() {
        this.terrain.map = new Array(this.terrain.mapHeight);
        
        
        for (let y = 0; y < this.terrain.mapHeight; y++) {
            this.terrain.map[y] = new Array(this.terrain.mapWidth);
            for (let x = 0; x < this.terrain.mapWidth; x++) {
                let amplitude = 1; // amplitude je výška šumu
                let frequency = 1; // frequency je frekvence šumu
                let noiseHeight = 0; // noiseHeight je výsledná výška šumu

                for (let i = 0; i < this.terrain.octaves; i++) {
                    const sampleX = (x + this.terrain.xOffset + this.terrain.seed) * this.terrain.scale * frequency;
                    const sampleY = (y + this.terrain.yOffset + this.terrain.seed) * this.terrain.scale * frequency;
                    
                    // Jednoduchá implementace Perlinova šumu
                    const x0 = Math.floor(sampleX);
                    const x1 = x0 + 1;
                    const y0 = Math.floor(sampleY);
                    const y1 = y0 + 1;
                    
                    // Náhodné gradienty pro každý roh
                    const grad00 = BattlefieldModel.randomGradient(x0, y0, this.terrain.seed);
                    const grad01 = BattlefieldModel.randomGradient(x0, y1, this.terrain.seed);
                    const grad10 = BattlefieldModel.randomGradient(x1, y0, this.terrain.seed);
                    const grad11 = BattlefieldModel.randomGradient(x1, y1, this.terrain.seed);
                    
                    // Interpolace
                    const sx = sampleX - x0;
                    const sy = sampleY - y0;
                    
                    const n0 = BattlefieldModel.dotGridGradient(x0, y0, sampleX, sampleY, grad00);
                    const n1 = BattlefieldModel.dotGridGradient(x0, y1, sampleX, sampleY, grad01);
                    const ix0 = BattlefieldModel.lerp(n0, n1, sy);
                    
                    const n2 = BattlefieldModel.dotGridGradient(x1, y0, sampleX, sampleY, grad10);
                    const n3 = BattlefieldModel.dotGridGradient(x1, y1, sampleX, sampleY, grad11);
                    const ix1 = BattlefieldModel.lerp(n2, n3, sy);
                    
                    const perlinValue = BattlefieldModel.lerp(ix0, ix1, sx);
                    noiseHeight += perlinValue * amplitude;
                    
                    amplitude *= this.terrain.persistence;
                    frequency *= 2;
                }

                // Normalizace výšky na rozsah 0-1
                noiseHeight = (noiseHeight + 1) / 2;
                
                // Výpočet vzdálenosti od nejbližšího okraje
                const distanceFromEdge = Math.min(
                    x,                          // vzdálenost od levého okraje
                    this.terrain.mapWidth - x - 1,      // vzdálenost od pravého okraje
                    y,                          // vzdálenost od horního okraje
                    this.terrain.mapHeight - y - 1      // vzdálenost od dolního okraje
                );
                
                // Faktor pro snížení výšky u okrajů
                let heightFactor = Math.sqrt(distanceFromEdge) / 5;
                if (heightFactor > 1) {
                    heightFactor = 1;
                }
                
                // Aplikace faktoru na výšku
                this.terrain.map[y][x] = 0.2 + noiseHeight * Math.pow(heightFactor, 2);
            }
        }
    }
    
    /**
     * Random gradient
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {Object} The gradient
     */
    static randomGradient(x, y, randSeed) {
        // Deterministický generátor náhodných čísel
        const a = x * 7919 + y * 2971 + randSeed;
        const b = Math.sin(a) * 10000;
        const angle = (b - Math.floor(b)) * Math.PI * 2;
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    /**
     * Dot product of the gradient and the vector from the point to the grid point
     * @param {number} ix - The x coordinate of the grid point
     * @param {number} iy - The y coordinate of the grid point
     * @param {number} x - The x coordinate of the point
     * @param {number} y - The y coordinate of the point
     * @param {Object} grad - The gradient
     * @returns {number} The dot product
     */
    static dotGridGradient(ix, iy, x, y, grad) {
        const dx = x - ix;
        const dy = y - iy;
        return dx * grad.x + dy * grad.y;
    }
    
    /**
     * Linear interpolation
     * @param {number} a0 - The first value
     * @param {number} a1 - The second value
     * @param {number} w - The interpolation factor
     * @returns {number} The interpolated value
     */
    static lerp(a0, a1, w) {
        return a0 + w * (a1 - a0);
    }

    
}


