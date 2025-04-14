class Formation {
    constructor(units) {
        this.units = units;
        this.centerX = 0;
        this.centerY = 0;
        this.unitOffsets = new Map();
        
        // Vypočítáme střed formace a offset pro každou jednotku
        this.updateCenter();
        this.calculateOffsets();
    }

    updateCenter() {
        // Vypočítáme střed formace
        this.centerX = this.units.reduce((sum, unit) => sum + unit.x, 0) / this.units.length;
        this.centerY = this.units.reduce((sum, unit) => sum + unit.y, 0) / this.units.length;
    }

    calculateOffsets() {
        // Pro každou jednotku vypočítáme její offset od středu
        this.unitOffsets.clear();
        for (const unit of this.units) {
            this.unitOffsets.set(unit, {
                x: unit.x - this.centerX,
                y: unit.y - this.centerY
            });
        }
    }

    moveTo(x, y) {
        // Aktualizujeme střed formace
        this.centerX = x;
        this.centerY = y;
        
        // Pro každou jednotku nastavíme cílovou pozici s ohledem na její offset
        for (const unit of this.units) {
            const offset = this.unitOffsets.get(unit);
            unit.moveTo(x + offset.x, y + offset.y);
        }
    }

    update() {
        // Aktualizujeme střed formace
        this.updateCenter();
        
        // Kontrolujeme, zda se jednotky příliš nevzdálily od svých offsetů
        let needsRecalculation = false;
        for (const unit of this.units) {
            const offset = this.unitOffsets.get(unit);
            const currentOffsetX = unit.x - this.centerX;
            const currentOffsetY = unit.y - this.centerY;
            
            // Pokud se jednotka příliš vzdálila od svého offsetu, potřebujeme přepočítat
            const distance = Math.sqrt(
                Math.pow(currentOffsetX - offset.x, 2) + 
                Math.pow(currentOffsetY - offset.y, 2)
            );
            
            if (distance > 10) { // Tolerance 10 pixelů
                needsRecalculation = true;
                break;
            }
        }
        
        if (needsRecalculation) {
            this.calculateOffsets();
        }
    }

    draw(ctx) {
        // Vykreslíme střed formace
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        
        // Vykreslíme spojnice mezi jednotkami
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.units.length; i++) {
            for (let j = i + 1; j < this.units.length; j++) {
                ctx.moveTo(this.units[i].x, this.units[i].y);
                ctx.lineTo(this.units[j].x, this.units[j].y);
            }
        }
        ctx.stroke();
    }
} 