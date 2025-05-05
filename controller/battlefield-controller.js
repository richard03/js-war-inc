class BattlefieldController {
    constructor(game, model, view) {
        this.game = game;
        this.model = model;
        this.view = view;

        this.mousePosition = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.scrollSpeed = 10;
        this.scrollMargin = 50;


    }

    init() {
        if (this.game.debugMode) console.log('init battlefield controller');

        this.model.init();

        this.alliedUnits = new Set();
        this.enemyUnits = new Set();

        this.selectedUnits = new Set();

        this.view.init();
        this.resize();
        this.hide();
    }

    show() {
        this.view.show();
    }

    hide() {
        this.view.hide();
    }

    resize() {
        this.view.resize();
    }

    startBattle(selectedAlliedUnitsMVC) {

        this.show();
        this.resize();
        
        this.model.init();

        this.placeAlliedUnits(selectedAlliedUnitsMVC);

        this.createEnemyUnits();

        this.setupEventListeners();
        requestAnimationFrame(() => this.gameLoop());
    }

    placeAlliedUnits(selectedAlliedUnitsMVC) {

        // add friendly units
        const startPosition = {
            x: Math.floor(Math.random() * 400),
            y: Math.floor(Math.random() * 400)
        };
        const startAreaRadius = 400;
        const visionDirection = { x: 1, y: 1 };

        selectedAlliedUnitsMVC.forEach(unitMVC => {
            const unitStartPosition = this.model.findWalkableTile(startPosition, startAreaRadius);
            this.model.addUnitData({
                model: unitMVC.model,
                view: unitMVC.view,
                controller: unitMVC.controller,
                mapPosition: unitStartPosition,
                isEnemy: false
            });
        });
    }

    createEnemyUnits() {
        // add enemy units
        const mapSize = this.model.getMapSize();
        const startPosition = {
            x: mapSize.width - Math.floor(Math.random() * 400),
            y: mapSize.height - Math.floor(Math.random() * 400)
        };
        const startAreaRadius = 400;
        const visionDirection = { x: -1, y: -1 };
        
        // setup enemy units for this battlefield
        for (let i = 0; i < 3; i++) {
            const unitStartPosition = this.model.findWalkableTile(startPosition, startAreaRadius);
            const model = new UnitModel(this.game);
            const view = new UnitView(this.game, model);
            const controller = new UnitController(this.game, model, view);
            controller.init();
            this.model.addUnitData({
                model: model,
                view: view,
                controller: controller,
                mapPosition: unitStartPosition,
                isEnemy: true
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resize());

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
            this.clearSelection();
        }
    }

    handleMouseDown(e) {
        this.dragStart = { 
            x: e.clientX + this.model.terrain.offsetX, 
            y: e.clientY + this.model.terrain.offsetY
        };
        console.log('click');
    }

    handleMouseMove(e) {
        if (this.dragStart) {
            const dx = e.clientX + this.model.terrain.offsetX - this.dragStart.x;
            const dy = e.clientY + this.model.terrain.offsetY - this.dragStart.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.isDragging = true;
            } else {
                this.isDragging = false;
            }
        }
        
        this.mousePosition = { x: e.clientX, y: e.clientY };
        
        // If dragging, select units within the selection box
        if (this.isDragging) {
            const startX = this.dragStart.x + this.model.terrain.offsetX - this.view.canvasLeft;
            const startY = this.dragStart.y + this.model.terrain.offsetY - this.view.canvasTop;
            const endX = e.clientX + this.model.terrain.offsetX - this.view.boundingClientRectangle.left;
            const endY = e.clientY + this.model.terrain.offsetY - this.view.boundingClientRectangle.top;
            
            // Clear previous selection if shift is not pressed and we started dragging from empty space
            // const clickedUnit = Array.from(this.model.units).find(unit => unit.isPointInside(startX, startY) && !unit.isEnemy);
            // if (!e.shiftKey && !clickedUnit) {
            //     this.clearSelection();
            // }
        }
    }

    handleMouseUp(e) {
        const clickPosition = {
            x: e.clientX + this.model.terrain.offsetX/* - this.view.boundingClientRectangle.left */, 
            y: e.clientY + this.model.terrain.offsetY/* - this.view.boundingClientRectangle.top */
        };
        
        // Handle right click to clear selection
        if (e.button === 2) {
            this.clearSelection();
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
        }

        this.model.dragStart = null;

        // Click on unit
        for (const unitData of this.model.alliedUnits) {
            
            if (this.isUnitAt(unitData, clickPosition)) {
                console.log('clicked on unit', unitData);
                this.selectUnit(unitData);

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
                return;
            }
        }

        // Click on map
        console.log('clicked on map at', clickPosition);
        
        // if (this.model.debugMode) console.log("Clicked on map");
        // if (this.model.currentFormation) {
        //     this.model.currentFormation.moveTo(x, y);
        // } else {
        this.model.selectedUnits.forEach((unitData) => {
            console.log('turning unit to', clickPosition);
            this.model.startTurningUnitTo(unitData, clickPosition);
            this.model.startMovingUnitTo(unitData, clickPosition);
        });
    }

    selectUnit(unitData, retainSelection = false) {
        console.log('selectUnit', unitData);
        if (!retainSelection) {
            this.clearSelection();
        }
        unitData.isSelected = true;
        this.model.selectedUnits.add(unitData);
    }

    clearSelection() {
        this.model.selectedUnits.forEach(unitData => {
            unitData.isSelected = false;
        });
        this.model.selectedUnits.clear();
    }

    
    /**
     * Checks if the unit is at a given position
     * @param {Object} position - The position to check
     * @returns {boolean} True if the unit is at the position, false otherwise
     */
    isUnitAt(unitData, scrPosition) {
        
        const leftTop = {
            x: unitData.mapPosition.x - unitData.model.size / 2,
            y: unitData.mapPosition.y - unitData.model.size / 2
        };

        const rightBottom = {
            x: unitData.mapPosition.x + unitData.model.size / 2,
            y: unitData.mapPosition.y + unitData.model.size / 2
        };
        const result = scrPosition.x >= leftTop.x && scrPosition.x <= rightBottom.x &&
               scrPosition.y >= leftTop.y && scrPosition.y <= rightBottom.y;
        return result;
    }

    /**
     * Checks if the mouse is near the edge of the canvas 
     * and scrolls the terrain if it is
     */
    scroll() {
        const { mousePosition, scrollSpeed, scrollMargin } = this;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        
        let x = 0;
        let y = 0;

        if (mousePosition.x < scrollMargin) {
            x += scrollSpeed;
        } else if (mousePosition.x > winW - scrollMargin) {
            x -= scrollSpeed;
        }
        
        if (mousePosition.y < scrollMargin) {
            y += scrollSpeed;
        } else if (mousePosition.y > winH - scrollMargin) {
            y -= scrollSpeed;
        }

        this.model.shiftMap(x, y);
    }

    gameLoop() {
        this.scroll();
        this.view.draw(this.model.terrain);

        // TODO: this gives allied units the advantage of a first action - should be mitigated somehow
        // TODO: randomizing the fire delay may fix that
        for (const unitData of this.model.alliedUnits) {
            unitData.model.update();
            this.model.updateUnitMovement(unitData);
            this.view.drawUnit(unitData);
        }
        for (const unitData of this.model.enemyUnits) {
            unitData.model.update();
            this.model.updateUnitMovement(unitData);
            this.view.drawUnit(unitData);
        }
        requestAnimationFrame(() => this.gameLoop());
    }


    

    // /**
    //  * Najde nejbližšího nepřítele
    //  * @returns {Unit} Nejblíže se nacházející nepřítel
    //  */
    // findNearestEnemy() {
    //     let nearestEnemy = null;
    //     let minDistance = this.visionRange;
    //     for (const unit of this.unit.game.units) {
    //         if (unit.isEnemy !== this.unit.isEnemy) {
    //             const targetVector = new Vector2(unit.x - this.unit.x, unit.y - this.unit.y);
    //             const distance = targetVector.length;
    //             if (distance < minDistance) {
    //                 minDistance = distance;
    //                 nearestEnemy = unit;
    //             }
    //         }
    //     }
    //     return nearestEnemy;
    // }

    // isInVisionCone(x, y) {
    //     // Vypočítáme směr k bodu
    //     const targetVector = new Vector2(x - this.unit.x, y - this.unit.y);
        
    //     // Pokud je bod příliš daleko, není v zorném poli
    //     if (targetVector.length > this.visionRange) {
    //         return false;
    //     }
        
    //     // Vypočítáme rozdíl úhlů
    //     let angleDiff = targetVector.getAngle() - this.currentVisionVector.getAngle();
        
    //     // Normalizujeme úhel do rozsahu -PI až PI
    //     while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    //     while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
    //     // Kontrolujeme, zda je bod v zorném poli
    //     return Math.abs(angleDiff) <= this.visionConeAngle / 2;
    // }

    // // Kontroluje, zda je v zorném poli nějaká jednotka
    // checkUnitsInVisionCone() {
    //     this.unit.seesObstacle = false;
    //     for (const unit of this.unit.game.units) {
    //         if (this.isInVisionCone(unit.x, unit.y)) {
    //             this.unit.seesObstacle = true;
    //             break;
    //         }
    //     }
    // }
    
}
