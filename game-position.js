class GamePosition {

    /**
     * Get the screen position of a map position
     * @param {number} mapX - The x position on the map
     * @param {number} mapY - The y position on the map
     * @param {number} mapOffsetX - The x offset of the map
     * @param {number} mapOffsetY - The y offset of the map
     * @returns {Object} The screen position
     */
    static getScreenPosition(mapX, mapY, mapOffsetX = 0, mapOffsetY = 0) {
        const screenX = mapX - mapOffsetX;
        const screenY = mapY - mapOffsetY;
        return {
            x: screenX,
            y: screenY
        }
    }

    /**
     * Get the map position of a screen position
     * @param {number} screenX - The x position on the screen
     * @param {number} screenY - The y position on the screen
     * @param {number} mapOffsetX - The x offset of the map
     * @param {number} mapOffsetY - The y offset of the map
     * @returns {Object} The map position
     */
    static getMapPosition(screenX, screenY, mapOffsetX = 0, mapOffsetY = 0) {
        const mapX = screenX + mapOffsetX;
        const mapY = screenY + mapOffsetY;
        return {
            x: mapX,
            y: mapY
        }
    }

    /**
     * Get the direction between two points
     * @param {number} fromX - The x position of the starting point
     * @param {number} fromY - The y position of the starting point
     * @param {number} toX - The x position of the ending point
     * @param {number} toY - The y position of the ending point
     * @returns {number} The direction
     */
    static getDirection(fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        return Math.atan2(dy, dx);
    }

    /**
     * Get the target position from a starting position, direction, and distance
     * @param {number} fromX - The x position of the starting point
     * @param {number} fromY - The y position of the starting point
     * @param {number} direction - The direction
     * @param {number} distance - The distance
     * @returns {Object} The target position
     */
    static getTargetPosition(fromX, fromY, direction, distance) {
        return {
            x: fromX + Math.cos(direction) * distance,
            y: fromY + Math.sin(direction) * distance
        }
    }

    /**
     * Get the distance between two points
     * @param {number} x1 - The x position of the first point
     * @param {number} y1 - The y position of the first point
     * @param {number} x2 - The x position of the second point
     * @param {number} y2 - The y position of the second point
     * @returns {number} The distance
     */
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    
}

if (typeof module !== 'undefined') {
    module.exports = GamePosition;
}

