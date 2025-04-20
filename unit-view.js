if (typeof require == 'function') {
    require('./game-position.js');
}

class UnitView {
    constructor(unit, viewContext, cfg = {}) {
        this.unit = unit;
        this.viewContext = viewContext;
        this.debugMode = unit.game.debugMode;
        this.originalColor = cfg.color || '#00ff00';
        this.currentColor = this.originalColor;
        this.selectedColor = cfg.selectedColor || '#00ff00';
        this.selectedLineWidth = cfg.selectedLineWidth || 3;
        this.healthColors = cfg.healthColors || {
            high: '#00ff00',
            medium: '#ffff00',
            low: '#ff0000'
        };
        this.textColor = cfg.textColor || 'white';
        this.healthBarBackground = cfg.healthBarBackground || 'rgba(0, 0, 0, 0.5)';
        this.healthBarHeight = cfg.healthBarHeight || 4;
        
        // Flash effect properties
        this.flashActive = typeof cfg.flashActive == "undefined" ? false : cfg.flashActive;
        this.flashTimer = cfg.flashTimer || 0;
        this.flashDuration = cfg.flashDuration || 6; // 0.1 sekundy při 60 FPS
        this.flashColor = cfg.flashColor || '#ffffff';

        // Muzzle flash properties
        this.muzzleFlashActive = typeof cfg.muzzleFlashActive == "undefined" ? false : cfg.muzzleFlashActive;
        this.muzzleFlashTimer = cfg.muzzleFlashTimer || 0;
        this.muzzleFlashDuration = cfg.muzzleFlashDuration || 3;
        this.muzzleFlashLength = cfg.muzzleFlashLength || 20;
        this.muzzleFlashAngle = cfg.muzzleFlashAngle || 0;

        // Load vehicle sprite
        this.vehicleSprite = new Image();
        this.vehicleSprite.src = 'assets/sprites/vehicle.png';

        // Fire animation properties
        this.fireParticles = [];
        this.smokeParticles = [];
        this.maxFireParticles = 5;
        this.maxSmokeParticles = 10;
        this.fireParticleLifetime = 10;
        this.smokeParticleLifetime = 20;
    }

    draw() {
        // Vykreslíme jednotku
        this.drawUnitSprite();
        

        // Vykreslíme zdraví
        this.drawHealth();

        // Vykreslíme oheň
        this.drawFire();
        this.drawSmoke();

        // Vykreslení výběru
        this.drawSelection();

        // Vykreslíme debug info
        this.drawDebugInfo();
    }

    update() {
        if (this.flashActive) {
            this.flashTimer--;
            if (this.flashTimer <= 0) {
                this.flashActive = false;
            }
        }
    }

    drawSelection() {
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;
        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        if (this.unit.isSelected) {
            ctx.beginPath();
            ctx.arc(
                screenX,
                screenY, 
                this.unit.size + 5, 0, 
                Math.PI * 2
            );
            ctx.strokeStyle = this.selectedColor;
            ctx.lineWidth = this.selectedLineWidth;
            ctx.stroke();
        }
    }

    drawMuzzleFlash(angle) {
        // If there's no active flash, start one
        if (!this.muzzleFlashActive) {
            this.muzzleFlashActive = true;
            this.muzzleFlashTimer = this.muzzleFlashDuration;
            this.muzzleFlashAngle = angle;
        }

        // Draw the flash
        this.viewContext.save();
        this.viewContext.beginPath();
        this.viewContext.strokeStyle = 'red';
        this.viewContext.lineWidth = 2;
        
        // Calculate end point of the flash
        const endX = this.unit.x + Math.cos(this.muzzleFlashAngle) * this.muzzleFlashLength;
        const endY = this.unit.y + Math.sin(this.muzzleFlashAngle) * this.muzzleFlashLength;
        
        this.viewContext.moveTo(this.unit.x, this.unit.y);
        this.viewContext.lineTo(endX, endY);
        this.viewContext.stroke();
        this.viewContext.restore();

        // Update timer and deactivate if needed
        this.muzzleFlashTimer--;
        if (this.muzzleFlashTimer <= 0) {
            this.muzzleFlashActive = false;
        }
    }

    drawExclamationMark() {
        const terrain = this.unit.game.terrain;
        const position = GamePosition.getScreenPosition(this.unit.x, this.unit.y, terrain.xOffset, terrain.yOffset);
        const size = 10
        const ctx = this.viewContext;

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = `${size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', position.x, position.y);
        ctx.restore();
    }

    drawUnitSprite() {
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;
        const canvas = this.unit.game.view.canvas;
        
        // Výpočet pozice jednotky s ohledem na offset terénu
        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;
        
        // Kontrola, zda je jednotka viditelná
        if (screenX < -this.unit.size || screenX > canvas.width + this.unit.size ||
            screenY < -this.unit.size || screenY > canvas.height + this.unit.size) {
            return; // Jednotka není viditelná
        }

        // Pokud je jednotka zničena, vykreslíme ji s nižší průhledností
        if (this.unit.isDead) {
            ctx.save();
            ctx.globalAlpha = 0.5; // Zničené jednotky jsou průhlednější
        }
        
        ctx.save(); // TODO: proč je tu tohle?
        ctx.translate(screenX, screenY);

        // Rotate based on vision angle + 90 degrees
        ctx.rotate(this.unit.vision.currentVisionVector.getAngle() + Math.PI/2);
        
        // Calculate dimensions while maintaining aspect ratio
        const spriteWidth = this.vehicleSprite.naturalWidth;
        const spriteHeight = this.vehicleSprite.naturalHeight;
        const aspectRatio = spriteWidth / spriteHeight;
        
        // Use height as base and calculate width to maintain aspect ratio
        const displayHeight = this.unit.size * 2;
        const displayWidth = displayHeight * aspectRatio;
        
        // Draw the sprite centered and scaled
        ctx.drawImage(
            this.vehicleSprite,
            -displayWidth/2, // Center horizontally
            -displayHeight/2, // Center vertically
            displayWidth,
            displayHeight
        );
        
        ctx.restore(); // TODO: proč je tu tohle?
        
    }

    drawHealth() {
        // U zničených jednotek nevykreslujeme zdraví
        if (this.unit.isDead) return;
        
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;
        
        // Výpočet pozice jednotky s ohledem na offset mapy
        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;
        
        const healthBarWidth = this.unit.size;
        const healthBarHeight = this.healthBarHeight;
        
        const healthBarX = screenX - healthBarWidth/2;
        const healthBarY = screenY - this.unit.size - 8;

        
        // Draw health bar background
        ctx.fillStyle = this.healthBarBackground;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw health bar
        const healthColor = this.unit.health > 50 ? this.healthColors.high : 
                          this.unit.health > 25 ? this.healthColors.medium : 
                          this.healthColors.low;
        ctx.fillStyle = healthColor;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (this.unit.health / 100), healthBarHeight);
         
    }

    drawFire() {
        if (!this.unit.isOnFire && !this.unit.isDead) return;

        // Update and draw fire particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                this.fireParticles.splice(i, 1);
                continue;
            }

            this.drawFireParticle(particle);
        }

        // Add new particles
        if (this.fireParticles.length < this.maxFireParticles) {
            this.addFireParticle();
        }
    }

    drawFireParticle(particle) {
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;

        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;

        const position = GamePosition.getScreenPosition(particle.x, particle.y, terrain.xOffset, terrain.yOffset);

        const alpha = particle.lifetime / this.fireParticleLifetime;
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            particle.size,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
        ctx.fill();
    }

    addFireParticle() {        
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        const size = 2 + Math.random() * 3;
        
        // Random fire color (yellow to red)
        const r = 255;
        const g = 100 + Math.random() * 155;
        const b = 0;
        
        this.fireParticles.push({
            x: this.unit.x,
            y: this.unit.y,
            vx: Math.cos(angle) * speed,
            vy: -0.1 - Math.random() * 2,
            size: size,
            color: `${r}, ${g}, ${b}`,
            lifetime: this.fireParticleLifetime
        });
    }

    drawSmoke() {
        if (!this.unit.isOnFire && !this.unit.isDead) return;

        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;

        // Update and draw smoke particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const particle = this.smokeParticles[i];
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }

            this.drawSmokeParticle(particle);
        }

        // Add new particles
        if (this.smokeParticles.length < this.maxSmokeParticles) {
            this.addSmokeParticle();
        }
    }

    drawSmokeParticle(particle) {
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;

        
        // Update particle position and size
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.size += 0.2;
        particle.vy -= 0.05;

        const position = GamePosition.getScreenPosition(particle.x, particle.y, terrain.xOffset, terrain.yOffset);

        // Draw particle
        const alpha = particle.lifetime / this.smokeParticleLifetime;
        ctx.beginPath();
        ctx.arc(
            position.x,
            position.y,
            particle.size,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
        ctx.fill();
    }

    addSmokeParticle() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.02 + Math.random() * 0.8;
        const size = 3 + Math.random() * 2;
        
        this.smokeParticles.push({
            x: this.unit.x,
            y: this.unit.y,
            vx: Math.cos(angle) * speed,
            vy: -0.5 - Math.random(),
            size: size,
            lifetime: this.smokeParticleLifetime
        });
    }

    drawDebugArrow(startX, startY, endX, endY, color = 'rgba(0, 0, 255, 0.3)', lineWidth = 2, size = 10) {
        const ctx = this.viewContext;
        ctx.save();

        // draw line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // draw arrowhead
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.lineTo(
            endX - size * Math.cos(angle - Math.PI / 6), 
            endY - size * Math.sin(angle - Math.PI / 6)
        );
        
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - size * Math.cos(angle + Math.PI / 6), 
            endY - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        ctx.restore();
    }

    drawDebugVisionCone(startX, startY, diameter, startAngle, endAngle, color = 'rgba(255, 255, 0, 0.1)') {
        // Vykreslíme zrakové pole pouze v debug módu
        const ctx = this.viewContext;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        ctx.arc(
            startX, 
            startY, 
            diameter, 
            startAngle, 
            endAngle
        );
        ctx.lineTo(startX, startY); // Uzavřeme cestu
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();   
    }

    drawDebugVision() {
        // Vykreslíme zrakové pole pouze v debug módu
        if (!this.debugMode) return;

        // U zničených jednotek nevykreslujeme zrakové pole
        if (this.unit.isDead) return;

        const terrain = this.unit.game.terrain;
        const unitPosition = GamePosition.getScreenPosition(
            this.unit.x,
            this.unit.y,
            terrain.xOffset,
            terrain.yOffset
        );

        const visionRange = this.unit.vision.visionRange;
        const visionAngle = this.unit.vision.currentVisionVector.getAngle();
        const visionConeAngle = this.unit.vision.visionConeAngle;

        const startAngle = visionAngle - visionConeAngle / 2;
        const endAngle = visionAngle + visionConeAngle / 2;

        this.drawDebugVisionCone(
            unitPosition.x,
            unitPosition.y,
            visionRange,
            startAngle,
            endAngle
        );

        this.drawDebugArrow(
            unitPosition.x,
            unitPosition.y, 
            unitPosition.x + this.unit.vision.currentVisionVector.x,
            unitPosition.y + this.unit.vision.currentVisionVector.y,
            'rgba(0, 0, 255, 0.3)'
        );

        this.drawDebugArrow(
            unitPosition.x,
            unitPosition.y, 
            unitPosition.x + this.unit.vision.targetVisionVector.x,
            unitPosition.y + this.unit.vision.targetVisionVector.y,
            'rgba(255, 0, 255, 0.3)'
        );
    }

    drawDebugTexts() {
        // Vykreslíme texty pro debug
        if (!this.debugMode) return;
       
        const viewContext = this.viewContext;
        const terrain = this.unit.game.terrain;

        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        // Vykreslíme pozadí pro lepší čitelnost
        this.viewContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.viewContext.fillRect(
            screenX - 50,
            screenY - this.unit.size - 40,
            100,
            30
        );

        // Získáme výšku terénu pod jednotkou
        const tileX = Math.floor(this.unit.x / this.unit.game.terrain.tileSize);
        const tileY = Math.floor(this.unit.y / this.unit.game.terrain.tileSize);
        const terrainHeight = this.unit.game.terrain.terrainMap[tileY][tileX];

        // Draw health text
        viewContext.fillStyle = this.textColor;
        viewContext.font = '10px Arial';
        viewContext.textAlign = 'center';
        viewContext.fillText(
            `${Math.round(this.unit.health)}% ${this.unit.combat.shotCooldown.toFixed(2)}`, 
            screenX, 
            screenY - this.unit.size - 30
        );
        viewContext.restore();

        // Draw position text
        let text = '';
        text += `${this.unit.x.toFixed(2)}`;
        text += `, ${this.unit.y.toFixed(2)}`;
        text += `, ${terrainHeight.toFixed(2)}`;

        
        // let textWidth = this.viewContext.measureText(text).width;
            
        
        viewContext.fillText(
            text,
            screenX,
            screenY - this.unit.size - 15
        );
       
        // Vykreslíme výšku nad jednotkou
        this.viewContext.save();
    }

    drawDebugInfo() {
        if (!this.debugMode) return;
        
        this.drawDebugVision();

        this.drawDebugTexts();

    
        if (this.unit.hasVisibleEnemies) {
            this.drawExclamationMark();
        }
        
        this.viewContext.restore();
    }
} 