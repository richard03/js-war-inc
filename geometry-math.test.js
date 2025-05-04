const GeometryMath = require('./geometry-math.js');

describe('GeometryMath', () => {

    describe('normalizeAngle', () => {
        it('should return the angle in the range of -PI to PI', () => {
            // do nothing for small angles
            expect(GeometryMath.normalizeAngle(0)).toBeCloseTo(0);
            expect(GeometryMath.normalizeAngle(1)).toBeCloseTo(1);
            expect(GeometryMath.normalizeAngle(-1)).toBeCloseTo(-1);
            expect(GeometryMath.normalizeAngle(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
            expect(GeometryMath.normalizeAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
            expect(GeometryMath.normalizeAngle(Math.PI)).toBeCloseTo(Math.PI);
            expect(GeometryMath.normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI);

            // normalize big angles
            expect(GeometryMath.normalizeAngle(1 + 4 * Math.PI)).toBeCloseTo(1);
            expect(GeometryMath.normalizeAngle(1 - 4 * Math.PI)).toBeCloseTo(1);
            expect(GeometryMath.normalizeAngle(-1 + 4 * Math.PI)).toBeCloseTo(-1);
            expect(GeometryMath.normalizeAngle(-1 - 4 * Math.PI)).toBeCloseTo(-1);
            expect(GeometryMath.normalizeAngle(Math.PI * 1.5)).toBeCloseTo(-Math.PI / 2);
            expect(GeometryMath.normalizeAngle(-Math.PI * 1.5)).toBeCloseTo(Math.PI / 2);
        });
    });

    describe('getAngleToTarget', () => {
        it('should return the correct angle for a vector from the current position to the target', () => {
            let currentPosition = { x: 0, y: 0 };

            let targetPosition = { x: 1, y: 1 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.PI / 4);

            targetPosition = { x: -1, y: -1 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(-Math.PI * 3 / 4);

            targetPosition = { x: 2, y: -2 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(-Math.PI / 4);

            targetPosition = { x: -10, y: 10 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.PI * 3 / 4);

            targetPosition = { x: 5, y: 7 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(0.95055);

            currentPosition = { x: 3, y: 5 };

            targetPosition = { x: 4, y: 6 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.PI / 4);

            targetPosition = { x: 2, y: 4 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(-Math.PI * 3 / 4);

            targetPosition = { x: 5, y: 3 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(-Math.PI / 4);

            targetPosition = { x: -7, y: 15 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.PI * 3 / 4);

            targetPosition = { x: 8, y: 12 };
            expect(GeometryMath.getAngleToTarget(currentPosition, targetPosition)).toBeCloseTo(0.95055);
        });
    });

    describe('getDistanceToTarget', () => {
        it('should return the correct distance for a vector from the current position to the target', () => {
            let currentPosition = { x: 0, y: 0 };

            let targetPosition = { x: 1, y: 1 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(2));

            targetPosition = { x: 2, y: 2 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(8));

            targetPosition = { x: 3, y: 4 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(5);

            currentPosition = { x: 3, y: 5 };

            targetPosition = { x: 4, y: 6 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(2));

            targetPosition = { x: 2, y: 4 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(2));    

            targetPosition = { x: 5, y: 3 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(8));

            targetPosition = { x: -7, y: 15 };
            expect(GeometryMath.getDistanceToTarget(currentPosition, targetPosition)).toBeCloseTo(Math.sqrt(200));
        });
    });


});