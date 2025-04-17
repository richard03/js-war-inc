class Formation {
    constructor(units) {
        this.units = units;
        this.targetPosition = null;
        this.formationShape = 'line'; // Default formation shape
        this.spacing = 30; // Distance between units in formation
        
        // Store initial relative positions
        this.relativePositions = new Map();
        this.updateRelativePositions();
    }

    updateRelativePositions() {
        // Calculate center of formation
        const centerX = this.units.reduce((sum, unit) => sum + unit.x, 0) / this.units.length;
        const centerY = this.units.reduce((sum, unit) => sum + unit.y, 0) / this.units.length;

        // Store relative positions from center
        for (const unit of this.units) {
            this.relativePositions.set(unit, {
                x: unit.x - centerX,
                y: unit.y - centerY
            });
        }
    }

    update() {
        // Always maintain formation shape, even when not moving
        let currentCenterX = this.units.reduce((sum, unit) => sum + unit.x, 0) / this.units.length;
        let currentCenterY = this.units.reduce((sum, unit) => sum + unit.y, 0) / this.units.length;

        if (this.targetPosition) {
            // Calculate direction to target
            const dx = this.targetPosition.x - currentCenterX;
            const dy = this.targetPosition.y - currentCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If we're close enough to target, stop moving but maintain formation
            if (distance < 5) {
                this.targetPosition = null;
            } else {
                // Calculate movement vector
                const moveX = dx * 0.1; // 10% of distance per update
                const moveY = dy * 0.1;

                // Move formation center
                currentCenterX += moveX;
                currentCenterY += moveY;
            }
        }

        // Move each unit to maintain formation shape
        for (const unit of this.units) {
            const relativePos = this.relativePositions.get(unit);
            const targetX = currentCenterX + relativePos.x;
            const targetY = currentCenterY + relativePos.y;
            
            // Calculate direction to target position
            const unitDx = targetX - unit.x;
            const unitDy = targetY - unit.y;
            const unitDistance = Math.sqrt(unitDx * unitDx + unitDy * unitDy);

            // Always try to maintain formation, even if not moving to target
            if (unitDistance > 2) { // Smaller threshold for formation maintenance
                // Use a gentler force for formation maintenance
                const moveForce = Math.min(unitDistance * 0.1, 1.0);
                unit.moveTo(
                    unit.x + unitDx * moveForce,
                    unit.y + unitDy * moveForce
                );
            }
        }

        // Periodically update relative positions to prevent drift
        if (Math.random() < 0.1) { // 10% chance each update
            this.updateRelativePositions();
        }
    }

    moveTo(x, y) {
        this.targetPosition = { x, y };
    }

    draw(ctx) {
        // Draw formation center
        const centerX = this.units.reduce((sum, unit) => sum + unit.x, 0) / this.units.length;
        const centerY = this.units.reduce((sum, unit) => sum + unit.y, 0) / this.units.length;

        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fill();

        // Draw target if exists
        if (this.targetPosition) {
            ctx.beginPath();
            ctx.arc(this.targetPosition.x, this.targetPosition.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fill();

            // Draw line from center to target
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(this.targetPosition.x, this.targetPosition.y);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.stroke();
        }

        // Draw lines between units to show formation
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.lineWidth = 1;

        for (const unit of this.units) {
            const relativePos = this.relativePositions.get(unit);
            const targetX = centerX + relativePos.x;
            const targetY = centerY + relativePos.y;

            ctx.beginPath();
            ctx.moveTo(unit.x, unit.y);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
        }
    }
} 