class BattlefieldController {
    constructor(game) {
        this.game = game;
        this.model = game.model.battlefield;
        this.view = game.view.battlefield;

        this.units = null;

        this.mousePosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.scrollSpeed = 10;
        this.scrollMargin = 50;

    }

    init() {
        this.model.init();
        this.view.init();

        // this.units = new Set();
        // TODO: init units

        this.setupEventListeners();
        requestAnimationFrame(() => this.gameLoop());
    }

    show() {
        this.view.show();
    }

    hide() {
        this.view.hide();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.view.resize());

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));

        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Prevent context menu on right click
        this.view.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    handleKeyDown(e) {
        // Clear selection
        if (e.key === 'Escape') {
            this.model.clearSelection();
        }
    }

    handleMouseDown(e) {
        this.dragStart = { 
            x: e.clientX + this.model.terrain.xOffset, 
            y: e.clientY + this.model.terrain.yOffset
        };
    }

    handleMouseMove(e) {
        if (this.dragStart) {
            const dx = e.clientX + this.model.terrain.xOffset - this.dragStart.x;
            const dy = e.clientY + this.model.terrain.yOffset - this.dragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.isDragging = true;
            } else {
                this.isDragging = false;
            }
        }
        
        this.mousePosition = { x: e.clientX, y: e.clientY };
        
        // If dragging, select units within the selection box
        if (this.isDragging) {
            const startX = this.dragStart.x + this.model.terrain.xOffset - this.view.canvasLeft;
            const startY = this.dragStart.y + this.model.terrain.yOffset - this.view.canvasTop;
            const endX = e.clientX + this.model.terrain.xOffset - this.view.boundingClientRectangle.left;
            const endY = e.clientY + this.model.terrain.yOffset - this.view.boundingClientRectangle.top;
            
            // Clear previous selection if shift is not pressed and we started dragging from empty space
            const clickedUnit = Array.from(this.model.units).find(unit => unit.isPointInside(startX, startY) && !unit.isEnemy);
            if (!e.shiftKey && !clickedUnit) {
                this.model.clearSelection();
            }
        }
    }

    handleMouseUp(e) {
        const x = e.clientX + this.model.terrain.xOffset - this.view.boundingClientRectangle.left;
        const y = e.clientY + this.model.terrain.yOffset - this.view.boundingClientRectangle.top;
        
        // Handle right click to clear selection
        if (e.button === 2) {
            this.model.clearSelection();
            this.dragStart = null;
            this.isDragging = false;
            return;
        }

        // Left mouse button
        if (this.model.debugMode) console.log("Left mouse button");

        // Area selection
        if (this.isDragging) {
            // Select friendly units within the selection box
            // for (const unit of this.model.units) {
            //     if (!unit.isEnemy && unit.isInSelectionBox(this.dragStart.x, this.dragStart.y, x, y)) {
            //         unit.select();
            //         this.model.selectedUnits.add(unit);
            //     }
            // }
            // if (this.model.selectedUnits.size > 1) {
            //     this.model.currentFormation = new Formation(Array.from(this.model.selectedUnits));
            // }
            if (this.model.debugMode) console.log("Drag end");
            this.dragStart = null;
            this.isDragging = false;
            return;
        }

        this.model.dragStart = null;

        // Click on unit
        // for (const unit of this.model.units) {
        //     if (unit.isPointInside(x, y) && !unit.isEnemy) {
        //         if (!e.shiftKey) {
        //             this.model.clearSelection();
        //             unit.select();
        //             this.model.selectedUnits.add(unit);
        //         } else {
        //             this.model.selectedUnits.add(unit);
        //             unit.select();
        //             if (this.model.selectedUnits.size > 1) {
        //                 this.model.currentFormation = new Formation(Array.from(this.model.selectedUnits));
        //             }
        //         }
        //         if (this.model.debugMode) console.log("Selected a friendly unit");
        //         return;
        //     }
        // }

        // Click on map
        // if (this.model.debugMode) console.log("Clicked on map");
        // if (this.model.currentFormation) {
        //     this.model.currentFormation.moveTo(x, y);
        // } else {
        //     this.model.selectedUnits.forEach((unit) => {
        //         if (this.model.debugMode) console.log("Moving unit to [" + x + " : " + y + "]");
        //         unit.vision.startTurningTo(x, y);
        //         unit.moveTo(x, y);
        //     });
        // }
    }

    /**
     * Checks if the mouse is near the edge of the canvas 
     * and scrolls the terrain if it is
     */
    scroll() {
        const { mousePosition, scrollSpeed, scrollMargin } = this;
        const { canvasWidth, canvasHeight } = this.view;
        let x = 0;
        let y = 0;
        
        if (mousePosition.x < scrollMargin) {
            x += scrollSpeed;
        } else if (mousePosition.x > canvasWidth - scrollMargin) {
            x -= scrollSpeed;
        }
        
        if (mousePosition.y < scrollMargin) {
            y += scrollSpeed;
        } else if (mousePosition.y > canvasHeight - scrollMargin) {
            y -= scrollSpeed;
        }

        this.model.shiftTerrain(x, y);
    }

    gameLoop() {
        this.scroll();
        this.view.draw(this.model.terrain);
        // for (const unit of this.model.units) {
        //     unit.view.draw();
        // }
        requestAnimationFrame(() => this.gameLoop());
    }

    clearSelection() {
        // this.model.selectedUnits.forEach(unit => unit.deselect());
        // this.model.selectedUnits.clear();
        //this.model.currentFormation = null;
    }
} 