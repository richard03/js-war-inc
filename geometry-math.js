class GeometryMath {
    
    /**
     * Normalize the angle to the range of -PI to PI
     * @param {number} angle 
     * @returns {number} angle in the range of -PI to PI
     */
    static normalizeAngle(angle) {
        // return Math.atan2(Math.sin(angle), Math.cos(angle));
        // reduce the angle  
        angle =  angle % (2 * Math.PI); 

        // force it to be the positive remainder, so that 0 <= angle < 360  
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);  

        // force into the minimum absolute value residue class, so that -180 < angle <= 180  
        if (angle > Math.PI)  
            angle -= 2 * Math.PI; 
        
        return angle;
    }

    /**
     * Get the angle to the target
     * @param {*} currentPosition 
     * @param {*} targetPosition 
     * @returns 
     */
    static getAngleToTarget(currentPosition, targetPosition) {
        const angle = Math.atan2(targetPosition.y - currentPosition.y, targetPosition.x - currentPosition.x);
        return this.normalizeAngle(angle);
    }

    static getDistanceToTarget(currentPosition, targetPosition) {
        const distance = Math.sqrt(Math.pow(targetPosition.x - currentPosition.x, 2) + Math.pow(targetPosition.y - currentPosition.y, 2));
        return distance;
    }
}


if (typeof module !== 'undefined') {
    module.exports = GeometryMath;
}
