class ViewSystem {
    constructor(isEnemy) {
        this.isEnemy = isEnemy;
        this.originalColor = isEnemy ? '#ff0000' : '#00ff00';
        this.currentColor = this.originalColor;
        this.selectedColor = '#00ff00';
        this.visionColor = 'rgba(255, 255, 0, 0.1)';
        this.visionBorderColor = 'rgba(255, 255, 0, 0.3)';
        this.healthColors = {
            high: '#00ff00',
            medium: '#ffff00',
            low: '#ff0000'
        };
        this.textColor = 'white';
        this.healthBarBackground = 'rgba(0, 0, 0, 0.5)';
        
        // Flash effect properties
        this.flashActive = false;
        this.flashTimer = 0;
        this.flashDuration = 5; // frames
        this.flashColor = '#ffffff';
    }

    updateColor(seesEnemy) {
        if (seesEnemy) {
            this.currentColor = this.isEnemy ? '#ff0000' : '#0000ff';
        } else {
            this.currentColor = this.originalColor;
        }
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
        // Draw vision cone
        ctx.beginPath();
        ctx.moveTo(x, y);
        
        // Calculate vision cone endpoints
        const startAngle = vision.currentVisionAngle - vision.visionConeAngle / 2;
        const endAngle = vision.currentVisionAngle + vision.visionConeAngle / 2;
        
        // Draw vision cone arc
        ctx.arc(x, y, vision.visionRange, startAngle, endAngle);
        
        // Return to center
        ctx.lineTo(x, y);
        
        // Fill vision cone
        ctx.fillStyle = this.visionColor;
        ctx.fill();
        
        // Draw vision cone border
        ctx.strokeStyle = this.visionBorderColor;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
} 