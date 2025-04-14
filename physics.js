class Physics {
    static calculateForce(targetX, targetY, currentX, currentY, mass = 1) {
        // Výpočet síly potřebné k dosažení cíle
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Pokud jsme dostatečně blízko, vrátíme nulovou sílu
        if (distance <= 1) {
            return { x: 0, y: 0, magnitude: 0 };
        }
        
        // Výpočet síly (F = ma, kde a je zrychlení potřebné k dosažení cíle)
        const forceMagnitude = mass * 0.1; // Konstantní zrychlení
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        
        return {
            x: forceX,
            y: forceY,
            magnitude: forceMagnitude
        };
    }
    
    static applyForce(force, velocity, mass = 1, friction = 0.01) {
        // Aplikace síly na rychlost (F = ma, v = v0 + at)
        const accelerationX = force.x / mass;
        const accelerationY = force.y / mass;
        
        // Aktualizace rychlosti s třením
        velocity.x = (velocity.x + accelerationX) * (1 - friction);
        velocity.y = (velocity.y + accelerationY) * (1 - friction);
        
        // Pokud je rychlost velmi malá, zastavíme pohyb
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (speed < 0.01) {
            velocity.x = 0;
            velocity.y = 0;
        }
        
        return velocity;
    }
    
    static calculateMovement(velocity, position) {
        // Výpočet nové pozice na základě rychlosti
        return {
            x: position.x + velocity.x,
            y: position.y + velocity.y
        };
    }
    
    static calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    static calculateAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
} 