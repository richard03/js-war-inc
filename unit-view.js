class UnitView {
    constructor(unit, viewContext, cfg = {}) {
        this.unit = unit;
        this.viewContext = viewContext;
        this.debugMode = unit.game.debugMode;
        this.originalColor = cfg.color || '#00ff00';
        this.currentColor = this.originalColor;
        this.selectedColor = cfg.selectedColor || '#00ff00';
        this.selectedLineWidth = cfg.selectedLineWidth || 3;
        this.visionColor = cfg.visionColor || 'rgba(255, 255, 0, 0.01)';
        this.visionBorderColor = cfg.visionBorderColor || 'rgba(255, 255, 0, 0.03)';
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
        this.drawUnit();
        

        // Vykreslíme zdraví
        this.drawHealth();

        // Vykreslíme oheň
        this.drawFire();

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

    startFlash() {
        this.flashActive = true;
        this.flashTimer = this.flashDuration;
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
        const x = this.unit.x
        const y = this.unit.y
        const size = 10
        const ctx = this.viewContext;

        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = `${size * 1.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x, y);
        ctx.restore();
    }

    drawUnit() {
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

        // Vykreslíme vozidlo
        this.drawVehicleSprite();
        
        
        // Vykreslíme oheň - už se to vykresluje v draw
        // if (this.unit.isOnFire || this.unit.isDead) {
        //     this.drawFire();
        // }
        
        // Draw exclamation mark in debug mode if unit sees enemies
        // if (this.debugMode && this.unit.hasVisibleEnemies) {
        //     this.drawExclamationMark();
        // }
    }

    drawVehicleSprite() {
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;
        // Výpočet pozice jednotky s ohledem na offset mapy
        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        ctx.save(); // TODO: proč je tu tohle?
        ctx.translate(screenX, screenY);

        // Rotate based on vision angle + 90 degrees
        ctx.rotate(this.unit.vision.currentVisionAngle + Math.PI/2);
        
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
        
        // Vykreslení zdraví - už se to vykresluje v drawUnit
        // this.drawHealth();
        
        // Vykreslení vidění - už se to vykresluje v drawDebugVision
        // this.drawVision();
        
        // Vykreslení výběru
        // TODO: posunutí o offset terénu
        if (this.unit.isSelected) {
            ctx.beginPath();
            ctx.arc(screenX, screenY, this.unit.size + 5, 0, Math.PI * 2);
            ctx.strokeStyle = this.selectedColor;
            ctx.lineWidth = this.selectedLineWidth;
            ctx.stroke();
        }
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

        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;

        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        // Update and draw fire particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                this.fireParticles.splice(i, 1);
                continue;
            }

            // Update particle position
            particle.x += particle.vx + screenX;
            particle.y += particle.vy + screenY;

            // Draw particle
            const alpha = particle.lifetime / this.fireParticleLifetime;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
            ctx.fill();
        }

        // Update and draw smoke particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const particle = this.smokeParticles[i];
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }

            // Update particle position and size
            particle.x += particle.vx + screenX;
            particle.y += particle.vy + screenY;
            particle.size += 0.2;
            particle.vy -= 0.05;

            // Draw particle
            const alpha = particle.lifetime / this.smokeParticleLifetime;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
            ctx.fill();
        }

        // Add new particles
        if (this.fireParticles.length < this.maxFireParticles) {
            this.addFireParticle();
        }
        if (this.smokeParticles.length < this.maxSmokeParticles) {
            this.addSmokeParticle();
        }
    }

    addFireParticle() {
        const terrain = this.unit.game.terrain;

        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        const size = 2 + Math.random() * 3;
        
        // Random fire color (yellow to red)
        const r = 255;
        const g = 100 + Math.random() * 155;
        const b = 0;
        
        this.fireParticles.push({
            x: this.unit.x + screenX,
            y: this.unit.y + screenY,
            vx: Math.cos(angle) * speed,
            vy: -0.1 - Math.random() * 2,
            size: size,
            color: `${r}, ${g}, ${b}`,
            lifetime: this.fireParticleLifetime
        });
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

    drawDebugVision() {
        // Vykreslíme zrakové pole pouze v debug módu
        if (!this.debugMode) return;

        // U zničených jednotek nevykreslujeme zrakové pole
        if (this.unit.isDead) return;
        
        const ctx = this.viewContext;
        const terrain = this.unit.game.terrain;

        const screenX = this.unit.x - terrain.xOffset;
        const screenY = this.unit.y - terrain.yOffset;

        // Draw vision cone
        const visionRange = this.unit.vision.visionRange;
        const visionAngle = this.unit.vision.currentVisionAngle;
        const visionWidth = this.unit.vision.visionWidth;

        const startAngle = visionAngle - visionWidth / 2;
        const endAngle = visionAngle + visionWidth / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);

        ctx.arc(
            screenX, 
            screenY, 
            visionRange, 
            startAngle, 
            endAngle
        );
        ctx.lineTo(screenX, screenY);
        ctx.fillStyle = this.visionColor;
        ctx.fill();
        ctx.restore();

        // Draw vision direction arrow
        const arrowLength = visionRange;
        const arrowAngle = this.unit.vision.currentVisionAngle;
        const arrowLineWidth = 2;
        const arrowSize = 10;
        const arrowEndX = screenX + Math.cos(arrowAngle) * arrowLength;
        const arrowEndY = screenY + Math.sin(arrowAngle) * arrowLength;

        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.lineWidth = arrowLineWidth;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
            arrowEndY - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
        );
        ctx.moveTo(arrowEndX, arrowEndY);
        ctx.lineTo(
            arrowEndX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
            arrowEndY - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
        );
        ctx.stroke();

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
            `${Math.round(this.unit.health)}%`, 
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