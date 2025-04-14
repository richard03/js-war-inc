// Tento soubor vyžaduje physics.js, který musí být načten před unit.js
// physics.js obsahuje fyzikální výpočty pro pohyb jednotek

class Unit {
    constructor(x, y, canvasWidth, canvasHeight, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.isSelected = false;
        this.targetX = x;
        this.targetY = y;
        this.startX = x;
        this.startY = y;
        this.isEnemy = isEnemy;
        this.originalColor = isEnemy ? '#ff0000' : '#00ff00'; // Red for enemies, green for friendly
        this.currentColor = this.originalColor;
        this.collisionCooldown = 0;
        this.shootCooldown = 0;
        this.health = 100;
        this.hasVisibleEnemies = false;
        
        // Fyzikální vlastnosti
        this.mass = 1;
        this.maxForce = 0.5;
        this.velocity = { x: 0, y: 0 };
        this.currentForce = { x: 0, y: 0, magnitude: 0 };
        
        // Vytvoříme instance pomocných systémů
        this.vision = new Vision(canvasWidth, canvasHeight);
        this.combat = new CombatSystem(isEnemy);
        this.view = new ViewSystem(isEnemy);
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

    update(units) {
        // Pokud je jednotka mrtvá, neprovádíme žádné aktualizace
        if (this.combat.isDead) return;

        // Resetujeme stav viditelnosti nepřátel
        this.hasVisibleEnemies = false;

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
        for (const otherUnit of units) {
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
            this.view.updateColor(seesEnemy);
            
            if (seesEnemy) {
                // Pokud je jednotka nepřátelská a můžeme střílet
                if (otherUnit.combat.isEnemy !== this.combat.isEnemy && !otherUnit.combat.isDead) {
                    this.hasVisibleEnemies = true;
                    // Nastavíme počáteční zpoždění při prvním spatření nepřítele
                    this.combat.setInitialDelay();
                    if (this.combat.canShoot()) {
                        this.combat.shoot(otherUnit.combat);
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

        // Pokud nemáme viditelné nepřátele, vrátíme se k původní barvě
        if (!this.hasVisibleEnemies) {
            this.view.updateColor(false);
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
            const randomVariation = 1 + (Math.random() - 0.5) * 0.4; // -20% až +20%
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
            
            // Aplikace síly na rychlost
            this.velocity.x += this.currentForce.x / this.mass;
            this.velocity.y += this.currentForce.y / this.mass;
            
            // Tření
            this.velocity.x *= 0.95;
            this.velocity.y *= 0.95;
        }
    }

    shoot(target) {
        // 90% šance na zásah
        if (Math.random() < 0.9) {
            // Náhodné poškození 0-100%
            const damage = Math.random() * 100;
            target.health = Math.max(0, target.health - damage);
        }
        
        // Nastavíme cooldown střelby (60 snímků = 1 sekunda při 60 FPS)
        this.shootCooldown = 60;
    }

    draw(ctx) {
        // Pokud je jednotka mrtvá, nevykreslujeme ji
        if (this.combat.isDead) return;

        // Vykreslíme jednotku
        this.view.drawUnit(ctx, this.x, this.y, this.size, this.isSelected);
        
        // Vykreslíme zrakové pole
        this.view.drawVision(ctx, this.x, this.y, this.vision);

        // Vykreslíme zdraví
        this.view.drawHealth(ctx, this.x, this.y, this.size, this.combat.health);
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

    moveTo(x, y, selectedUnits = []) {
        // Uložíme startovní pozici při zadání nového cíle
        this.startX = this.x;
        this.startY = this.y;
        
        // Nastavíme cílovou pozici
        this.targetX = x;
        this.targetY = y;
    }
} 