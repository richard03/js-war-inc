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
        this.personalSpace = cfg.personalSpace || 40;
        this.isEnemy = cfg.isEnemy;
        this.isDead = typeof cfg.isDead == "undefined" ? false : cfg.isDead;
        this.isOnFire = typeof cfg.isOnFire == "undefined" ? false : cfg.isOnFire;
        this.isShooting = false;
        this.shootingTarget = null;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.health = cfg.health || 100;
        this.hasVisibleEnemies = cfg.hasVisibleEnemies || false;
        this.lastAttacker = null;
        this.seesObstacle = false;
                
        // Vytvoříme instance pomocných systémů
        this.vision = new UnitVision(this);
        this.movement = new UnitMovement(this);
        this.view = new UnitView(this, game.view.ctx, {
            color: this.isEnemy ? '#ff0000' : '#00ff00'
        });
        this.audio = new AudioSystem({debugMode: this.debugMode});

        // Formation cohesion properties
        this.formationCohesionRadius = 50; // Distance to maintain from other units in formation
        this.formationCohesionForce = 0.5; // Strength of cohesion force
    }

    update() {
        // Pokud je jednotka zničena, pouze aktualizujeme oheň
        if (this.isDead) {
            this.isOnFire = true; // Zničené jednotky vždy hoří
            return;
        }

        this.vision.update();
        this.movement.update();

        this.view.update();
        
        // Resetujeme stav viditelnosti nepřátel
        this.hasVisibleEnemies = false;
        this.isShooting = false;

        if (this.shootingTarget) {
            const targetVector = new Vector2(this.shootingTarget.x - this.x, this.shootingTarget.y - this.y);
            if (targetVector.length > this.vision.visionRange || this.shootingTarget.isDead) {
                // Target is dead or out of range, find a new target
                this.shootingTarget = null;
            } else {
                // Shoot if cooldown allows it
                if (this.canShoot()) {
                    this.shoot(this.shootingTarget);
                }
            }
        }
        
        if (!this.shootingTarget) {
            // Find a new target
            for (const otherUnit of this.game.units) {
            if (otherUnit === this) continue;
                if (otherUnit.isDead) continue;
                if (otherUnit.isEnemy === this.isEnemy) continue;

                // teď je jasné že jde o živého nepřítele
                // Kontrolujeme, zda je jednotka v zrakovém poli
                const seesEnemy = this.vision.isInVisionCone(otherUnit.x, otherUnit.y);

                if (seesEnemy) {
                    this.hasVisibleEnemies = true;
                    this.shootingTarget = otherUnit;

                    // začneme se otáčet k nepříteli
                    this.vision.startTurningTo(otherUnit.x, otherUnit.y);
                }

                // if (this.lastAttacker.isDead) {
                    
                //     // Pokud nemáme útočníka, začneme se otáčet k nepříteli
                //     if (!this.lastAttacker || this.lastAttacker.isDead) {
                //         const dx = otherUnit.x - this.x;
                //         const dy = otherUnit.y - this.y;
                //         const targetAngle = Math.atan2(dy, dx);
                //         let angleDiff = targetAngle - this.vision.currentVisionAngle;
                        
                //         // Normalizujeme rozdíl úhlů do rozsahu -PI až PI
                //         while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                //         while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                        
                //         // Interpolujeme úhel s rychlostí rotace
                //         this.vision.currentVisionAngle += angleDiff * 0.1;
                        
                //         // Normalizujeme výsledný úhel
                //         while (this.vision.currentVisionAngle > Math.PI) this.vision.currentVisionAngle -= 2 * Math.PI;
                //         while (this.vision.currentVisionAngle < -Math.PI) this.vision.currentVisionAngle += 2 * Math.PI;
                        
                //         // Aktualizujeme cílový úhel
                //         this.vision.targetVisionAngle = targetAngle;
                //     }
                    
                //     // Nastavíme počáteční zpoždění při prvním spatření nepřítele
                //     if (!this.hasSeenEnemy) {
                //         this.initialShotDelay = 120; // 2 sekundy při 60 FPS
                //         this.hasSeenEnemy = true;
                //     }
                //     if (this.canShoot()) {
                //         this.shoot(otherUnit);
                //         this.view.startFlash(); // Trigger flash effect when shooting
                //     }
                // }
            
            }



        // Pokud máme útočníka, otočíme se k němu
        const targetVector = new Vector2(this.targetX - this.x, this.targetY - this.y);
        const distance = targetVector.length;
        if (this.lastAttacker && !this.lastAttacker.isDead) {
            this.turnToLastAttacker();
            
            if (this.vision.isInVisionCone(this.lastAttacker.x, this.lastAttacker.y)) {
                if (this.canShoot()) {
                    this.isShooting = true;
                    this.shoot(this.lastAttacker);
                }
            }
        } else if (distance > this.TARGET_RADIUS) {
            // Aktualizujeme směr pohledu pouze pokud nemáme útočníka a nejsme u cíle
            this.vision.updateVisionAngle(this.targetX, this.targetY);
        }

        // Snížíme cooldown střelby
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Snížíme počáteční zpoždění
        // if (this.initialShotDelay > 0) {
        //     this.initialShotDelay--;
        // }
        
        

        
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
            // Aktualizujeme cílový úhel
            this.vision.startTurningTo(this.lastAttacker.x, this.lastAttacker.y);

            this.movement.turnToLastAttacker();
        }     
    }

    shoot(targetUnit) {
        // Zničené jednotky nemohou střílet
        if (this.isDead) return;

        // jsme ve stejném teamu?
        if (this.isEnemy === targetUnit.isEnemy) return;

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

        this.movement.moveTo(x, y);
    }
} 