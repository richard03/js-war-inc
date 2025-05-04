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
        // if value is scalar
        if (typeof value1 === 'number' && typeof value2 === 'number') {
            return Math.abs(value1 - value2) <= tolerance;
        }
        // if value is a simple array
        if (Array.isArray(value1) && Array.isArray(value2)) {
            return value1.every((v, i) => FuzzyMath.isClose(v, value2[i], tolerance));
        }
        // if value has components like x, y, z, etc.
        if (typeof value1 === 'object' && typeof value2 === 'object') {
            for (const key in value1) {
                if (!FuzzyMath.isClose(value1[key], value2[key], tolerance)) {
                    return false;
                }
            }
            return true;
        }
        return false;
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
        return value + (Math.random() - 0.5) * 2 * value * factor;
    }
}

if (typeof module !== 'undefined') {
    module.exports = FuzzyMath;
}
