class FuzzyMath {
    static defaultTolerance = 0.01;
    
    /**
     * Porovná dvě hodnoty s danou tolerancí
     * @param {number} value1 - První hodnota
     * @param {number} value2 - Druhá hodnota
     * @param {number} [tolerance=FuzzyMath.defaultTolerance] - Tolerance
     * @returns {boolean} True, pokud jsou hodnoty blízko sebe, jinak false
     */
    static isClose(value1, value2, tolerance = FuzzyMath.defaultTolerance) {
        return Math.abs(value1 - value2) <= tolerance;
    }

    /**
     * Ověří, zda je hodnota v daném rozsahu s danou tolerancí
     * @param {number} value - Hodnota k ověření
     * @param {number} min - Minimální hodnota
     * @param {number} max - Maximální hodnota
     * @param {number} [tolerance=FuzzyMath.defaultTolerance] - Tolerance
     * @returns {boolean} True, pokud je hodnota v rozsahu, jinak false
     */
    static isInRange(value, min, max, tolerance = FuzzyMath.defaultTolerance) {
        return value >= min && value <= max;
    }

    /**
     * Přidá náhodný faktor k hodnotě
     * @param {number} value - Hodnota k změně
     * @param {number} [factor=0.1] - Faktor změny
     * @returns {number} Nová hodnota
     */
    static addRandomFactor(value, factor = 0.1) {
        return value + (Math.random() - 0.5) * value * factor;
    }
}

if (typeof module !== 'undefined') {
    module.exports = FuzzyMath;
}
