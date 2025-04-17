class UnitVision {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.visionRange = cfg.visionRange || 800;
        this.visionConeAngle = cfg.visionConeAngle || Math.PI * 2/3;
        this.currentVisionAngle = this.visionConeAngle;
        this.targetVisionAngle = this.visionConeAngle;
        this.visionRotationSpeed = cfg.visionRotationSpeed || 0.1; // Rychlost rotace zrakového pole
        this.seesObstacle = false;
    }

    update() {
        
        if (this.unit.targetX !== this.unit.x || this.unit.targetY !== this.unit.y) {
            
            this.updateVisionAngle(
                this.unit.x,
                this.unit.y, 
                this.unit.targetX, 
                this.unit.targetY
            );
        }
    }
    
    faceTarget(targetX, targetY) {
        const dx = targetX - this.unit.x;
        const dy = targetY - this.unit.y;
        this.targetVisionAngle = Math.atan2(dy, dx);
    }

    // Aktualizuje směr pohledu
    updateVisionAngle(startX, startY, targetX, targetY) {
        // Vypočítáme směr pohledu z počáteční pozice k cíli
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Nastavíme cílový úhel pohledu
            this.targetVisionAngle = Math.atan2(dy, dx);
            
            // Plynulá interpolace mezi aktuálním a cílovým úhlem
            let angleDiff = this.targetVisionAngle - this.currentVisionAngle;
            
            // Normalizujeme rozdíl úhlů do rozsahu -PI až PI
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Interpolujeme úhel
            this.currentVisionAngle += angleDiff * this.visionRotationSpeed;
        }
    }

    isInVisionCone(x, y) {
        // Vypočítáme směr k bodu
        const dx = x - this.unit.x;
        const dy = y - this.unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Pokud je bod příliš daleko, není v zorném poli
        if (distance > this.visionRange) {
            return false;
        }
        
        // Vypočítáme úhel k bodu
        const angle = Math.atan2(dy, dx);
        
        // Vypočítáme rozdíl úhlů
        let angleDiff = angle - this.currentVisionAngle;
        
        // Normalizujeme úhel do rozsahu -PI až PI
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Kontrolujeme, zda je bod v zorném poli
        return Math.abs(angleDiff) <= this.visionConeAngle / 2;
    }

    // Kontroluje, zda je v zorném poli nějaká jednotka
    checkUnitsInVisionCone() {
        this.seesObstacle = false;
        for (const unit of this.unit.game.units) {
            if (this.isInVisionCone(unit.x, unit.y)) {
                this.seesObstacle = true;
                break;
            }
        }
    }
} 