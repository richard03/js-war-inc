class BattlefieldView {
    constructor(game, model) {
        this.game = game;
        this.model = model;

        this.canvas = null;
        this.viewContext = null;
        this.boundingClientRectangle = null;
       
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.viewContext = this.canvas.getContext('2d');
        this.boundingClientRectangle = this.canvas.getBoundingClientRect();

    }

    show() {
        this.canvas.style.display = 'block';
    }

    hide() {
        this.canvas.style.display = 'none';
    }

    clear() {
        this.viewContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.boundingClientRectangle = this.canvas.getBoundingClientRect();
        
        // // Update canvas dimensions for all units
        // for (const unit of this.units) {
        //     unit.canvasWidth = this.canvas.width;
        //     unit.canvasHeight = this.canvas.height;
        // }
    }

    draw(terrainData) {
        this.clear();
        this.drawTerrain(terrainData);
        // TODO: draw units
    }

    drawSelectBox(startX, startY, endX, endY) {
        this.viewContext.strokeStyle = 'white';
        this.viewContext.lineWidth = 2;
        this.viewContext.strokeRect(startX, startY, endX - startX, endY - startY);
    }


    drawTerrain(terrainData) {
        
        // Výpočet viditelné oblasti
        const viewport = this.getViewportData(terrainData);
        
        // Výpočet offsetu pro plynulý posun
        const offsetX = terrainData.offsetX % terrainData.tileSize;
        const offsetY = terrainData.offsetY % terrainData.tileSize;
        
        for (let y = viewport.startY; y < viewport.endY; y++) {
            for (let x = viewport.startX; x < viewport.endX; x++) {
                const height = terrainData.map[y][x];
                
                // Výpočet pozice dlaždice s ohledem na offset
                const screenX = (x - viewport.startX) * terrainData.tileSize - offsetX;
                const screenY = (y - viewport.startY) * terrainData.tileSize - offsetY;

                if (this.game.debugMode) {
                    this.viewContext.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    this.viewContext.lineWidth = 0.5;
                    this.viewContext.strokeRect(
                        screenX, 
                        screenY, 
                        terrainData.tileSize, 
                        terrainData.tileSize);
                }
                
                // Barva podle výšky
                const color = this.getHeightColor(height);
                this.viewContext.fillStyle = color;
                this.viewContext.fillRect(
                    screenX, 
                    screenY, 
                    terrainData.tileSize, 
                    terrainData.tileSize);
                
                // Debug - zobrazení výšky
                if (this.game.debugMode) {
                    this.viewContext.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.viewContext.font = '12px Arial';
                    this.viewContext.fillText(
                        height.toFixed(2), 
                        screenX + 2, 
                        screenY + 10);
                }
            }
        }
    }

    /**
     * Draws a unit on the battlefield
     * @param {Object} unitData - The unit data
     * @param {Object} unitData.model - The model of the unit
     * @param {Object} unitData.view - The view of the unit
     * @param {Object} unitData.mapPosition - The position of the unit on the map
     * @param {boolean} unitData.isSelected - Whether the unit is selected
     */
    drawUnit(unitData) {
        // Výpočet pozice jednotky s ohledem na offset terénu
        const terrainData = this.model.terrain;
        const screenPos = {
            x: unitData.mapPosition.x - terrainData.offsetX,
            y: unitData.mapPosition.y - terrainData.offsetY
        }
            
        // // Kontrola, zda je jednotka viditelná
        // const viewportSize = this.getViewportSize();
        // if (screenPos.x < -unitData.model.size || screenPos.x > viewportSize.width + unitData.model.size ||
        //     screenPos.y < -unitData.model.size || screenPos.y > viewportSize.height + unitData.model.size) {
        //     return; // Jednotka není viditelná
        // }

        // Pokud je jednotka zničena, vykreslíme ji s nižší průhledností
        if (unitData.model.isDead) {
            this.viewContext.save();
            this.viewContext.globalAlpha = 0.5; // Zničené jednotky jsou průhlednější
        }

        const cfg = {
            displayHealth: unitData.model.health > 0, // display health only if unit is not dead
            isSelected: unitData.isSelected || false
        }
        unitData.view.drawUnit(screenPos, this.viewContext, cfg);
        
        /*
        // Vykreslíme jednotku
        this.drawUnitSprite(unitData);
        
        // Vykreslíme ukazatel zdraví
        this.drawHealth(unitData);

        // Vykreslíme ukazatel výběru
        this.drawSelection(unitData);

        // Vykreslíme oheň a kouř poškozených a zničených jednotek
        this.drawFire(unitData);
        this.drawSmoke(unitData);

        // Vykreslíme debug info
        this.drawDebugInfo(unitData);
        */
    }

    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    getViewportData(terrainData) {
        const startX = Math.floor(terrainData.offsetX / terrainData.tileSize);
        const startY = Math.floor(terrainData.offsetY / terrainData.tileSize);
        const endX = Math.min(terrainData.mapWidth, startX + Math.ceil(this.canvas.width / terrainData.tileSize) + 1);
        const endY = Math.min(terrainData.mapHeight, startY + Math.ceil(this.canvas.height / terrainData.tileSize) + 1);

        return {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            width: endX - startX,
            height: endY - startY
        }

        // return {
        //     width: this.canvas.width,
        //     height: this.canvas.height
        // }
    }

    // Pomocná funkce pro získání barvy pro danou výšku
    getHeightColor(height) {
        // Barvy pro různé výšky (tmavší odstíny)
        const colors = [
            { height: 0.0, color: '#112266' },   // Modrá (voda)
            { height: 0.3, color: '#2d4d00' },   // Tmavá zelená
            { height: 0.5, color: '#3d6600' },   // Střední zelená
            { height: 0.7, color: '#4d3300' },   // Tmavá hnědá
            { height: 1.0, color: '#663300' }    // Velmi tmavá hnědá (hora)
        ];

        // V debug módu použijeme přesnou barvu bez interpolace
        if (this.game.debugMode) {
            for (let i = 0; i < colors.length - 1; i++) {
                if (height <= colors[i + 1].height) {
                    return colors[i].color;
                }
            }
            return colors[colors.length - 1].color;
        }

        // Normální režim s interpolací
        let lowerColor = colors[0];
        let upperColor = colors[colors.length - 1];

        for (let i = 0; i < colors.length - 1; i++) {
            if (height >= colors[i].height && height <= colors[i + 1].height) {
                lowerColor = colors[i];
                upperColor = colors[i + 1];
                break;
            }
        }

        const range = upperColor.height - lowerColor.height;
        const factor = (height - lowerColor.height) / range;

        const lowerRGB = BattlefieldView.hexToRgb(lowerColor.color);
        const upperRGB = BattlefieldView.hexToRgb(upperColor.color);

        const r = Math.round(lowerRGB.r + (upperRGB.r - lowerRGB.r) * factor);
        const g = Math.round(lowerRGB.g + (upperRGB.g - lowerRGB.g) * factor);
        const b = Math.round(lowerRGB.b + (upperRGB.b - lowerRGB.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Pomocná funkce pro převod hex na RGB
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}


