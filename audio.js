class AudioSystem {
    constructor(cfg = {}) {
        this.debugMode = typeof cfg.debugMode == "undefined" ? cfg.debugMode : true;
        
        // Vytvoříme audio element pro zvuk výstřelu
        this.shootSound = new Audio('assets/sounds/shoot.mp3');
        this.shootSound.volume = 0.3; // Nastavíme hlasitost na 30%
    }

    playShootSound() {
        // Resetujeme zvuk na začátek a přehrajeme
        this.shootSound.currentTime = 0;
        this.shootSound.play().catch(error => {
            if (this.debugMode) console.log('Nepodařilo se přehrát zvuk:', error);
        });
    }
} 