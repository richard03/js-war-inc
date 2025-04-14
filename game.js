class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.units = [];
        this.selectedUnits = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragEnd = { x: 0, y: 0 };
        this.hasMoved = false;  // Track if mouse has moved since mousedown
        this.formations = new Map();
        this.currentFormation = null;
        
        // Inicializace v správném pořadí
        this.resizeCanvas();
        this.setupEventListeners();
        this.createInitialUnits();
        
        // Spuštění herní smyčky až po inicializaci
        requestAnimationFrame(() => this.gameLoop());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Aktualizujeme rozměry canvasu u všech jednotek
        for (const unit of this.units) {
            unit.canvasWidth = this.canvas.width;
            unit.canvasHeight = this.canvas.height;
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add Escape key listener
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            // Handle right click to clear selection
            if (e.button === 2) { // Right mouse button
                this.clearSelection();
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.isDragging = true;
            this.hasMoved = false;
            this.dragStart = { x: e.clientX, y: e.clientY };
            
            // Check if we clicked on a unit
            const clickedUnit = this.units.find(unit => unit.isPointInside(x, y));
            
            if (clickedUnit) {
                // If shift is not pressed, clear previous selection
                if (!e.shiftKey) {
                    this.clearSelection();
                }
                
                clickedUnit.isSelected = true;
                if (!this.selectedUnits.has(clickedUnit)) {
                    this.selectedUnits.add(clickedUnit);
                }
                
                // If we have more than one unit selected, create a formation
                if (this.selectedUnits.size > 1) {
                    this.currentFormation = new Formation(Array.from(this.selectedUnits));
                }
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                // Mark that the mouse has moved during drag
                const dx = e.clientX - this.dragStart.x;
                const dy = e.clientY - this.dragStart.y;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    this.hasMoved = true;
                }
            }
            
            this.mousePosition = { x: e.clientX, y: e.clientY };
            
            // If dragging, select units within the selection box
            if (this.isDragging && this.hasMoved) {
                const rect = this.canvas.getBoundingClientRect();
                const startX = this.dragStart.x - rect.left;
                const startY = this.dragStart.y - rect.top;
                const endX = e.clientX - rect.left;
                const endY = e.clientY - rect.top;
                
                // Clear previous selection if shift is not pressed and we started dragging from empty space
                const clickedUnit = this.units.find(unit => unit.isPointInside(startX, startY));
                if (!e.shiftKey && !clickedUnit) {
                    this.clearSelection();
                }
                
                // Select units within the selection box
                for (const unit of this.units) {
                    if (unit.isInSelectionBox(startX, startY, endX, endY)) {
                        unit.isSelected = true;
                        if (!this.selectedUnits.has(unit)) {
                            this.selectedUnits.add(unit);
                        }
                    }
                }
                
                // Create formation if multiple units are selected
                if (this.selectedUnits.size > 1) {
                    this.currentFormation = new Formation(Array.from(this.selectedUnits));
                }
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // If we didn't move during drag and clicked on empty space, move units
            if (!this.hasMoved && this.selectedUnits.size > 0) {
                const clickedUnit = this.units.find(unit => unit.isPointInside(x, y));
                if (!clickedUnit) {
                    if (this.currentFormation) {
                        this.currentFormation.moveTo(x, y);
                    } else {
                        this.moveSelectedUnitsTo(x, y);
                    }
                }
            }
            
            this.isDragging = false;
            this.hasMoved = false;
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    createInitialUnits() {
        // Create initial units
        const unitCount = 5;
        for (let i = 0; i < unitCount; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const unit = new Unit(x, y, this.canvas.width, this.canvas.height);
            
            // Reset all physical properties to ensure units start at rest
            unit.velocity = { x: 0, y: 0 };
            unit.currentForce = { x: 0, y: 0, magnitude: 0 };
            unit.lastForceMagnitude = 0;
            unit.targetVisionAngle = 0;
            unit.currentVisionAngle = 0;
            unit.lastVisionAngle = 0;
            
            this.units.push(unit);
        }
    }
    
    selectUnitAt(x, y) {
        // Deselect all units first
        for (const unit of this.units) {
            unit.isSelected = false;
        }
        this.selectedUnits.clear();
        this.currentFormation = null;
        
        // Select the clicked unit
        for (const unit of this.units) {
            if (unit.isPointInside(x, y)) {
                unit.isSelected = true;
                this.selectedUnits.add(unit);
                break;
            }
        }
    }
    
    moveSelectedUnitsTo(x, y) {
        if (this.currentFormation) {
            this.currentFormation.moveTo(x, y);
        } else {
            for (const unit of this.selectedUnits) {
                unit.moveTo(x, y);
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw units
        for (const unit of this.units) {
            unit.update(this.units);
            unit.draw(this.ctx);
        }
        
        // Update and draw formation if it exists
        if (this.currentFormation) {
            this.currentFormation.update();
            this.currentFormation.draw(this.ctx);
        }
        
        // Draw selection box if dragging
        if (this.isDragging) {
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                this.dragStart.x,
                this.dragStart.y,
                this.mousePosition.x - this.dragStart.x,
                this.mousePosition.y - this.dragStart.y
            );
        }
    }
    
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    clearSelection() {
        for (const unit of this.units) {
            unit.isSelected = false;
        }
        this.selectedUnits.clear();
        this.currentFormation = null;
    }

    handleClick(x, y) {
        // Pokud je aktivní výběr, přesuneme vybrané jednotky
        if (this.selectionBox.isActive) {
            const selectedUnits = this.units.filter(unit => unit.isSelected);
            if (selectedUnits.length > 0) {
                // Pro každou vybranou jednotku nastavíme cíl s ohledem na formaci
                selectedUnits.forEach(unit => {
                    unit.moveTo(x, y, selectedUnits);
                });
            }
            this.selectionBox.isActive = false;
        } else {
            // Kontrola, zda jsme klikli na jednotku
            const clickedUnit = this.units.find(unit => unit.isPointInside(x, y));
            
            if (clickedUnit) {
                // Pokud je stisknutý Shift, přidáme jednotku k výběru
                if (this.isShiftPressed) {
                    clickedUnit.isSelected = !clickedUnit.isSelected;
                } else {
                    // Jinak vybereme pouze tuto jednotku
                    this.units.forEach(unit => unit.isSelected = false);
                    clickedUnit.isSelected = true;
                }
            } else {
                // Pokud jsme klikli na prázdné místo a není stisknutý Shift, zrušíme výběr
                if (!this.isShiftPressed) {
                    this.units.forEach(unit => unit.isSelected = false);
                }
            }
        }
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 