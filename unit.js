// Tento soubor vyžaduje physics.js, který musí být načten před unit.js
// physics.js obsahuje fyzikální výpočty pro pohyb jednotek

class Unit {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.x = cfg.x;
        this.y = cfg.y;
        this.size = cfg.size || 20;
        this.personalSpace = cfg.personalSpace || 40;
        this.isSelected = cfg.isSelected || false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.startX = this.x;
        this.startY = this.y;
        this.isEnemy = cfg.isEnemy;
        this.isDead = typeof cfg.isDead == "undefined" ? false : cfg.isDead;
        this.isOnFire = typeof cfg.isOnFire == "undefined" ? false : cfg.isOnFire;
        this.collisionCooldown = cfg.collisionCooldown || 0;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.health = cfg.health || 100;
        this.hasVisibleEnemies = cfg.hasVisibleEnemies || false;
        this.lastAttacker = null;
        this.seesObstacle = false;
        
        // Konstanty pro pohyb a cílení
        this.TARGET_RADIUS = 20; // Poloměr, ve kterém považujeme jednotku za "u cíle"
        
        // Fyzikální vlastnosti
        this.mass = cfg.mass || 1;
        this.maxForce = cfg.maxForce || 0.5;
        this.velocity = { x: 0, y: 0 };
        this.currentForce = { x: 0, y: 0, magnitude: 0 };
        
        // Vytvoříme instance pomocných systémů
        this.vision = new UnitVision(this, game.view.ctx);
        this.view = new UnitView(this, game.view.ctx, {
            color: this.isEnemy ? '#ff0000' : '#00ff00'
        });
        this.audio = new AudioSystem({debugMode: this.debugMode});

        // Formation cohesion properties
        this.formationCohesionRadius = 50; // Distance to maintain from other units in formation
        this.formationCohesionForce = 0.5; // Strength of cohesion force
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
        // Pokud je jednotka zničena, pouze aktualizujeme oheň
        if (this.isDead) {
            this.isOnFire = true; // Zničené jednotky vždy hoří
            return;
        }

        // Resetujeme stav viditelnosti nepřátel
        this.hasVisibleEnemies = false;

        // Výpočet vzdálenosti k cíli
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Pokud máme útočníka, otočíme se k němu
        if (this.lastAttacker && !this.lastAttacker.isDead) {
            this.turnToLastAttacker();
            
            if (this.vision.isInVisionCone(this.lastAttacker.x, this.lastAttacker.y)) {
                if (this.canShoot()) {
                    this.shoot(this.lastAttacker);
                }
            }
        } else if (distance > this.TARGET_RADIUS) {
            // Aktualizujeme směr pohledu pouze pokud nemáme útočníka a nejsme u cíle
            this.vision.updateVisionAngle(this.targetX, this.targetY);
        }
        
        // Aktualizujeme pozici
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
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

        // Snížíme počáteční zpoždění
        if (this.initialShotDelay > 0) {
            this.initialShotDelay--;
        }
        
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
            const seesEnemy = this.vision.isInVisionCone(otherUnit.x, otherUnit.y);
            
            if (seesEnemy) {
                // Pokud je jednotka nepřátelská a můžeme střílet
                if (otherUnit.isEnemy !== this.isEnemy && !otherUnit.isDead) {
                    this.hasVisibleEnemies = true;
                    
                    // Pokud nemáme útočníka, začneme se otáčet k nepříteli
                    if (!this.lastAttacker || this.lastAttacker.isDead) {
                        const targetAngle = Math.atan2(dy, dx);
                        let angleDiff = targetAngle - this.vision.currentVisionAngle;
                        
                        // Normalizujeme rozdíl úhlů do rozsahu -PI až PI
                        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                        
                        // Interpolujeme úhel s rychlostí rotace
                        this.vision.currentVisionAngle += angleDiff * 0.1;
                        
                        // Normalizujeme výsledný úhel
                        while (this.vision.currentVisionAngle > Math.PI) this.vision.currentVisionAngle -= 2 * Math.PI;
                        while (this.vision.currentVisionAngle < -Math.PI) this.vision.currentVisionAngle += 2 * Math.PI;
                        
                        // Aktualizujeme cílový úhel
                        this.vision.targetVisionAngle = targetAngle;
                    }
                    
                    // Nastavíme počáteční zpoždění při prvním spatření nepřítele
                    if (!this.hasSeenEnemy) {
                        this.initialShotDelay = 120; // 2 sekundy při 60 FPS
                        this.hasSeenEnemy = true;
                    }
                    if (this.canShoot()) {
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
        
        // Fuzzy logika pro detekci dosažení cíle
        const MIN_DISTANCE_CHANGE = 1; // Minimální změna vzdálenosti pro detekci vzdalování
        
        // Pokud jsme blízko cíle
        if (distance < this.TARGET_RADIUS) {
            // Pokud nemáme uloženou předchozí vzdálenost, uložíme ji
            if (typeof this.previousDistance === 'undefined') {
                this.previousDistance = distance;
            }
            
            // Pokud se začínáme vzdalovat od cíle
            if (distance > this.previousDistance + MIN_DISTANCE_CHANGE) {
                // Zastavíme se na aktuální pozici
                this.velocity = { x: 0, y: 0 };
                this.currentForce = { x: 0, y: 0, magnitude: 0 };
                this.x = this.targetX;
                this.y = this.targetY;
                this.previousDistance = undefined;
                return;
            }
            
            // Aktualizujeme předchozí vzdálenost
            this.previousDistance = distance;
        } else {
            // Resetujeme předchozí vzdálenost, když jsme mimo zónu
            this.previousDistance = undefined;
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

        // Calculate formation cohesion force if in formation
        if (this.game.currentFormation && this.game.selectedUnits.has(this)) {
            let cohesionForce = { x: 0, y: 0 };
            let cohesionCount = 0;

            // Calculate average position of nearby formation units
            for (const otherUnit of this.game.selectedUnits) {
                if (otherUnit === this) continue;

                const dx = otherUnit.x - this.x;
                const dy = otherUnit.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.formationCohesionRadius) {
                    cohesionForce.x += dx;
                    cohesionForce.y += dy;
                    cohesionCount++;
                }
            }

            if (cohesionCount > 0) {
                // Normalize and scale cohesion force
                const magnitude = Math.sqrt(cohesionForce.x * cohesionForce.x + cohesionForce.y * cohesionForce.y);
                if (magnitude > 0) {
                    cohesionForce.x = (cohesionForce.x / magnitude) * this.formationCohesionForce;
                    cohesionForce.y = (cohesionForce.y / magnitude) * this.formationCohesionForce;
                }

                // Add cohesion force to current force
                this.currentForce.x += cohesionForce.x;
                this.currentForce.y += cohesionForce.y;
            }
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

    canShoot() {
        if (this.shootCooldown > 0 || this.isDead || this.initialShotDelay > 0) {
            return false;
        }

        // Pokud máme útočníka, zkontrolujeme, zda na něj míříme
        if (this.lastAttacker && !this.lastAttacker.isDead) {
            const dx = this.lastAttacker.x - this.x;
            const dy = this.lastAttacker.y - this.y;
            const targetAngle = Math.atan2(dy, dx);
            
            // Zkontrolujeme, zda je rozdíl úhlů menší než malá tolerance
            let angleDiff = targetAngle - this.vision.currentVisionAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            return Math.abs(angleDiff) < 0.1; // Tolerance 0.1 radiánů (asi 5.7 stupňů)
        }

        return true;
    }

    turnToLastAttacker() {
        if (this.lastAttacker && !this.lastAttacker.isDead) {
            const dx = this.lastAttacker.x - this.x;
            const dy = this.lastAttacker.y - this.y;
            const targetAngle = Math.atan2(dy, dx);
            
            // Plynulá interpolace mezi aktuálním a cílovým úhlem
            let angleDiff = targetAngle - this.vision.currentVisionAngle;
            
            // Normalizujeme rozdíl úhlů do rozsahu -PI až PI
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Interpolujeme úhel s rychlostí rotace
            this.vision.currentVisionAngle += angleDiff * 0.1; // 0.1 je rychlost rotace
            
            // Normalizujeme výsledný úhel
            while (this.vision.currentVisionAngle > Math.PI) this.vision.currentVisionAngle -= 2 * Math.PI;
            while (this.vision.currentVisionAngle < -Math.PI) this.vision.currentVisionAngle += 2 * Math.PI;
            
            // Aktualizujeme cílový úhel
            this.vision.targetVisionAngle = targetAngle;
        }
    }

    shoot(targetUnit) {
        // Zničené jednotky nemohou střílet
        if (this.isDead) return;

        // Přehráme zvuk výstřelu a zobrazíme záblesk
        this.audio.playShootSound();

        const dx = targetUnit.x - this.x;
        const dy = targetUnit.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.view.drawMuzzleFlash(angle);

        // 90% šance na zásah
        if (Math.random() < 0.9) {
            // Náhodné poškození 0-100%
            const damage = Math.random() * 100;
            targetUnit.recieveDamage(damage);
            // Uložíme si útočníka
            targetUnit.lastAttacker = this;
        }
        
        // Základní cooldown střelby (180 snímků = 3 sekundy při 60 FPS)
        const baseCooldown = 180;
        // Náhodná složka (0-20% navíc)
        const randomVariation = Math.random() * 0.2;
        // Celkový cooldown (180-216 snímků = 3-3.6 sekundy)
        this.shootCooldown = Math.floor(baseCooldown * (1 + randomVariation));
    }

    recieveDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        if (this.health <= 0) {
            this.isDead = true;
        }
        // TODO: Grafický efekt zásahu?
    }

    isPointInside(x, y) {
        // Zničené jednotky nelze vybrat
        if (this.isDead) return false;

        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size;
    }
    
    isInSelectionBox(startX, startY, endX, endY) {
        // Mrtvé jednotky nelze vybrat
        if (this.isDead) return false;

        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);
        
        return this.x >= left && this.x <= right && this.y >= top && this.y <= bottom;
    }

    moveTo(x, y) {
        // Zničené jednotky se nemohou pohybovat
        if (this.isDead) return;
        
        // Uložíme startovní pozici při zadání nového cíle
        this.startX = this.x;
        this.startY = this.y;
        
        // Nastavíme cílovou pozici
        this.targetX = x;
        this.targetY = y;
    }
} 