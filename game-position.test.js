const GamePosition = require('./game-position.js');

describe('GamePosition', () => {
    describe('getScreenPosition', () => {
        it('should convert map position to screen position with offset', () => {
            const mapX = 100;
            const mapY = 200;
            const offsetX = 50;
            const offsetY = 75;
            
            const result = GamePosition.getScreenPosition(mapX, mapY, offsetX, offsetY);
            
            expect(result).toEqual({
                x: 50,  // 100 - 50
                y: 125  // 200 - 75
            });
        });
        
        it('should handle zero offsets', () => {
            const mapX = 100;
            const mapY = 200;
            const offsetX = 0;
            const offsetY = 0;
            
            const result = GamePosition.getScreenPosition(mapX, mapY, offsetX, offsetY);
            
            expect(result).toEqual({
                x: 100,   // 100 + 0
                y: 200   // 200 + 0
            });
        });
    });
    
    describe('getMapPosition', () => {
        it('should convert screen position to map position with offset', () => {
            const screenX = 50;
            const screenY = 125;
            const offsetX = 50;
            const offsetY = 75;
            
            const result = GamePosition.getMapPosition(screenX, screenY, offsetX, offsetY);
            
            expect(result).toEqual({
                x: 100,  // 50 + 50
                y: 200   // 125 + 75
            });
        });
        
        it('should handle zero offsets', () => {
            const screenX = 150;
            const screenY = 275;
            const offsetX = 0;
            const offsetY = 0;
            
            const result = GamePosition.getMapPosition(screenX, screenY, offsetX, offsetY);
            
            expect(result).toEqual({
                x: 150,  // 150 + 0
                y: 275   // 275 + 0
            });
        });
    });
    
    describe('getDirection', () => {
        it('should calculate correct direction between two points', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = 1;
            const toY = 1;
            
            const result = GamePosition.getDirection(fromX, fromY, toX, toY);
            
            expect(result).toBeCloseTo(Math.PI/4); // 45 stupňů
        });
        
        it('should handle vertical direction', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = 0;
            const toY = 1;
            
            const result = GamePosition.getDirection(fromX, fromY, toX, toY);
            
            expect(result).toBeCloseTo(Math.PI/2); // 90 stupňů
        });
        
        it('should handle horizontal direction', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = 1;
            const toY = 0;
            
            const result = GamePosition.getDirection(fromX, fromY, toX, toY);
            
            expect(result).toBeCloseTo(0); // 0 stupňů
        });
        
        it('should handle negative coordinates', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = -1;
            const toY = -1;
            
            const result = GamePosition.getDirection(fromX, fromY, toX, toY);
            
            expect(result).toBeCloseTo(-3*Math.PI/4); // -135 stupňů
        });
    });
    
    describe('getTargetPosition', () => {
        it('should calculate target position from direction and distance', () => {
            const fromX = 0;
            const fromY = 0;
            const direction = Math.PI/4; // 45 stupňů
            const distance = Math.sqrt(2); // vzdálenost pro [1,1]
            
            const result = GamePosition.getTargetPosition(fromX, fromY, direction, distance);
            
            expect(result.x).toBeCloseTo(1);
            expect(result.y).toBeCloseTo(1);
        });
        
        it('should handle zero distance', () => {
            const fromX = 10;
            const fromY = 20;
            const direction = Math.PI/4;
            const distance = 0;
            
            const result = GamePosition.getTargetPosition(fromX, fromY, direction, distance);
            
            expect(result).toEqual({
                x: 10,
                y: 20
            });
        });
        
        it('should handle negative direction', () => {
            const fromX = 0;
            const fromY = 0;
            const direction = -Math.PI/4; // -45 stupňů
            const distance = Math.sqrt(2);
            
            const result = GamePosition.getTargetPosition(fromX, fromY, direction, distance);
            
            expect(result.x).toBeCloseTo(1);
            expect(result.y).toBeCloseTo(-1);
        });
    });
    
    describe('getDistance', () => {
        it('should calculate correct distance between two points', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = 3;
            const toY = 4;
            
            const result = GamePosition.getDistance(fromX, fromY, toX, toY);
            
            expect(result).toBe(5); // 3-4-5 trojúhelník
        });
        
        it('should handle negative coordinates', () => {
            const fromX = 0;
            const fromY = 0;
            const toX = -3;
            const toY = -4;
            
            const result = GamePosition.getDistance(fromX, fromY, toX, toY);
            
            expect(result).toBe(5);
        });
        
        it('should handle same point', () => {
            const fromX = 10;
            const fromY = 20;
            const toX = 10;
            const toY = 20;
            
            const result = GamePosition.getDistance(fromX, fromY, toX, toY);
            
            expect(result).toBe(0);
        });
    });
}); 