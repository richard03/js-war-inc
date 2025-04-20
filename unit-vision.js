if (typeof require == 'function') {
    Vector2 = require('./vector2.js');
}

/**
 * Manages unit vision and targeting.
 */
class UnitVision {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.visionRange = cfg.visionRange || 200;

        this.visionConeAngle = cfg.visionConeAngle || Math.PI * 2/3;

        this.currentVisionVector = new Vector2(this.visionRange, 0);
        this.targetVisionVector = new Vector2(this.visionRange, 0);
        this.visionRotationSpeed = cfg.visionRotationSpeed || 0.03; // Rychlost rotace zrakového pole
    
    }

    update() {
        const targetAngle = this.targetVisionVector.getAngle();
        const currentAngle = this.currentVisionVector.getAngle();

        if (FuzzyMath.isClose(currentAngle, targetAngle, this.visionRotationSpeed)) {
            this.currentVisionVector = this.targetVisionVector.clone();
            return;
        }

        // Normalizujeme úhly do rozsahu -PI až PI
        let angleDiff = targetAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Otáčíme vždy nejkratší cestou
        if (angleDiff > 0) {
            this.currentVisionVector = this.currentVisionVector.rotate(this.visionRotationSpeed);
        } else {
            this.currentVisionVector = this.currentVisionVector.rotate(-this.visionRotationSpeed);
        }
    }
    
    /**
     * Začne otáčet pohled směrem k cíli
     * @param {number} targetX - X souřadnice cíle
     * @param {number} targetY - Y souřadnice cíle
     */
    startTurningTo(targetX, targetY) {
        const targetVector = new Vector2(targetX - this.unit.x, targetY - this.unit.y);
        const targetAngle = targetVector.getAngle();
        this.targetVisionVector = new Vector2(this.visionRange, 0).rotate(targetAngle);
    }

    /**
     * Okamžitě točí pohled směrem k cíli
     * @param {number} targetX - X souřadnice cíle
     * @param {number} targetY - Y souřadnice cíle
     */
    turnTo(targetX, targetY) {
        const targetVector = new Vector2(targetX - this.unit.x, targetY - this.unit.y);
        const targetAngle = targetVector.getAngle();
        this.targetVisionVector = new Vector2(this.visionRange, 0).rotate(targetAngle);
        this.currentVisionVector = this.targetVisionVector.clone();
    }

    /**
     * Najde nejbližšího nepřítele
     * @returns {Unit} Nejblíže se nacházející nepřítel
     */
    findNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = this.visionRange;
        for (const unit of this.unit.game.units) {
            if (unit.isEnemy !== this.unit.isEnemy) {
                const targetVector = new Vector2(unit.x - this.unit.x, unit.y - this.unit.y);
                const distance = targetVector.length;
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = unit;
                }
            }
        }
        return nearestEnemy;
    }

    isInVisionCone(x, y) {
        // Vypočítáme směr k bodu
        const targetVector = new Vector2(x - this.unit.x, y - this.unit.y);
        
        // Pokud je bod příliš daleko, není v zorném poli
        if (targetVector.length > this.visionRange) {
            return false;
        }
        
        // Vypočítáme rozdíl úhlů
        let angleDiff = targetVector.getAngle() - this.currentVisionVector.getAngle();
        
        // Normalizujeme úhel do rozsahu -PI až PI
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Kontrolujeme, zda je bod v zorném poli
        return Math.abs(angleDiff) <= this.visionConeAngle / 2;
    }

    // Kontroluje, zda je v zorném poli nějaká jednotka
    checkUnitsInVisionCone() {
        this.unit.seesObstacle = false;
        for (const unit of this.unit.game.units) {
            if (this.isInVisionCone(unit.x, unit.y)) {
                this.unit.seesObstacle = true;
                break;
            }
        }
    }
    
}

if (typeof module !== 'undefined') {
    module.exports = UnitVision; 
} 