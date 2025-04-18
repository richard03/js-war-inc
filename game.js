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
        this.scrollMargin = 5; // Vzdálenost od okraje, kdy začne scrollování
        
        // Inicializace v správném pořadí
        this.resizeCanvas();
        this.setupEventListeners();
        this.createInitialUnits();
        
        // Spuštění herní smyčky až po inicializaci
        requestAnimationFrame(() => this.gameLoop());
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
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add Escape key listener
        window.addEventListener('keydown', (e) => {
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
        });
        
        window.addEventListener('mousedown', (e) => {
            this.dragStart = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mousemove', (e) => {
            
            if (this.dragStart) {
                // Mark that the mouse has moved during drag
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.isDragging = true;
                } else {
                    this.isDragging = false;
                }
            }
            
            this.mousePosition = { x: e.clientX, y: e.clientY };
            
            // If dragging, select units within the selection box
            if (this.isDragging) {
                const startX = this.dragStart.x - this.view.canvasLeft;
                const startY = this.dragStart.y - this.view.canvasTop;
                const endX = e.clientX - this.view.boundingClientRectangle.left;
                const endY = e.clientY - this.view.boundingClientRectangle.top;
                
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
            
            // Kontrola scrollování
            this.checkScroll();
        });

        window.addEventListener('mouseup', (e) => {
            if (this.debugMode) console.log("Mouse up");
            const x = e.clientX - this.view.boundingClientRectangle.left;
            const y = e.clientY - this.view.boundingClientRectangle.top;
            
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
                    unit.moveTo(x, y);
                });
            }
        });
        
        // Prevent context menu on right click
        this.view.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    createInitialUnits() {
        // Create friendly units in bottom left
        const friendlyUnitCount = 5;
        const friendlyAreaWidth = this.view.canvas.width * 0.3; // 30% of screen width
        const friendlyAreaHeight = this.view.canvas.height * 0.3; // 30% of screen height
        const friendlyStartX = 0;
        const friendlyStartY = this.view.canvas.height - friendlyAreaHeight;

        // Create enemy units in top right first
        const enemyUnitCount = 3;
        const enemyAreaWidth = this.view.canvas.width * 0.3; // 30% of screen width
        const enemyAreaHeight = this.view.canvas.height * 0.3; // 30% of screen height
        const enemyStartX = this.view.canvas.width - enemyAreaWidth;
        const enemyStartY = 0;

        const enemyUnits = [];
        for (let i = 0; i < enemyUnitCount; i++) {
            // Random position within the top right area
            const x = enemyStartX + Math.random() * enemyAreaWidth;
            const y = enemyStartY + Math.random() * enemyAreaHeight;
            const unit = new Unit(this, {
                x: x,
                y: y,
                isEnemy: true,
                debugMode: this.debugMode
            });
            enemyUnits.push(unit);
        }

        // Calculate average enemy position
        const avgEnemyX = enemyUnits.reduce((sum, unit) => sum + unit.x, 0) / enemyUnitCount;
        const avgEnemyY = enemyUnits.reduce((sum, unit) => sum + unit.y, 0) / enemyUnitCount;

        // Create friendly units looking towards enemies
        for (let i = 0; i < friendlyUnitCount; i++) {
            // Random position within the bottom left area
            const x = friendlyStartX + Math.random() * friendlyAreaWidth;
            const y = friendlyStartY + Math.random() * friendlyAreaHeight;
            const unit = new Unit(this, {
                x: x,
                y: y,
                isEnemy: false,
                debugMode: this.debugMode
            });
            
            // Calculate angle towards average enemy position with some variation
            const dx = avgEnemyX - x;
            const dy = avgEnemyY - y;
            const baseAngle = Math.atan2(dy, dx);
            const angleVariation = (Math.random() - 0.5) * Math.PI / 6; // ±15 degrees variation
            const friendlyAngle = baseAngle + angleVariation;
            
            unit.vision.currentVisionAngle = friendlyAngle;
            unit.vision.targetVisionAngle = friendlyAngle;
            
            // Reset all physical properties to ensure units start at rest
            unit.velocity = { x: 0, y: 0 };
            unit.currentForce = { x: 0, y: 0, magnitude: 0 };
            unit.lastForceMagnitude = 0;
            unit.targetVisionAngle = friendlyAngle;
            unit.currentVisionAngle = friendlyAngle;
            unit.lastVisionAngle = friendlyAngle;
            
            this.units.add(unit);
        }

        // Calculate average friendly position
        const avgFriendlyX = Array.from(this.units).reduce((sum, unit) => sum + unit.x, 0) / friendlyUnitCount;
        const avgFriendlyY = Array.from(this.units).reduce((sum, unit) => sum + unit.y, 0) / friendlyUnitCount;

        // Set enemy units to look towards friendly units
        for (const unit of enemyUnits) {
            // Calculate angle towards average friendly position with some variation
            const dx = avgFriendlyX - unit.x;
            const dy = avgFriendlyY - unit.y;
            const baseAngle = Math.atan2(dy, dx);
            const angleVariation = (Math.random() - 0.5) * Math.PI / 6; // ±15 degrees variation
            const enemyAngle = baseAngle + angleVariation;
            
            unit.vision.currentVisionAngle = enemyAngle;
            unit.vision.targetVisionAngle = enemyAngle;
            
            // Reset all physical properties to ensure units start at rest
            unit.velocity = { x: 0, y: 0 };
            unit.currentForce = { x: 0, y: 0, magnitude: 0 };
            unit.lastForceMagnitude = 0;
            unit.targetVisionAngle = enemyAngle;
            unit.currentVisionAngle = enemyAngle;
            unit.lastVisionAngle = enemyAngle;
            
            this.units.add(unit);
        }
    }
    
    gameLoop() {
    
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
            this.view.drawSelectBox(this.dragStart.x, this.dragStart.y, this.mousePosition.x, this.mousePosition.y);
        }

        requestAnimationFrame(() => this.gameLoop());
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

        if (this.debugMode) console.log("targetX: " + targetX + " targetY: " + targetY);

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