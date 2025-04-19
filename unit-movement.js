class UnitMovement {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.targetRadius = cfg.targetRadius || 20; // Poloměr, ve kterém považujeme jednotku za "u cíle"
        this.startX = this.unit.x;
        this.startY = this.unit.y;
        this.maxVelocity = cfg.maxVelocity || 3;
        this.currentVelocity = new Vector2(0, 0);
        this.collisionCooldown = cfg.collisionCooldown || 0;
    }

    update() {
        
        const newX = this.unit.x + this.currentVelocity.x;
        const newY = this.unit.y + this.currentVelocity.y;
        
        if (this.unit.game.terrain.isTileWalkable(newX, newY)) {
            this.unit.x = newX;
            this.unit.y = newY;
        } else {
            this.stop();
        }

        if (this.isNearTarget()) {
            this.stop();
        }
        
        // Snížíme cooldown srážky
        // if (this.collisionCooldown > 0) {
        //     this.collisionCooldown--;
        // }
        
        // Kontrolujeme kolize s ostatními jednotkami
        // for (const otherUnit of this.unit.game.units) {
        //     if (otherUnit === this.unit) continue;
            
        //     const dx = otherUnit.x - this.unit.x;
        //     const dy = otherUnit.y - this.unit.y;
        //     const distance = Math.sqrt(dx * dx + dy * dy);
            
        //     // Pokud je jednotka příliš blízko a není v cooldownu
        //     if (distance < this.unit.size + otherUnit.size && this.collisionCooldown === 0) {
        //         // Nastavíme cooldown
        //         this.collisionCooldown = 30;
                
        //         // Odstrčíme jednotky od sebe
        //         const pushForce = 0.5;
        //         const pushX = dx / distance * pushForce;
        //         const pushY = dy / distance * pushForce;
                
        //         this.unit.velocity.x = -pushX;
        //         this.unit.velocity.y = -pushY;
        //         otherUnit.velocity.x = pushX;
        //         otherUnit.velocity.y = pushY;
                
        //         continue;
        //     }
        // }
    }

    isNearTarget() {
        const targetVector = new Vector2(
            this.unit.targetX - this.unit.x, 
            this.unit.targetY - this.unit.y
        );
        return targetVector.length < this.targetRadius;
    }

    // calculateAvoidanceForce(otherUnit, distance) {
    //     // Vypočítáme směr od druhé jednotky
    //     const dx = this.unit.x - otherUnit.x;
    //     const dy = this.unit.y - otherUnit.y;
        
    //     // Normalizujeme směr
    //     const length = Math.sqrt(dx * dx + dy * dy);
    //     const dirX = dx / length;
    //     const dirY = dy / length;
        
    //     // Síla vyhýbání je úměrná blízkosti
    //     const minDistance = this.unit.size + otherUnit.size;
    //     const avoidanceStrength = Math.max(0, 1 - distance / (minDistance * 4));
        
    //     // Vrátíme sílu vyhýbání
    //     return {
    //         x: dirX * avoidanceStrength * this.unit.maxForce,
    //         y: dirY * avoidanceStrength * this.unit.maxForce
    //     };
    // }

    // limitForceAngle(angle) {
    //     const currentAngle = this.unit.vision.currentVisionAngle;
    //     const maxDeviation = Math.PI / 6; // 30 degrees in radians
        
    //     // Normalize angles to be within -π to π
    //     let normalizedAngle = angle;
    //     while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
    //     while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
    //     // Calculate the difference between the target angle and current direction
    //     let angleDiff = normalizedAngle - currentAngle;
    //     while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    //     while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
    //     // Limit the angle difference to ±30°
    //     if (angleDiff > maxDeviation) angleDiff = maxDeviation;
    //     if (angleDiff < -maxDeviation) angleDiff = -maxDeviation;
        
    //     // Return the limited angle
    //     return currentAngle + angleDiff;
    // }

    

    turnToLastAttacker() {
        // For now it turns only vision, no movement required
    }

    moveTo(x, y) {
        this.startX = this.unit.x;
        this.startY = this.unit.y;

        this.unit.targetX = x;
        this.unit.targetY = y;

        const targetVector = new Vector2(x - this.unit.x, y - this.unit.y);
        
        this.currentVelocity = new Vector2(this.maxVelocity, 0).rotate(targetVector.getAngle());

        // this.update does the rest
    }

    stop() {
        this.currentVelocity = new Vector2(0, 0);
    }
}
