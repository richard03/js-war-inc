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
    }

    draw() {
        // Pokud je jednotka mrtvá, nevykreslujeme ji
        if (this.unit.isDead) return;

        // Vykreslíme jednotku
        this.drawUnit(this.unit.x, this.unit.y, this.unit.size, this.unit.isSelected, this.unit.hasVisibleEnemies);
        
        // Vykreslíme zrakové pole
        this.drawVision(this.unit.x, this.unit.y, this.unit.vision);

        // Vykreslíme zdraví
        this.drawHealth(this.unit.x, this.unit.y, this.unit.size, this.unit.health);
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

    drawMuzzleFlash(x, y, angle) {
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
        const endX = x + Math.cos(this.muzzleFlashAngle) * this.muzzleFlashLength;
        const endY = y + Math.sin(this.muzzleFlashAngle) * this.muzzleFlashLength;
        
        this.viewContext.moveTo(x, y);
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

    drawUnit(x, y, size, isSelected, hasVisibleEnemies) {
        // Draw unit circle
        this.viewContext.beginPath();
        this.viewContext.arc(x, y, size, 0, Math.PI * 2);
        
        // Use flash color if active, otherwise use current color
        this.viewContext.fillStyle = this.flashActive ? this.flashColor : this.currentColor;
        this.viewContext.fill();
        
        // Draw selection border if selected
        if (isSelected) {
            this.viewContext.strokeStyle = this.selectedColor;
            this.viewContext.lineWidth = 3;
            this.viewContext.stroke();
        }

        // Draw exclamation mark in debug mode if unit sees enemies
        if (this.debugMode && hasVisibleEnemies) {
            this.drawExclamationMark(x, y, size);
        }
    }

    drawHealth(x, y, size, health) {
        // Health bar dimensions
        const healthBarWidth = 20;
        const healthBarHeight = 4;
        const healthBarX = x - healthBarWidth / 2;
        const healthBarY = y - size - 8;
        
        // Draw health bar background
        this.viewContext.fillStyle = this.healthBarBackground;
        this.viewContext.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw health bar
        const healthColor = health > 50 ? this.healthColors.high : 
                          health > 25 ? this.healthColors.medium : 
                          this.healthColors.low;
        this.viewContext.fillStyle = healthColor;
        this.viewContext.fillRect(healthBarX, healthBarY, healthBarWidth * (health / 100), healthBarHeight);
        
        // Draw health text
        this.viewContext.fillStyle = this.textColor;
        this.viewContext.font = '12px Arial';
        this.viewContext.textAlign = 'center';
        this.viewContext.fillText(`${Math.round(health)}%`, x, y - size - 20);
    }

    drawVision(x, y, vision) {
        // Vykreslíme zrakové pole pouze v debug módu
        if (!this.debugMode) return;

        this.viewContext.save();
        this.viewContext.beginPath();
        this.viewContext.moveTo(x, y);
        
        // Vypočítáme koncové body kužele
        const startAngle = vision.currentVisionAngle - vision.visionConeAngle / 2;
        const endAngle = vision.currentVisionAngle + vision.visionConeAngle / 2;
        
        // Vykreslíme oblouk
        this.viewContext.arc(x, y, vision.visionRange, startAngle, endAngle);
        
        // Vrátíme se zpět do středu
        this.viewContext.lineTo(x, y);
        
        // Nastavíme barvu a průhlednost
        this.viewContext.fillStyle = this.visionColor;
        this.viewContext.fill();
        
        this.viewContext.restore();
    }
} 