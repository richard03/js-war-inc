const FuzzyMath = require('./fuzzy-math');

describe('FuzzyMath', () => {
    describe('isClose', () => {
        test('should return true when values are within tolerance', () => {
            expect(FuzzyMath.isClose(5, 6, 1)).toBe(true);
            expect(FuzzyMath.isClose(5, 5.5, 1)).toBe(true);
            expect(FuzzyMath.isClose(5, 4.5, 1)).toBe(true);
        });

        test('should return false when values are outside tolerance', () => {
            expect(FuzzyMath.isClose(5, 7, 1)).toBe(false);
            expect(FuzzyMath.isClose(5, 3, 1)).toBe(false);
        });

        test('should handle negative values', () => {
            expect(FuzzyMath.isClose(-5, -6, 1)).toBe(true);
            expect(FuzzyMath.isClose(-5, -7, 1)).toBe(false);
        });

        test('should handle zero tolerance', () => {
            expect(FuzzyMath.isClose(5, 5, 0)).toBe(true);
            expect(FuzzyMath.isClose(5, 5.1, 0)).toBe(false);
        });

        test('should use defaultTolerance when tolerance is not provided', () => {
            expect(FuzzyMath.isClose(5, 5.005)).toBe(true);
            expect(FuzzyMath.isClose(5, 5.02)).toBe(false);
        });

        test('should handle defaultTolerance with negative values', () => {
            expect(FuzzyMath.isClose(-5, -5.005)).toBe(true);
            expect(FuzzyMath.isClose(-5, -5.02)).toBe(false);
        });
    });

    describe('isInRange', () => {
        test('should return true when value is within range', () => {
            expect(FuzzyMath.isInRange(5, 0, 10)).toBe(true);
            expect(FuzzyMath.isInRange(0, 0, 10)).toBe(true);
            expect(FuzzyMath.isInRange(10, 0, 10)).toBe(true);
        });

        test('should return false when value is outside range', () => {
            expect(FuzzyMath.isInRange(-1, 0, 10)).toBe(false);
            expect(FuzzyMath.isInRange(11, 0, 10)).toBe(false);
        });

        test('should handle negative ranges', () => {
            expect(FuzzyMath.isInRange(-5, -10, 0)).toBe(true);
            expect(FuzzyMath.isInRange(-11, -10, 0)).toBe(false);
        });

        test('should handle reversed min/max', () => {
            expect(FuzzyMath.isInRange(5, 10, 0)).toBe(false);
            expect(FuzzyMath.isInRange(5, 0, 10)).toBe(true);
        });
    });
}); 