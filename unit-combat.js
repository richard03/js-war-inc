class UnitCombat {
    constructor(unit, cfg = {}) {
        this.unit = unit;
        this.debugMode = unit.debugMode;
    }

    

    

    
    // Metoda pro nastavení počátečního zpoždění při prvním spatření nepřítele
    setInitialDelay() {
        if (!this.hasSeenEnemy) {
            this.initialShotDelay = 120; // 2 sekundy při 60 FPS
            this.hasSeenEnemy = true;
        }
    }
} 