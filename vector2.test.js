const Vector2 = require('./vector2.js');

describe('Vector2', () => {
    describe('constructor', () => {
        test('should create a vector with x and y coordinates', () => {
            const vector = new Vector2(3, 4);
            expect(vector.x).toBe(3);
            expect(vector.y).toBe(4);
        });

        test('should use default values when no arguments are provided', () => {
            const vector = new Vector2();
            expect(vector.x).toBe(0);
            expect(vector.y).toBe(0);
        });
    });

    describe('basic operations', () => {
        test('should add two vectors', () => {
            const v1 = new Vector2(1, 2);
            const v2 = new Vector2(3, 4);
            const result = v1.add(v2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        test('should subtract two vectors', () => {
            const v1 = new Vector2(3, 4);
            const v2 = new Vector2(1, 2);
            const result = v1.subtract(v2);
            expect(result.x).toBe(2);
            expect(result.y).toBe(2);
        });

        test('should multiply vector by scalar', () => {
            const v = new Vector2(2, 3);
            const result = v.multiplyScalar(2);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });
    });

    describe('vector properties', () => {
        test('should calculate vector length', () => {
            const v = new Vector2(3, 4);
            expect(v.length).toBe(5);
        });

        test('should calculate vector angle', () => {
            const v = new Vector2(1, 0);
            expect(v.getAngle()).toBe(0);
            const v2 = new Vector2(0, 1);
            expect(v2.getAngle()).toBe(Math.PI / 2);
        });
    });

    describe('vector transformations', () => {
        test('should normalize vector', () => {
            const v = new Vector2(3, 4);
            const normalized = v.normalize();
            expect(normalized.length).toBeCloseTo(1);
        });

        test('should rotate vector', () => {
            const v = new Vector2(1, 0);
            const rotated = v.rotate(Math.PI / 2);
            expect(rotated.x).toBeCloseTo(0);
            expect(rotated.y).toBeCloseTo(1);
        });
    });

    describe('vector comparisons', () => {
        test('should calculate angle between vectors', () => {
            let v1 = new Vector2(1, 0);
            let v2 = new Vector2(0, 1);
            expect(v1.angleTo(v2)).toBe(Math.PI / 2);

            v1 = new Vector2(5, 0);
            v2 = new Vector2(-5, 0);
            expect(v1.angleTo(v2)).toBe(Math.PI);

            v1 = new Vector2(1, 0);
            v2 = new Vector2(1, 0);
            expect(v1.angleTo(v2)).toBe(0);

            v1 = new Vector2(3, 3); 
            v2 = new Vector2(-3, 3);
            expect(v1.angleTo(v2)).toBe(Math.PI / 2);

        });

        test('should check if vectors are parallel', () => {
            const v1 = new Vector2(1, 0);
            const v2 = new Vector2(2, 0);
            expect(v1.isParalelTo(v2)).toBe(true);
        });
    });
});