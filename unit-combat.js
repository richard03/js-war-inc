class UnitCombat {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.debugMode = unit.debugMode;

        this.currentTarget = null;
        this.shotDelay = cfg.shotDelay || 120;
        this.shotCooldown = FuzzyMath.addRandomFactor(this.shotDelay, 0.1);
        this.accuracy = cfg.accuracy || 0.9;

        this.lastAttacker = null;
    }

    update() {

        // Má-li zaměřeného nepřítele, zjisti jestli není mrtvý
        if (this.currentTarget && this.currentTarget.isDead) {
            this.currentTarget = null;
            this.shotCooldown = FuzzyMath.addRandomFactor(this.shotDelay, 0.1);
        }
            
        // Má-li zaměřeného nepřítele, zjisti jestli je v zorném poli
        // Pokud ano, pokus se na něj vystřelit
        if (
            this.currentTarget 
            && this.unit.vision.isInVisionCone(this.currentTarget.x, this.currentTarget.y)
        ) {
            this.unit.vision.startTurningTo(this.currentTarget.x, this.currentTarget.y);
            this.shotCooldown--;
            if (this.canShoot()) {
                this.shoot(this.currentTarget);
            }
        }

        // Nemá-li zaměřeného nepřítele, najdi nový cíl
        if (!this.currentTarget && this.lastAttacker && !this.lastAttacker.isDead) {
            // Najdi nejbližšího nepřítele
            this.currentTarget = this.lastAttacker;
        }

        // Nemá-li zaměřeného nepřítele, najdi nový cíl
        if (!this.currentTarget) {
            // Najdi nejbližšího nepřítele
            this.currentTarget = this.unit.vision.findNearestEnemy();
        }
    }

    canShoot() {
        if (this.shotCooldown > 0 || this.unit.isDead) {
            return false;
        }
        return true;
    }

    shoot(targetUnit) {
        // Zničené jednotky nemohou střílet
        if (this.unit.isDead) return;

        // jsme ve stejném teamu?
        if (this.unit.isEnemy === targetUnit.isEnemy) return;

        // Přehráme zvuk výstřelu a zobrazíme záblesk
        this.unit.audio.playShootSound();
        this.shotCooldown = FuzzyMath.addRandomFactor(this.shotDelay, 0.1);

        if (Math.random() < this.accuracy) {  // šance na zásah
            const damage = Math.random() * 100;  // Náhodné poškození 0-100%
            targetUnit.recieveDamage(damage);
        }
                    
        targetUnit.combat.lastAttacker = this.unit; // Nepřítel si zapamatuje, kdo jej střílel
    }
} 