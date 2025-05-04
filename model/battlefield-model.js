class BattlefieldModel {
    constructor(game) {
        this.game = game;

        /*
         * unit data structure: {
         *     model: UnitModel,
         *     view: UnitView,
         *     controller: UnitController,
         *     mapPosition: { x: number, y: number },
         *     isEnemy: boolean
         * }
         */
        this.alliedUnits = new Set(); // players units on this battlefield - controllers and situational data
        this.enemyUnits = new Set(); // units on this battlefield - controllers and situational data
        this.selectedUnits = new Set();
        // this.formations = new Set();
        // this.currentFormation = null;

        this.terrain = {
            map: [],
            offsetX: 0,
            offsetY: 0,
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
    }

    /**
     * Adds a unit to the battlefield
     * @param {Object} unitData - The unit data
     */
    addUnitData(unitData = { model: null, view: null, controller: null, mapPosition: { x: 0, y: 0 }, isEnemy: false, isDead: true }) {
        const battlefieldUnitData = {
            model: unitData.model,
            view: unitData.view,
            controller: unitData.controller,
            mapPosition: {
                x: unitData.mapPosition.x,
                y: unitData.mapPosition.y
            },
            isEnemy: unitData.isEnemy,
            isDead: false
        }
        if (!unitData.isEnemy) {
            this.alliedUnits.add(battlefieldUnitData);
        } else {
            this.enemyUnits.add(battlefieldUnitData);
        }
    }

    /**
     * Starts moving a unit to a target position
     * @param {Object} unitData - The unit data
     * @param {Object} unitData.position - The position of the unit
     * @param {Object} targetPosition - The target position
     */
    startMovingUnitTo(unitData, targetPosition) {
        unitData.targetPosition = targetPosition;
    }

    stopMovingUnit(unitData) {
        unitData.targetPosition = null;
    }

    updateUnitPosition(unitData) {
        const lastPosition = {
            x: unitData.mapPosition.x,
            y: unitData.mapPosition.y
        }

        const movementVector = new Vector2(unitData.model.speed.current, 0);
        movementVector.rotate(unitData.model.vision.currentAngle);
        unitData.mapPosition.x += movementVector.x;
        unitData.mapPosition.y += movementVector.y;
        
        // if unit is at the target position, stop moving
        if (unitData.targetPosition) {
            const lastTargetVector = new Vector2(
                unitData.targetPosition.x - lastPosition.x, 
                unitData.targetPosition.y - lastPosition.y
            );
            const currentTargetVector = new Vector2(
                unitData.targetPosition.x - unitData.mapPosition.x, 
                unitData.targetPosition.y - unitData.mapPosition.y
            );
            const lastDistance = lastTargetVector.length;
            const currentDistance = currentTargetVector.length;
            if (currentDistance <= lastDistance) {
                // going towards the target
                if (currentDistance > unitData.model.getBrakingDistance()) {
                    console.log('going towards the target');
                    unitData.model.accelerate();
                    return;
                }
            }
        }
        unitData.model.decelerate();
    }

    /**
     * Starts turning a unit to a target position
     * @param {Object} unitData - The unit data
     * @param {Object} unitData.position - The position of the unit
     * @param {Object} targetPosition - The target position
     */
    startTurningUnitTo(unitData, targetPosition) {
        const targetVector = new Vector2(
            targetPosition.x - unitData.mapPosition.x, 
            targetPosition.y - unitData.mapPosition.y
        );
        const targetAngle = targetVector.getAngle();
        unitData.model.startTurningTo(targetAngle);
    }

    turnUnitTo(unitData, targetPosition) {
        const targetVector = new Vector2(targetPosition.x - unitData.position.x, targetPosition.y - unitData.position.y);
        const targetAngle = targetVector.getAngle();
        unitData.model.turnTo(targetAngle);
    }

    isTileWalkable(position) {
        const tileX = Math.floor(position.x / this.terrain.tileSize);
        const tileY = Math.floor(position.y / this.terrain.tileSize);
        if (this.terrain.map[tileY] == undefined || this.terrain.map[tileY][tileX] == undefined) return false; // out of map
        if (this.terrain.map[tileY][tileX] <= this.terrain.waterLevel) return false; // water is not walkable
        return true;
    }

    /**
     * Finds a walkable tile within a given area
     * @param {number} startX - The x coordinate of the starting point
     * @param {number} startY - The y coordinate of the starting point
     * @param {number} areaRadius - The radius of the area to search
     * @param {number} maxAttempts - The maximum number of attempts to find a walkable tile
     * @returns {Object} The coordinates of the walkable tile or null if no walkable tile is found
     */
    findWalkableTile(startPosition, areaRadius, maxAttempts = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * areaRadius;
            const resultPosition = {
                x: Math.floor(startPosition.x + Math.cos(angle) * distance),
                y: Math.floor(startPosition.y + Math.sin(angle) * distance)
            }
            
            if (this.isTileWalkable(resultPosition)) {
                return resultPosition;
            }
        }
        console.log('No walkable tile found', startPosition, areaRadius);
        throw new Error('No walkable tile found', startPosition, areaRadius);
    }

    /**
     * Shifts the terrain by a given amount
     * @param {number} x - The amount to shift the terrain by on the x axis
     * @param {number} y - The amount to shift the terrain by on the y axis
     */
    shiftMap(dx, dy) {
        const newOffsetX = this.terrain.offsetX - dx;
        const newOffsetY = this.terrain.offsetY - dy;
        const mapSize = this.getMapSize();
        const viewportSize = this.getViewportSize();
        if ( (newOffsetX > 0) && (newOffsetX + viewportSize.width < mapSize.width) ) {
            this.terrain.offsetX -= dx;
        }
        if ( (newOffsetY > 0) && (newOffsetY + viewportSize.height < mapSize.height) ) {
            this.terrain.offsetY -= dy;
        }
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
                    const sampleX = (x + this.terrain.offsetX + this.terrain.seed) * this.terrain.scale * frequency;
                    const sampleY = (y + this.terrain.offsetY + this.terrain.seed) * this.terrain.scale * frequency;
                    
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
     * Returns the size of the map in pixels
     * @returns {Object} The size of the map
     */
    getMapSize() {
        return {
            width: this.terrain.mapWidth * this.terrain.tileSize,
            height: this.terrain.mapHeight * this.terrain.tileSize
        };
    }

    /**
     * Returns the size of the viewport in pixels
     * @returns {Object} The size of the viewport
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
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


