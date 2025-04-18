class FuzzyMath {
    static defaultTolerance = 0.01;
    
    static isClose(value1, value2, tolerance = FuzzyMath.defaultTolerance) {
        return Math.abs(value1 - value2) <= tolerance;
    }

    static isInRange(value, min, max, tolerance = FuzzyMath.defaultTolerance) {
        return value >= min && value <= max;
    }
}

if (typeof module !== 'undefined') {
    module.exports = FuzzyMath;
}
