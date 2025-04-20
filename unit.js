// Tento soubor vyžaduje physics.js, který musí být načten před unit.js
// physics.js obsahuje fyzikální výpočty pro pohyb jednotek

class Unit {
    constructor(game, cfg = {}) {
        this.game = game;
        this.debugMode = this.game.debugMode;
        this.x = cfg.x;
        this.y = cfg.y;
        this.size = cfg.size || 20;
        this.isSelected = cfg.isSelected || false;
        this.targetX = this.x;
        this.targetY = this.y;
        this.personalSpace = cfg.personalSpace || 40;
        this.isEnemy = cfg.isEnemy;
        this.isDead = typeof cfg.isDead == "undefined" ? false : cfg.isDead;
        this.isOnFire = typeof cfg.isOnFire == "undefined" ? false : cfg.isOnFire;
        this.isShooting = false;
        this.shootingTarget = null;
        this.shootCooldown = cfg.shootCooldown || 0;
        this.health = cfg.health || 100;
        this.hasVisibleEnemies = cfg.hasVisibleEnemies || false;
        this.lastAttacker = null;
        this.seesObstacle = false;
                
        // Vytvoříme instance pomocných systémů
        this.vision = new UnitVision(this);
        this.movement = new UnitMovement(this);
        this.combat = new UnitCombat(this);
        this.view = new UnitView(this, game.view.ctx, {
            color: this.isEnemy ? '#ff0000' : '#00ff00'
        });
        this.audio = new AudioSystem({debugMode: this.debugMode});

        // Formation cohesion properties
        this.formationCohesionRadius = 50; // Distance to maintain from other units in formation
        this.formationCohesionForce = 0.5; // Strength of cohesion force
    }

    update() {
        // Pokud je jednotka zničena, pouze aktualizujeme oheň
        if (this.isDead) {
            this.isOnFire = true; // Zničené jednotky vždy hoří
            return;
        }

        this.vision.update();

        this.movement.update();

        this.combat.update();

        this.view.update();
    }

    select() {
        this.isSelected = true;
        if (this.debugMode) console.log("Unit selected");
        // TODO: Vykreslit indikaci že je jednotka vybraná
    }

    deselect() {
        this.isSelected = false;
        if (this.debugMode) console.log("Unit deselected");
    }

    recieveDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        if (this.health <= 0) {
            this.isDead = true;
        }
        // TODO: Grafický efekt zásahu?
    }

    isPointInside(x, y) {
        // Zničené jednotky nelze vybrat
        if (this.isDead) return false;

        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.size;
    }
    
    isInSelectionBox(startX, startY, endX, endY) {
        // Mrtvé jednotky nelze vybrat
        if (this.isDead) return false;

        const left = Math.min(startX, endX);
        const right = Math.max(startX, endX);
        const top = Math.min(startY, endY);
        const bottom = Math.max(startY, endY);
        
        return this.x >= left && this.x <= right && this.y >= top && this.y <= bottom;
    }

    moveTo(x, y) {
        // Zničené jednotky se nemohou pohybovat
        if (this.isDead) return;

        this.movement.moveTo(x, y);
    }
} 