class UnitCombat {
    constructor(cfg = {}) {
        this.debugMode = typeof cfg.debugMode == "undefined" ? cfg.debugMode : true;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.health = cfg.health || 100;
        this.isEnemy = cfg.isEnemy;
        this.isDead = cfg.isDead || false;
        this.initialShotDelay = cfg.initialShotDelay || 0;
        this.hasSeenEnemy = false;
        this.audio = new AudioSystem();
        this.lastAttacker = null;
    }

    update() {
        // Snížíme cooldown střelby
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Snížíme počáteční zpoždění
        if (this.initialShotDelay > 0) {
            this.initialShotDelay--;
        }

        // Kontrola smrti
        if (this.health <= 0) {
            this.isDead = true;
            this.health = 0;
        }
    }

    shoot(target) {
        // Nemůžeme střílet, pokud jsme mrtví nebo máme počáteční zpoždění
        if (this.isDead || this.initialShotDelay > 0) return;

        // Přehráme zvuk výstřelu
        this.audio.playShootSound();

        // 90% šance na zásah
        if (Math.random() < 0.9) {
            // Náhodné poškození 0-100%
            const damage = Math.random() * 100;
            target.health = Math.max(0, target.health - damage);
            // Uložíme si útočníka
            target.lastAttacker = this;
        }
        
        // Základní cooldown střelby (180 snímků = 3 sekundy při 60 FPS)
        const baseCooldown = 180;
        // Náhodná složka (0-20% navíc)
        const randomVariation = Math.random() * 0.2;
        // Celkový cooldown (180-216 snímků = 3-3.6 sekundy)
        this.shootCooldown = Math.floor(baseCooldown * (1 + randomVariation));
    }

    canShoot() {
        return this.shootCooldown === 0 && !this.isDead && this.initialShotDelay === 0;
    }

    // Metoda pro nastavení počátečního zpoždění při prvním spatření nepřítele
    setInitialDelay() {
        if (!this.hasSeenEnemy) {
            this.initialShotDelay = 120; // 2 sekundy při 60 FPS
            this.hasSeenEnemy = true;
        }
    }

    drawHealth(ctx, x, y, size) {
        // Health bar
        const healthBarWidth = 20;
        const healthBarHeight = 4;
        const healthBarX = x - healthBarWidth / 2;
        const healthBarY = y - size - 8;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        
        // Health
        ctx.fillStyle = this.health > 50 ? '#00ff00' : this.health > 25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (this.health / 100), healthBarHeight);
        
        // Health text
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.health)}%`, x, y - size - 20);
    }
} 