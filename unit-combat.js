class UnitCombat {
    constructor(cfg = {}) {
        this.debugMode = typeof cfg.debugMode == "undefined" ? cfg.debugMode : true;
        this.isEnemy = cfg.isEnemy;
        this.initialShotDelay = cfg.initialShotDelay || 0;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.hasSeenEnemy = false;
        this.audio = new AudioSystem({debugMode: this.debugMode});
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
    }

    shoot(targetUnit) {

        // Přehráme zvuk výstřelu
        this.audio.playShootSound();

        // 90% šance na zásah
        if (Math.random() < 0.9) {
            // Náhodné poškození 0-100%
            const damage = Math.random() * 100;
            targetUnit.recieveDamage(damage);
            // Uložíme si útočníka
            targetUnit.lastAttacker = this;
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
} 