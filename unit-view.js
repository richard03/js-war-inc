class UnitView {
    constructor(cfg = {}) {
        this.debugMode = typeof cfg.debugMode == "undefined" ? cfg.debugMode : true;
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
        this.flashActive = cfg.flashActive || false;
        this.flashTimer = cfg.flashTimer || 0;
        this.flashDuration = cfg.flashDuration || 6; // 0.1 sekundy při 60 FPS
        this.flashColor = cfg.flashColor || '#ffffff';
    }

    startFlash() {
        this.flashActive = true;
        this.flashTimer = this.flashDuration;
    }

    update() {
        if (this.flashActive) {
            this.flashTimer--;
            if (this.flashTimer <= 0) {
                this.flashActive = false;
            }
        }
    }

    drawUnit(ctx, x, y, size, isSelected) {
        // Draw unit circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        
        // Use flash color if active, otherwise use current color
        ctx.fillStyle = this.flashActive ? this.flashColor : this.currentColor;
        ctx.fill();
        
        // Draw selection border if selected
        if (isSelected) {
            ctx.strokeStyle = this.selectedColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    drawHealth(ctx, x, y, size, health) {
        // Health bar dimensions
        const healthBarWidth = 20;
        const healthBarHeight = 4;
        const healthBarX = x - healthBarWidth / 2;
        const healthBarY = y - size - 8;
        
        // Draw health bar background
        ctx.fillStyle = this.healthBarBackground;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Draw health bar
        const healthColor = health > 50 ? this.healthColors.high : 
                          health > 25 ? this.healthColors.medium : 
                          this.healthColors.low;
        ctx.fillStyle = healthColor;
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (health / 100), healthBarHeight);
        
        // Draw health text
        ctx.fillStyle = this.textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(health)}%`, x, y - size - 20);
    }

    drawVision(ctx, x, y, vision) {
        // Vykreslíme zrakové pole pouze v debug módu
        if (!this.debugMode) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Vypočítáme koncové body kužele
        const startAngle = vision.currentVisionAngle - vision.visionConeAngle / 2;
        const endAngle = vision.currentVisionAngle + vision.visionConeAngle / 2;
        
        // Vykreslíme oblouk
        ctx.arc(x, y, vision.visionRange, startAngle, endAngle);
        
        // Vrátíme se zpět do středu
        ctx.lineTo(x, y);
        
        // Nastavíme barvu a průhlednost
        ctx.fillStyle = this.visionColor;
        ctx.fill();
        
        ctx.restore();
    }
} 