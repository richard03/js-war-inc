class UnitView {
    constructor(unit, viewContext, cfg = {}) {
        this.unit = unit;
        this.viewContext = viewContext;
        this.debugMode = typeof cfg.debugMode == "undefined" ? true : cfg.debugMode;
        this.originalColor = cfg.color || '#00ff00';
        this.currentColor = this.originalColor;
        this.selectedColor = cfg.selectedColor || '#00ff00';
        this.visionColor = cfg.visionColor || 'rgba(255, 255, 0, 0.01)';
        this.visionBorderColor = cfg.visionBorderColor || 'rgba(255, 255, 0, 0.03)';
        this.healthColors = cfg.healthColors || {
            high: '#00ff00',
            medium: '#ffff00',
            low: '#ff0000'
        };
        this.textColor = cfg.textColor || 'white';
        this.healthBarBackground = cfg.healthBarBackground || 'rgba(0, 0, 0, 0.5)';
        
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
        this.drawUnit(this.viewContext);
        
        // Vykreslíme zrakové pole
        this.drawVision(this.viewContext);

        // Vykreslíme zdraví
        this.drawHealth(this.viewContext);

        // Vykreslíme oheň
        this.drawFire(this.viewContext);
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

    drawExclamationMark(x, y, size) {
        this.viewContext.save();
        this.viewContext.fillStyle = 'black';
        this.viewContext.font = `${size * 1.5}px Arial`;
        this.viewContext.textAlign = 'center';
        this.viewContext.textBaseline = 'middle';
        this.viewContext.fillText('!', x, y);
        this.viewContext.restore();
    }

    drawUnit(ctx) {
        // Pokud je jednotka zničena, vykreslíme ji s nižší průhledností
        if (this.unit.isDead) {
            ctx.save();
            ctx.globalAlpha = 0.5; // Zničené jednotky jsou průhlednější
        }

        // Vykreslíme vozidlo
        this.drawVehicleSprite(ctx);
        
        if (this.unit.isDead) {
            ctx.restore();
        }

        // Vykreslíme oheň pokud je jednotka v ohni nebo zničena
        if (this.unit.isOnFire || this.unit.isDead) {
            this.drawFire(ctx);
        }
        
        // Draw exclamation mark in debug mode if unit sees enemies
        if (this.debugMode && this.unit.hasVisibleEnemies) {
            this.drawExclamationMark(this.unit.x, this.unit.y, 10);
        }
    }

    drawVehicleSprite(ctx) {
        ctx.save();
        
        // Move to the center of the unit
        ctx.translate(this.unit.x, this.unit.y);
        
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
        
        ctx.restore();

        // Draw selection border if selected
        if (this.unit.isSelected) {
            ctx.beginPath();
            ctx.arc(this.unit.x, this.unit.y, this.unit.size, 0, Math.PI * 2);
            ctx.strokeStyle = this.selectedColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    drawHealth(ctx) {
        // U zničených jednotek nevykreslujeme zdraví
        if (this.unit.isDead) return;

        // Health bar dimensions
        const healthBarWidth = 20;
        const healthBarHeight = 4;
        const healthBarX = this.unit.x - healthBarWidth / 2;
        const healthBarY = this.unit.y - this.unit.size - 8;
        
        // Draw health bar background
        ctx.fillStyle = this.healthBarBackground;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw health bar
        const healthColor = this.unit.health > 50 ? this.healthColors.high : 
                          this.unit.health > 25 ? this.healthColors.medium : 
                          this.healthColors.low;
        ctx.fillStyle = healthColor;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (this.unit.health / 100), healthBarHeight);
        
        // Draw health text
        ctx.fillStyle = this.textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.unit.health)}%`, this.unit.x, this.unit.y - this.unit.size - 20);
    }

    drawVision(ctx) {
         // U zničených jednotek nevykreslujeme zrakové pole
         if (this.unit.isDead) return;

         // Vykreslíme zrakové pole pouze v debug módu
         if (!this.debugMode) return;

        // Draw vision cone
        this.viewContext.save();
        this.viewContext.beginPath();
        this.viewContext.moveTo(this.unit.x, this.unit.y);
        
        // Vypočítáme koncové body kužele
        const startAngle = this.unit.vision.currentVisionAngle - this.unit.vision.visionConeAngle / 2;
        const endAngle = this.unit.vision.currentVisionAngle + this.unit.vision.visionConeAngle / 2;
        // Vykreslíme oblouk
        this.viewContext.arc(this.unit.x, this.unit.y, this.unit.vision.visionRange, startAngle, endAngle);

        // Vrátíme se zpět do středu
        this.viewContext.lineTo(this.unit.x, this.unit.y);
        // Nastavíme barvu a průhlednost
        this.viewContext.fillStyle = this.visionColor;
        this.viewContext.fill();
        this.viewContext.restore();

        // Draw vision direction arrow
        const arrowLength = this.unit.vision.visionRange;
        const angle = this.unit.vision.currentVisionAngle;
        const endX = this.unit.x + Math.cos(angle) * arrowLength;
        const endY = this.unit.y + Math.sin(angle) * arrowLength;

        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.unit.x, this.unit.y);
        ctx.lineTo(endX, endY);
        
        // Draw arrow head
        const arrowSize = 10;
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    drawFire(ctx) {
        if (!this.unit.isOnFire && !this.unit.isDead) return;

        // Update and draw fire particles
        for (let i = this.fireParticles.length - 1; i >= 0; i--) {
            const particle = this.fireParticles[i];
            particle.lifetime--;
            
            if (particle.lifetime <= 0) {
                this.fireParticles.splice(i, 1);
                continue;
            }

            // Update particle position
            particle.x += particle.vx;
            particle.y += particle.vy;

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
            particle.x += particle.vx;
            particle.y += particle.vy;
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
} 