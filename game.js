const debugMode = true;

class Game {
    constructor(cfg = {}) {
        this.debugMode = typeof cfg.debugMode == "undefined" ? true : cfg.debugMode; // Výchozí hodnota debug módu
        this.units = new Set();
        this.selectedUnits = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.formations = new Map();
        this.currentFormation = null;
        this.view = new GameView(this);
        this.terrain = new Terrain(this);
        this.scrollSpeed = 10; // Rychlost scrollování
        this.scrollMargin = 50; // Vzdálenost od okraje, kdy začne scrollování
        
        // Inicializace v správném pořadí
        this.resizeCanvas();
        this.setupEventListeners();
        this.initMap();
        this.initUnits();
        
        // Spuštění herní smyčky až po inicializaci
        requestAnimationFrame(() => this.gameLoop());
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Prevent context menu on right click
        this.view.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    resizeCanvas() {
        this.view.canvas.width = window.innerWidth;
        this.view.canvas.height = window.innerHeight;
        
        // Aktualizujeme rozměry canvasu u všech jednotek
        for (const unit of this.units) {
            unit.canvasWidth = this.view.canvas.width;
            unit.canvasHeight = this.view.canvas.height;
        }
    }
    
    handleKeyDown(e) {
        // Zrušení výběru
        if (e.key === 'Escape') {
            this.clearSelection();
        }
        // Přepnutí debug módu
        if (event.key === 'd' || event.key === 'D') {
            this.debugMode = !this.debugMode;
            // Aktualizujeme debug mód u všech jednotek
            for (const unit of this.units) {
                unit.view.debugMode = this.debugMode;
            }
            // Přepnutí debug módu u terénu
            this.terrain.debugMode = this.debugMode;
        }
    }
        
    handleMouseDown(e) {
        this.dragStart = { 
            x: e.clientX + this.terrain.xOffset, 
            y: e.clientY + this.terrain.yOffset
        };
    }

    handleMouseMove(e) {
            
        if (this.dragStart) {
            // Mark that the mouse has moved during drag
                const dx = e.clientX + this.terrain.xOffset - this.dragStart.x;
                const dy = e.clientY + this.terrain.yOffset - this.dragStart.y;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.isDragging = true;
                } else {
                    this.isDragging = false;
                }
            }
            
            this.mousePosition = { x: e.clientX, y: e.clientY };
            
            // If dragging, select units within the selection box
            if (this.isDragging) {
                const startX = this.dragStart.x + this.terrain.xOffset - this.view.canvasLeft;
                const startY = this.dragStart.y + this.terrain.yOffset - this.view.canvasTop;
                const endX = e.clientX + this.terrain.xOffset - this.view.boundingClientRectangle.left;
                const endY = e.clientY + this.terrain.yOffset - this.view.boundingClientRectangle.top;
                
                // Clear previous selection if shift is not pressed and we started dragging from empty space
                const clickedUnit = Array.from(this.units).find(unit => unit.isPointInside(startX, startY) && !unit.isEnemy);
                if (!e.shiftKey && !clickedUnit) {
                    this.clearSelection();
                }
                
                // Create formation if multiple units are selected
                // TODO: toto asi není potřeba, formace se vytvoří při puštění tlačítka (mouseup)
                if (this.selectedUnits.size > 1) {
                    this.currentFormation = new Formation(Array.from(this.selectedUnits));
                }
            }
    }

    handleMouseUp(e) {
        
        const x = e.clientX + this.terrain.xOffset - this.view.boundingClientRectangle.left;
        const y = e.clientY + this.terrain.yOffset - this.view.boundingClientRectangle.top;
        
        
        // Handle right click to clear selection
        if (e.button === 2) { // Right mouse button
            this.clearSelection();
            this.dragStart = null;
            this.isDragging = false;
            return;
        }

        // Left mouse button
        if (this.debugMode) console.log("Left mouse button");

        // Výběr oblasti myší
        if (this.isDragging) {
            // Select friendly units within the selection box
            for (const unit of this.units) {
                if (!unit.isEnemy && unit.isInSelectionBox(this.dragStart.x, this.dragStart.y, x, y)) {
                    unit.select();
                    this.selectedUnits.add(unit);
                }
            }
            if (this.selectedUnits.size > 1) {
                this.currentFormation = new Formation(Array.from(this.selectedUnits));
            }
            if (this.debugMode) console.log("Drag end");
            this.dragStart = null;
            this.isDragging = false;
            return;
        }

        this.dragStart = null;

        // Kliknutí na jednotku
        for (const unit of this.units) {
            if (unit.isPointInside(x, y) && !unit.isEnemy) {
                
                if (!e.shiftKey) { // standardní výběr jednotky
                    this.clearSelection();
                    unit.select();
                    this.selectedUnits.add(unit);
                } else { // shift key is pressed
                    this.selectedUnits.add(unit);
                    unit.select();
                    if (this.selectedUnits.size > 1) {
                        this.currentFormation = new Formation(Array.from(this.selectedUnits));
                    }
                }
                if (this.debugMode) console.log("Selected a friendly unit");
                return;
            }
        }

        // Kliknutí na mapu
        if (this.debugMode) console.log("Clicked on map");
        if (this.currentFormation) {
            this.currentFormation.moveTo(x, y);
        } else {
            // TODO: Nebylo by výhodné chovat se k jedné jednotce jako k formaci?
            this.selectedUnits.forEach((unit) => {
                if (this.debugMode) console.log("Moving unit to [" + x + " : " + y + "]");
                
                unit.vision.startTurningTo(x, y);
                unit.moveTo(x, y);
            });
        }
    }

    initMap() {
        this.terrain.init();
    }
    
    initUnits() {
        this.createUnits({
            isEnemy: false,
            unitCount: 5,
            startX: this.terrain.mapWidth * 0.1 * this.terrain.tileSize,
            startY: this.terrain.mapHeight * 0.1 * this.terrain.tileSize,
            startAreaRadius: this.terrain.mapHeight * 0.4 * this.terrain.tileSize,
            visionDirection: { x: 1, y: 1 }
        });  

        this.createUnits({
            isEnemy: true,
            unitCount: 3,
            startX: (this.terrain.mapWidth - this.terrain.mapWidth * 0.1) * this.terrain.tileSize ,
            startY:  (this.terrain.mapHeight - this.terrain.mapHeight * 0.1) * this.terrain.tileSize,
            startAreaRadius: this.terrain.mapHeight * 0.4 * this.terrain.tileSize,
            visionDirection: { x: -1, y: -1 }
        });
    }

    createUnits(cfg) {
        const { 
            isEnemy = true, 
            unitCount = 0, 
            startX = 0, 
            startY = 0, 
            startAreaRadius = 0, 
            visionDirection = { x: 1, y: 1 } 
        } = cfg;

        for (let i = 0; i < unitCount; i++) {
            const position = this.findValidPosition(startX, startY, startAreaRadius);
            if (!position) {
                console.warn(`Could not find valid position for unit ${i}`);
                continue;
            }
            
            const unit = new Unit(this, {
                x: position.x,
                y: position.y,
                isEnemy: isEnemy,
                debugMode: this.debugMode
            });
            
            // unit.vision.turnTo(visionDirection.x, visionDirection.y);
            const visionTargetVector = new Vector2(
                unit.x + visionDirection.x, 
                unit.y + visionDirection.y
            );
            unit.vision.turnTo(visionTargetVector.x, visionTargetVector.y);
            
            this.units.add(unit);
        }
    }

    // Helper function to check if position is valid
    isValidPosition(x, y) {
        // Check if position is in water
        const tileX = Math.floor(x / this.terrain.tileSize);
        const tileY = Math.floor(y / this.terrain.tileSize);
        if (tileX < 0 || tileX >= this.terrain.mapWidth ||
            tileY < 0 || tileY >= this.terrain.mapHeight) {
            return false;
        }
        if (this.terrain.terrainMap[tileY][tileX] <= this.terrain.waterLevel) {
            return false;
        }
        
        // Check distance to other units
        for (const unit of this.units) {
            const distance = GamePosition.getDistance(x, y, unit.x, unit.y);
            if (distance < unit.personalSpace) {
                return false;
            }
        }
        
        return true;
    }

    // Helper function to find valid position
    findValidPosition(startX, startY, startAreaRadius, maxAttempts = 100) {
        for (let i = 0; i < maxAttempts; i++) {
            // Generate random coordinates within the circle
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * startAreaRadius;
            const x = startX + Math.cos(angle) * radius;
            const y = startY + Math.sin(angle) * radius;
            if (this.isValidPosition(x, y)) {
                return { x, y };
            }
        }
        return null; // No valid position found
    }
    
    gameLoop() {

        // Kontrola scrollování
        this.checkScroll();
    
        // Update units
        for (const unit of this.units) {
            unit.update();
        }
            
        // Draw all units and terrain
        this.view.draw();
            
        // Update and draw formation if it exists
        if (this.currentFormation) {
            this.currentFormation.update();
            // this.currentFormation.draw(this.view.ctx);
        }
            
        // Draw selection box if dragging
        if (this.isDragging) {
            this.createSelectionBox();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    createSelectionBox() {
        this.view.drawSelectBox(
            this.dragStart.x, 
            this.dragStart.y, 
            this.mousePosition.x, this.mousePosition.y);
    }
    
    clearSelection() {
        for (const unit of this.units) {
            unit.deselect();
        }
        this.selectedUnits.clear();
        this.currentFormation = null;
    }

    checkScroll() {

        const margin = this.scrollMargin;
        const speed = this.scrollSpeed;
        let targetX = this.terrain.xOffset;
        let targetY = this.terrain.yOffset;
        
        // Kontrola levého okraje
        if (this.mousePosition.x < margin) {
            targetX -= speed;
        }
        // Kontrola pravého okraje
        else if (this.mousePosition.x > this.view.canvas.width - margin) {
            targetX += speed;
        }
        
        // Kontrola horního okraje
        if (this.mousePosition.y < margin) {
            targetY -= speed;
        }
        // Kontrola dolního okraje
        else if (this.mousePosition.y > this.view.canvas.height - margin) {
            targetY += speed;
        }
        
        // Omezení scrollování na hranice mapy
        this.view.x = Math.max(0, Math.min(targetX, this.terrain.mapWidth * this.terrain.tileSize - this.view.canvas.width));
        this.view.y = Math.max(0, Math.min(targetY, this.terrain.mapHeight * this.terrain.tileSize - this.view.canvas.height));

        this.terrain.xOffset = this.view.x;
        this.terrain.yOffset = this.view.y;
        this.terrain.view.draw();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game({
        debugMode: debugMode
    });
}); 