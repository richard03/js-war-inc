class UnitMovement {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.maxSpeed = cfg.maxSpeed || 3;
        this.target = null;
        this.targetRadius = cfg.targetRadius || 3; // Poloměr, ve kterém považujeme jednotku za "u cíle"
        
        this.currentVelocity = new Vector2(0, 0);

        // this.movementStartPosition = {x: unit.x, y: unit.y};
        // this.collisionCooldown = cfg.collisionCooldown || 0;
    }

    update() {
        // Není-li nastaven cíl, neprovádíme nic
        if (!this.target) {
            return;
        }

        // Pokud je jednotka u cíle, zastavíme
        if (this.isNearTarget()) {
            this.stop();
            return;
        }

        const targetVector = new Vector2(this.target.x - this.unit.x, this.target.y - this.unit.y);
        const speed = FuzzyMath.addRandomFactor(this.maxSpeed, 0.1);

        // Pokud jednotka míří špatným směrem, musí se nejdřív otočit
        // Tolerance je 5 stupňů + úhlová rychlost otáčení
        const tolerance = Math.PI / 36 + this.unit.vision.visionRotationSpeed * 2;
        const visionAngle = this.unit.vision.currentVisionVector.getAngle();
        if ( !FuzzyMath.isClose(
                targetVector.getAngle(), 
                visionAngle,
                tolerance)
            ) {
            
            this.unit.vision.startTurningTo(this.target.x, this.target.y);
            this.currentVelocity = new Vector2(speed, 0).rotate(visionAngle);
        } else {
            this.currentVelocity = new Vector2(speed, 0).rotate(targetVector.getAngle());
        }

        // Nová pozie po update
        const newPositionVector = new Vector2(this.unit.x + this.currentVelocity.x, this.unit.y + this.currentVelocity.y);

        // Pokud terén není schůdný
        if (!this.unit.game.terrain.isTileWalkable(newPositionVector.x, newPositionVector.y)) {
            // TODO: zkusit to obejít
            this.stop();
            return;
        }
        this.unit.x = newPositionVector.x;
        this.unit.y = newPositionVector.y;

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
        const targetVector = new Vector2(this.target.x - this.unit.x, this.target.y - this.unit.y);
        // zastav do vzdálenosti targetRadius od cíle, vezmi v úvahu i rychlost.
        // Nepřejeď cíl, to by způsobilo nevhodné otáčení.
        return targetVector.length < this.targetRadius + this.currentVelocity.length;
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
        this.target = {x, y};

        // this.update does the rest
    }

    stop() {
        this.target = null;	
        this.currentVelocity = new Vector2(0, 0);
    }
}
