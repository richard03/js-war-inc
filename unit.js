// Tento soubor vyžaduje physics.js, který musí být načten před unit.js
// physics.js obsahuje fyzikální výpočty pro pohyb jednotek

class Unit {
    constructor(x, y, canvasWidth, canvasHeight, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.isSelected = false;
        this.targetX = x;
        this.targetY = y;
        this.startX = x;
        this.startY = y;
        this.isEnemy = isEnemy;
        this.originalColor = isEnemy ? '#ff0000' : '#00ff00'; // Red for enemies, green for friendly
        this.currentColor = this.originalColor;
        this.collisionCooldown = 0;
        
        // Fyzikální vlastnosti
        this.mass = 1;
        this.maxForce = 0.5;
        this.velocity = { x: 0, y: 0 };
        this.currentForce = { x: 0, y: 0, magnitude: 0 };
        
        // Vytvoříme instanci Vision
        this.vision = new Vision(canvasWidth, canvasHeight);
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
        // Resetujeme barvu na původní
        this.currentColor = this.originalColor;
        
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
        
        // Kontrolujeme kolize s ostatními jednotkami
        for (const otherUnit of units) {
            if (otherUnit === this) continue;
            
            const dx = otherUnit.x - this.x;
            const dy = otherUnit.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Pokud je jednotka příliš blízko a není v cooldownu
            if (distance < this.size + otherUnit.size && this.collisionCooldown === 0) {
                // Nastavíme cooldown
                this.collisionCooldown = 30; // 30 snímků cooldownu
                
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
            if (this.vision.isInVisionCone(otherUnit.x, otherUnit.y, this.x, this.y)) {
                // Změníme barvu podle typu jednotky
                this.currentColor = this.isEnemy ? '#ff0000' : '#0000ff';
                
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

    draw(ctx) {
        // Vykreslíme jednotku
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.currentColor;
        ctx.fill();
        
        // Pokud je jednotka vybraná, přidáme zelený rámeček
        if (this.isSelected) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Vykreslíme zrakové pole
        this.vision.draw(ctx, this.x, this.y);

        // Draw coordinates and force
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Current position
        const currentPosText = `Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`;
        ctx.fillText(currentPosText, this.x, this.y - this.size - 5);
        
        // Target position
        const targetPosText = `Target: (${Math.round(this.targetX)}, ${Math.round(this.targetY)})`;
        ctx.fillText(targetPosText, this.x, this.y - this.size - 20);

        // Force information
        const forceMagnitude = Math.sqrt(this.currentForce.x * this.currentForce.x + this.currentForce.y * this.currentForce.y);
        const forceText = `Force: ${forceMagnitude.toFixed(2)}`;
        ctx.fillText(forceText, this.x, this.y - this.size - 35);

        // Draw force vector if there is any force
        if (forceMagnitude > 0.1) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + this.currentForce.x * 10,
                this.y + this.currentForce.y * 10
            );
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw arrow head
            const arrowAngle = Math.atan2(this.currentForce.y, this.currentForce.x);
            const arrowLength = 10;
            const arrowHeadAngle = Math.PI / 6;
            
            ctx.beginPath();
            const endX = this.x + this.currentForce.x * 10;
            const endY = this.y + this.currentForce.y * 10;
            ctx.moveTo(endX, endY);
            ctx.lineTo(
                endX - arrowLength * Math.cos(arrowAngle - arrowHeadAngle),
                endY - arrowLength * Math.sin(arrowAngle - arrowHeadAngle)
            );
            ctx.lineTo(
                endX - arrowLength * Math.cos(arrowAngle + arrowHeadAngle),
                endY - arrowLength * Math.sin(arrowAngle + arrowHeadAngle)
            );
            ctx.closePath();
            ctx.fillStyle = 'yellow';
            ctx.fill();
        }
    }

    isPointInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size;
    }
    
    isInSelectionBox(startX, startY, endX, endY) {
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