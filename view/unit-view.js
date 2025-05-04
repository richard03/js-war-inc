class UnitView {

    constructor(game, model) {
        this.game = game;
        this.model = model;

        this.sprite = null;

        this.healthBar = {
            height: 4,
            background: 'rgba(0, 0, 0, 0.5)',
            colors: {
                high: '#00ff00',
                medium: '#ffff00',
                low: '#ff0000'
            }
        }

        this.selection = {
            color: '#00ff00',
            lineWidth: 3
        }

        /*
        this.viewContext = game.view.battlefield.ctx;
    // constructor(unit, viewContext, cfg = {}) {
        this.unit = unit;
        
        this.debugMode = unit.game.debugMode;
        this.originalColor = cfg.color || '#00ff00';
        this.currentColor = this.originalColor;
        this.textColor = cfg.textColor || 'white';
        
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


        // Fire animation properties
        this.fireParticles = [];
        this.smokeParticles = [];
        this.maxFireParticles = 5;
        this.maxSmokeParticles = 10;
        this.fireParticleLifetime = 10;
        this.smokeParticleLifetime = 20;
        */
    }

    init() {
        // Load vehicle sprite
        this.sprite = new Image();
        this.sprite.src = 'assets/sprites/vehicle.png';        
    }

    getSpriteSize() {
        return {
            width: this.sprite.naturalWidth,
            height: this.sprite.naturalHeight
        }
    }

    /**
     * Draws the unit on the screen
     * @param {Object} screenPosition - The position of the unit on the screen
     * @param {Object} viewContext - The context we draw to
     * @param {Object} cfg - The configuration of the unit
     * @param {boolean} cfg.displayHealth - Whether to display the health bar
     * @param {boolean} cfg.isSelected - Whether the unit is selected
     */
    drawUnit(screenPosition, viewContext, cfg = {}) {
        
        this.drawUnitSprite(screenPosition, viewContext);

        if (cfg.displayHealth) {
            this.drawHealth(screenPosition, viewContext);
        }

        if (cfg.isSelected) {
            this.drawSelection(screenPosition, viewContext);
        }

        if (this.game.debugMode) {
            this.drawDebugInfo(screenPosition, viewContext);
        }
    }

    drawUnitSprite(screenPosition, viewContext) {
        viewContext.save(); // save state before transformations
        
        // Move to the center of the sprite
        viewContext.translate(screenPosition.x, screenPosition.y);
        
        // Rotate based on vision angle + 90 degrees
        viewContext.rotate(this.model.vision.currentAngle + Math.PI/2);
        
        // Calculate dimensions while maintaining aspect ratio
        const spriteSize = this.getSpriteSize();

        let unitWidth = spriteSize.width;
        let unitHeight = spriteSize.height;

        // resize unit
        if (this.model.size) {
            // find aspect ratio
            const aspectRatio = spriteSize.width / spriteSize.height;
            if (unitWidth > unitHeight) {
                unitWidth = this.model.size;
                unitHeight = unitWidth / aspectRatio;
            } else {
                unitHeight = this.model.size;
                unitWidth = unitHeight * aspectRatio;
            }
        }
        
        // Draw the sprite centered and scaled
        viewContext.drawImage(
            this.sprite,
            -unitWidth/2, // Center horizontally
            -unitHeight/2, // Center vertically
            unitWidth,
            unitHeight
        );
        
        viewContext.restore(); // remove both translation and rotation
    }

    drawHealth(screenPosition, viewContext) {
        viewContext.save(); // save state before any transformations

        const healthBarWidth = this.model.size;
        const healthBarHeight = this.healthBar.height;
        
        const healthBarPosition = {
            x: screenPosition.x - healthBarWidth/2,
            y: screenPosition.y - this.model.size / 2 - this.healthBar.height - 4
        }

        // Draw health bar background
        viewContext.fillStyle = this.healthBar.background;
        viewContext.fillRect(
            healthBarPosition.x, 
            healthBarPosition.y, 
            healthBarWidth, 
            healthBarHeight);
        
        // Draw health bar
        // TODO: get rid of magic constants
        const healthColor = this.model.health > 50 ? this.healthBar.colors.high : 
                          this.model.health > 25 ? this.healthBar.colors.medium : 
                          this.healthBar.colors.low;
        viewContext.fillStyle = healthColor;
        viewContext.fillRect(
            healthBarPosition.x, 
            healthBarPosition.y, 
            healthBarWidth * (this.model.health / 100), 
            healthBarHeight);
        
        viewContext.restore(); // restore state after transformations
    }

    drawSelection(screenPosition, viewContext) {
        viewContext.save(); // save state before any transformations
        viewContext.beginPath();
        viewContext.arc(
            screenPosition.x,
            screenPosition.y, 
            this.model.size / 2, 
            0, 
            Math.PI * 2
        );
        viewContext.strokeStyle = this.selection.color;
        viewContext.lineWidth = this.selection.lineWidth;
        viewContext.stroke();
        viewContext.restore(); // restore state after transformations
    }

    // drawMuzzleFlash(angle) {
    //     // If there's no active flash, start one
    //     if (!this.muzzleFlashActive) {
    //         this.muzzleFlashActive = true;
    //         this.muzzleFlashTimer = this.muzzleFlashDuration;
    //         this.muzzleFlashAngle = angle;
    //     }

    //     // Draw the flash
    //     this.viewContext.save();
    //     this.viewContext.beginPath();
    //     this.viewContext.strokeStyle = 'red';
    //     this.viewContext.lineWidth = 2;
        
    //     // Calculate end point of the flash
    //     const endX = this.unit.x + Math.cos(this.muzzleFlashAngle) * this.muzzleFlashLength;
    //     const endY = this.unit.y + Math.sin(this.muzzleFlashAngle) * this.muzzleFlashLength;
        
    //     this.viewContext.moveTo(this.unit.x, this.unit.y);
    //     this.viewContext.lineTo(endX, endY);
    //     this.viewContext.stroke();
    //     this.viewContext.restore();

    //     // Update timer and deactivate if needed
    //     this.muzzleFlashTimer--;
    //     if (this.muzzleFlashTimer <= 0) {
    //         this.muzzleFlashActive = false;
    //     }
    // }

    // drawExclamationMark() {
    //     const terrain = this.unit.game.terrain;
    //     const position = GamePosition.getScreenPosition(this.unit.x, this.unit.y, terrain.xOffset, terrain.yOffset);
    //     const size = 10
    //     const ctx = this.viewContext;

    //     ctx.save();
    //     ctx.fillStyle = 'black';
    //     ctx.font = `${size * 1.5}px Arial`;
    //     ctx.textAlign = 'center';
    //     ctx.textBaseline = 'middle';
    //     ctx.fillText('!', position.x, position.y);
    //     ctx.restore();
    // }

    // drawFire() {
    //     if (!this.unit.isOnFire && !this.unit.isDead) return;

    //     // Update and draw fire particles
    //     for (let i = this.fireParticles.length - 1; i >= 0; i--) {
    //         const particle = this.fireParticles[i];
    //         particle.lifetime--;
            
    //         if (particle.lifetime <= 0) {
    //             this.fireParticles.splice(i, 1);
    //             continue;
    //         }

    //         this.drawFireParticle(particle);
    //     }

    //     // Add new particles
    //     if (this.fireParticles.length < this.maxFireParticles) {
    //         this.addFireParticle();
    //     }
    // }

    // drawFireParticle(particle) {
    //     const ctx = this.viewContext;
    //     const terrain = this.unit.game.terrain;

    //     // Update particle position
    //     particle.x += particle.vx;
    //     particle.y += particle.vy;

    //     const position = GamePosition.getScreenPosition(particle.x, particle.y, terrain.xOffset, terrain.yOffset);

    //     const alpha = particle.lifetime / this.fireParticleLifetime;
    //     ctx.beginPath();
    //     ctx.arc(
    //         position.x,
    //         position.y,
    //         particle.size,
    //         0,
    //         Math.PI * 2
    //     );
    //     ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
    //     ctx.fill();
    // }

    // addFireParticle() {        
    //     const angle = Math.random() * Math.PI * 2;
    //     const speed = 0.5 + Math.random() * 1.5;
    //     const size = 2 + Math.random() * 3;
        
    //     // Random fire color (yellow to red)
    //     const r = 255;
    //     const g = 100 + Math.random() * 155;
    //     const b = 0;
        
    //     this.fireParticles.push({
    //         x: this.unit.x,
    //         y: this.unit.y,
    //         vx: Math.cos(angle) * speed,
    //         vy: -0.1 - Math.random() * 2,
    //         size: size,
    //         color: `${r}, ${g}, ${b}`,
    //         lifetime: this.fireParticleLifetime
    //     });
    // }

    // drawSmoke() {
    //     if (!this.unit.isOnFire && !this.unit.isDead) return;

    //     const ctx = this.viewContext;
    //     const terrain = this.unit.game.terrain;

    //     // Update and draw smoke particles
    //     for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
    //         const particle = this.smokeParticles[i];
    //         particle.lifetime--;
            
    //         if (particle.lifetime <= 0) {
    //             this.smokeParticles.splice(i, 1);
    //             continue;
    //         }

    //         this.drawSmokeParticle(particle);
    //     }

    //     // Add new particles
    //     if (this.smokeParticles.length < this.maxSmokeParticles) {
    //         this.addSmokeParticle();
    //     }
    // }

    // drawSmokeParticle(particle) {
    //     const ctx = this.viewContext;
    //     const terrain = this.unit.game.terrain;

        
    //     // Update particle position and size
    //     particle.x += particle.vx;
    //     particle.y += particle.vy;
    //     particle.size += 0.2;
    //     particle.vy -= 0.05;

    //     const position = GamePosition.getScreenPosition(particle.x, particle.y, terrain.xOffset, terrain.yOffset);

    //     // Draw particle
    //     const alpha = particle.lifetime / this.smokeParticleLifetime;
    //     ctx.beginPath();
    //     ctx.arc(
    //         position.x,
    //         position.y,
    //         particle.size,
    //         0,
    //         Math.PI * 2
    //     );
    //     ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
    //     ctx.fill();
    // }

    // addSmokeParticle() {
    //     const angle = Math.random() * Math.PI * 2;
    //     const speed = 0.02 + Math.random() * 0.8;
    //     const size = 3 + Math.random() * 2;
        
    //     this.smokeParticles.push({
    //         x: this.unit.x,
    //         y: this.unit.y,
    //         vx: Math.cos(angle) * speed,
    //         vy: -0.5 - Math.random(),
    //         size: size,
    //         lifetime: this.smokeParticleLifetime
    //     });
    // }

    drawDebugInfo(screenPosition, viewContext) {
        this.drawDebugVision(screenPosition, viewContext);
        // this.drawDebugSpeed(screenPosition);

        // this.drawDebugTexts(screenPosition);
/*
        if (this.unit.hasVisibleEnemies) {
            this.drawExclamationMark();
        }
        
        this.viewContext.restore();
        */
    }

    drawDebugVision(screenPosition, viewContext) {

        // U zničených jednotek nevykreslujeme zrakové pole
        if (this.model.isDead) return;

        const visionRange = this.model.vision.visionRange;
        const visionAngle = this.model.vision.currentAngle;
        const visionConeAngle = this.model.vision.coneAngle;

        const startAngle = visionAngle - visionConeAngle / 2;
        const endAngle = visionAngle + visionConeAngle / 2;
        const startPosition = screenPosition;

        // draw vision cone
        this.drawDebugVisionCone(
            startPosition,
            visionRange,
            startAngle,
            endAngle,
            viewContext
        );

        // draw vision vector
        const visionVector = new Vector2(this.model.vision.range, 0);
        visionVector.rotate(this.model.vision.currentAngle);
        const visionEndPosition = {
            x: startPosition.x + visionVector.x,
            y: startPosition.y + visionVector.y
        }
        this.drawDebugArrow(
            startPosition, 
            visionEndPosition,
            viewContext,
            { color: 'rgba(0, 0, 255, 0.3)' }
        );

        // draw vision target vector
        const visionTargetVector = new Vector2(this.model.vision.range, 0);
        visionTargetVector.rotate(this.model.vision.targetAngle);
        const visionTargetEndPosition = {
            x: startPosition.x + visionTargetVector.x,
            y: startPosition.y + visionTargetVector.y
        }
        this.drawDebugArrow(
            startPosition, 
            visionTargetEndPosition,
            viewContext,
            { color: 'rgba(255, 0, 255, 0.3)' }
        );
    }

    drawDebugArrow(startPosition, endPosition, viewContext, cfg = { color: 'rgba(0, 0, 255, 0.3)', lineWidth: 2, size: 10 }) {
        viewContext.save();

        // draw line
        viewContext.beginPath();
        viewContext.moveTo(startPosition.x, startPosition.y);
        viewContext.strokeStyle = cfg.color;
        viewContext.lineWidth = cfg.lineWidth;
        viewContext.lineTo(endPosition.x, endPosition.y);
        viewContext.stroke();

        // draw arrowhead
        viewContext.beginPath();
        viewContext.moveTo(endPosition.x, endPosition.y);
        const angle = Math.atan2(endPosition.y - startPosition.y, endPosition.x - startPosition.x);
        viewContext.lineTo(
            endPosition.x - cfg.size * Math.cos(angle - Math.PI / 6), 
            endPosition.y - cfg.size * Math.sin(angle - Math.PI / 6)
        );
        
        viewContext.moveTo(endPosition.x, endPosition.y);
        viewContext.lineTo(
            endPosition.x - cfg.size * Math.cos(angle + Math.PI / 6), 
            endPosition.y - cfg.size * Math.sin(angle + Math.PI / 6)
        );
        viewContext.stroke();
        viewContext.restore();
    }

    drawDebugVisionCone(startPosition, diameter, startAngle, endAngle, viewContext, cfg = { color: 'rgba(255, 255, 0, 0.1)' }) {
        // Vykreslíme zrakové pole pouze v debug módu
        viewContext.save();

        viewContext.beginPath();
        viewContext.moveTo(startPosition.x, startPosition.y);

        viewContext.arc(
            startPosition.x, 
            startPosition.y, 
            diameter, 
            startAngle, 
            endAngle
        );
        viewContext.lineTo(startPosition.x, startPosition.y); // Uzavřeme cestu
        viewContext.fillStyle = cfg.color;
        viewContext.fill();
        viewContext.restore();   
    }

    drawDebugTexts() {
        // Vykreslíme texty pro debug
        if (!this.debugMode) return;
       
        const viewContext = this.viewContext;
        const terrain = this.unit.game.terrain;

        const screenX = this.unit.x - terrain.offsetX;
        const screenY = this.unit.y - terrain.offsetY;

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


} 
