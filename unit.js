// Tento soubor vyžaduje physics.js, který musí být načten před unit.js
// physics.js obsahuje fyzikální výpočty pro pohyb jednotek

class Unit {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.x = cfg.x;
        this.y = cfg.y;
        this.size = cfg.size || 20;
        this.isSelected = cfg.isSelected || false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.startX = this.x;
        this.startY = this.y;
        this.isEnemy = cfg.isEnemy;
        this.isDead = typeof cfg.isDead == "undefined" ? false : cfg.isDead;
        this.collisionCooldown = cfg.collisionCooldown || 0;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.health = cfg.health || 100;
        this.hasVisibleEnemies = cfg.hasVisibleEnemies || false;
        
        // Fyzikální vlastnosti
        this.mass = cfg.mass || 1;
        this.maxForce = cfg.maxForce || 0.5;
        this.velocity = { x: 0, y: 0 };
        this.currentForce = { x: 0, y: 0, magnitude: 0 };
        
        // Vytvoříme instance pomocných systémů
        this.vision = new UnitVision();
        this.combat = new UnitCombat({
            debugMode: this.debugMode,
            isEnemy: this.isEnemy,
            shootCooldown: this.shootCooldown,
            initialShotDelay: this.initialShotDelay,
            health: this.health
        });
        this.view = new UnitView(this, game.view.ctx, {
            color: this.isEnemy ? '#ff0000' : '#00ff00'
        });
    }

    calculateAvoidanceForce(otherUnit, distance) {
        // Vypočítáme směr od druhé jednotky
        const dx = this.x - otherUnit.x;
        const dy = this.y - otherUnit.y;
        
        // Normalizujeme směr
        const length = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / length;
        const dirY = dy / length;
        
        // Síla vyhýbání je úměrná blízkosti
        const minDistance = this.size + otherUnit.size;
        const avoidanceStrength = Math.max(0, 1 - distance / (minDistance * 4));
        
        // Vrátíme sílu vyhýbání
        return {
            x: dirX * avoidanceStrength * this.maxForce,
            y: dirY * avoidanceStrength * this.maxForce
        };
    }

    // Convert angle to be within ±30° of the unit's current direction
    limitForceAngle(angle) {
        const currentAngle = this.vision.currentVisionAngle;
        const maxDeviation = Math.PI / 6; // 30 degrees in radians
        
        // Normalize angles to be within -π to π
        let normalizedAngle = angle;
        while (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
        while (normalizedAngle < -Math.PI) normalizedAngle += 2 * Math.PI;
        
        // Calculate the difference between the target angle and current direction
        let angleDiff = normalizedAngle - currentAngle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        // Limit the angle difference to ±30°
        if (angleDiff > maxDeviation) angleDiff = maxDeviation;
        if (angleDiff < -maxDeviation) angleDiff = -maxDeviation;
        
        // Return the limited angle
        return currentAngle + angleDiff;
    }

    update() {
        // Pokud je jednotka mrtvá, neprovádíme žádné aktualizace
        if (this.combat.isDead) return;

        // Resetujeme stav viditelnosti nepřátel
        this.hasVisibleEnemies = false;

        // Pokud máme útočníka, otočíme se k němu
        if (this.combat.lastAttacker) {
            const attackerUnit = this.game.units.find(unit => unit.combat === this.combat.lastAttacker);
            if (attackerUnit) {
                // Vypočítáme směr k útočníkovi
                const dx = attackerUnit.x - this.x;
                const dy = attackerUnit.y - this.y;
                const angle = Math.atan2(dy, dx);
                
                // Nastavíme cílový úhel pohledu
                this.vision.currentVisionAngle = angle;
                
                // Pokud je útočník v zorném poli, střílíme na něj
                if (this.vision.isInVisionCone(attackerUnit.x, attackerUnit.y, this.x, this.y)) {
                    if (this.combat.canShoot()) {
                        this.shoot(attackerUnit);
                        this.view.startFlash();
                    }
                }
            }
        }

        // Aktualizujeme pozici
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Aktualizujeme směr pohledu
        this.vision.updateVisionAngle(this.startX, this.startY, this.targetX, this.targetY);
        
        // Resetujeme sílu
        this.currentForce = { x: 0, y: 0, magnitude: 0 };
        
        // Snížíme cooldown srážky
        if (this.collisionCooldown > 0) {
            this.collisionCooldown--;
        }

        // Snížíme cooldown střelby
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Aktualizujeme combat systém
        this.combat.update();
        
        // Aktualizujeme view systém
        this.view.update();
        
        // Kontrolujeme kolize s ostatními jednotkami
        for (const otherUnit of this.game.units) {
            if (otherUnit === this) continue;
            
            const dx = otherUnit.x - this.x;
            const dy = otherUnit.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Pokud je jednotka příliš blízko a není v cooldownu
            if (distance < this.size + otherUnit.size && this.collisionCooldown === 0) {
                // Nastavíme cooldown
                this.collisionCooldown = 30;
                
                // Odstrčíme jednotky od sebe
                const pushForce = 0.5;
                const pushX = dx / distance * pushForce;
                const pushY = dy / distance * pushForce;
                
                this.velocity.x = -pushX;
                this.velocity.y = -pushY;
                otherUnit.velocity.x = pushX;
                otherUnit.velocity.y = pushY;
                
                continue;
            }
            
            // Kontrolujeme, zda je jednotka v zrakovém poli
            const seesEnemy = this.vision.isInVisionCone(otherUnit.x, otherUnit.y, this.x, this.y);
            
            if (seesEnemy) {
                // Pokud je jednotka nepřátelská a můžeme střílet
                if (otherUnit.combat.isEnemy !== this.combat.isEnemy && !otherUnit.combat.isDead) {
                    this.hasVisibleEnemies = true;
                    // Nastavíme počáteční zpoždění při prvním spatření nepřítele
                    this.combat.setInitialDelay();
                    if (this.combat.canShoot()) {
                        this.shoot(otherUnit);
                        this.view.startFlash(); // Trigger flash effect when shooting
                    }
                }
                
                // Vypočítáme sílu pro vyhnutí se
                const avoidanceForce = this.calculateAvoidanceForce(otherUnit, distance);
                
                // Přidáme sílu pro vyhnutí se k celkové síle
                this.currentForce.x += avoidanceForce.x;
                this.currentForce.y += avoidanceForce.y;
            }
        }
        
        // Výpočet vzdálenosti k cíli
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Kontrola, zda jsme v cíli
        if (distance < 10) {
            // Jsme v cíli, zastavíme se
            this.velocity = { x: 0, y: 0 };
            this.currentForce = { x: 0, y: 0, magnitude: 0 };
            this.x = this.targetX;
            this.y = this.targetY;
            return;
        }
        
        // Výpočet směru k cíli
        const directionX = dx / distance;
        const directionY = dy / distance;
        
        // Výpočet síly k cíli
        if (distance > 10) {
            // Síla je úměrná vzdálenosti, ale maximálně maxForce
            const forceMagnitude = Math.min(this.maxForce, distance * 0.1);
            
            // Přidáme náhodné kolísání síly (20%)
            const randomVariation = 1 + (Math.random() - 0.5) * 0.4; // -30% až +30%
            const variedForceMagnitude = forceMagnitude * randomVariation;
            
            // Základní síla k cíli
            const targetForce = {
                x: directionX * variedForceMagnitude,
                y: directionY * variedForceMagnitude
            };
            
            // Kombinace síly k cíli a síly vyhýbání
            this.currentForce.x += targetForce.x * 0.7;
            this.currentForce.y += targetForce.y * 0.7;
            
            // Normalizujeme celkovou sílu
            const totalForceMagnitude = Math.sqrt(
                this.currentForce.x * this.currentForce.x + 
                this.currentForce.y * this.currentForce.y
            );
            
            if (totalForceMagnitude > this.maxForce) {
                this.currentForce.x = (this.currentForce.x / totalForceMagnitude) * this.maxForce;
                this.currentForce.y = (this.currentForce.y / totalForceMagnitude) * this.maxForce;
            }

            // Calculate the angle of the total force
            const forceAngle = Math.atan2(this.currentForce.y, this.currentForce.x);
            
            // Limit the force angle to ±30° from the unit's current direction
            const limitedAngle = this.limitForceAngle(forceAngle);
            
            // Convert the limited angle back to force components
            this.currentForce.x = Math.cos(limitedAngle) * totalForceMagnitude;
            this.currentForce.y = Math.sin(limitedAngle) * totalForceMagnitude;
            
            // Aplikace síly na rychlost
            this.velocity.x += this.currentForce.x / this.mass;
            this.velocity.y += this.currentForce.y / this.mass;
            
            // Tření
            this.velocity.x *= 0.95;
            this.velocity.y *= 0.95;
        }
    }

    select() {
        this.isSelected = true;
        if (this.debugMode) console.log("Unit selected");
        // TODO: Vykreslit indikaci že je jednotka vybraná
    }

    deselect() {
        this.isSelected = false;
        if (this.debugMode) console.log("Unit deselected");
    }

    shoot(targetUnit) {
        if (this.isDead) return; // Nemůžeme střílet, pokud jsme mrtví

        this.combat.shoot(targetUnit);
        
        // Nastavíme cooldown střelby (60 snímků = 1 sekunda při 60 FPS)
        this.shootCooldown = 60;

        // Calculate angle to target and draw muzzle flash
        const dx = targetUnit.x - this.x;
        const dy = targetUnit.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.view.drawMuzzleFlash(this.x, this.y, angle);
    }

    recieveDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        if (this.health <= 0) {
            this.isDead = true;
        }
        // TODO: Grafický efekt zásahu?
    }

    isPointInside(x, y) {
        // Mrtvé jednotky nelze vybrat
        if (this.combat.isDead) return false;

        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size;
    }
    
    isInSelectionBox(startX, startY, endX, endY) {
        // Mrtvé jednotky nelze vybrat
        if (this.combat.isDead) return false;

        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);
        
        return this.x >= left && this.x <= right && this.y >= top && this.y <= bottom;
    }

    moveTo(x, y) {
        // Uložíme startovní pozici při zadání nového cíle
        this.startX = this.x;
        this.startY = this.y;
        
        // Nastavíme cílovou pozici
        this.targetX = x;
        this.targetY = y;
    }
} 