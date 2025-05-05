class UnitModel {
    constructor(game) {
        this.game = game;

        this.id = (Math.random() * Math.MAX_SAFE_INTEGER).toString(36);

        this.speed = {
            max: 10,
            current: 0,
            target: 0,
            acceleration: 0.1,
            deceleration: 0.5
        }

        this.health = 100;
        this.maxHealth = 100;

        this.size = 32; // unit size

        this.vision = {
            range: 200,
            coneAngle: Math.PI * 1/3, // the width of the vision cone
            rotationSpeed: 0.03, // how fast the unit can turn
            currentAngle: Math.PI * 2/3, // where the unit is looking
            targetAngle: null, // where the unit is turning to
            
        }
    
    }

    init(cfg = {}) {
        if (this.game.debugMode) console.log('init unit model ' + (cfg.id || this.id));

        if (cfg.id) this.id = cfg.id;
        this.blueprintId = cfg.blueprintId || null;
        this.name = cfg.name || 'Unknown';
        this.price = cfg.price || 0;
        this.description = cfg.description || '';
    }

    update() {
        this.updateVision();
        this.updateSpeed();
    }

    updateVision() {
        if (this.vision.targetAngle && this.vision.targetAngle !== this.vision.currentAngle) {
            // Normalizujeme úhly do rozsahu -PI až PI
            let angleDiff = GeometryMath.normalizeAngle(this.vision.targetAngle - this.vision.currentAngle);

            if (FuzzyMath.isClose(angleDiff, 0, this.vision.rotationSpeed)) {
                this.vision.currentAngle = this.vision.targetAngle;
                this.vision.targetAngle = null;
                return;
            }

            // // normalize the angle
            // while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            // while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // Otáčíme vždy nejkratší cestou
            if (angleDiff > 0) {
                this.vision.currentAngle = GeometryMath.normalizeAngle(this.vision.currentAngle + this.vision.rotationSpeed);
                // if (this.vision.currentAngle > Math.PI) { // normalize the angle
                //     this.vision.currentAngle = - this.vision.currentAngle + Math.PI;
                // }
            } else {
                this.vision.currentAngle = GeometryMath.normalizeAngle(this.vision.currentAngle - this.vision.rotationSpeed);
                // if (this.vision.currentAngle < - Math.PI) { // normalize the angle
                //     this.vision.currentAngle = this.vision.currentAngle - Math.PI;
                // }
            }
        }
    }

    updateSpeed() {
        // if the direction is "ahead" the unit and the distance is great enogh to decelerate, we should accelerate
        if (this.speed.current < this.speed.target) {
            this.speed.current += this.speed.acceleration;
        } else if (this.speed.current > this.speed.target) {
            this.speed.current -= this.speed.deceleration;
        }
        if (this.speed.current > this.speed.max) {
            this.speed.current = this.speed.max;
        }
        if (this.speed.current < 0) {
            this.speed.current = 0;
        }
    }


    /**
     * Gets the braking distance for the unit
     * @returns {number} The braking distance
     */
    getBrakingDistance() {
        return (this.speed.max * this.speed.max) / (2 * this.speed.deceleration);
    }
    
    /**
     * Začne otáčet pohled směrem k cíli
     * @param {number} targetX - X souřadnice cíle
     * @param {number} targetY - Y souřadnice cíle
     */
    startTurningTo(targetAngle) {
        this.vision.targetAngle = targetAngle;
    }

    /**
     * Okamžitě točí pohled směrem k cíli
     * @param {number} targetX - X souřadnice cíle
     * @param {number} targetY - Y souřadnice cíle
     */
    turnTo(targetAngle) {
        this.vision.currentAngle = targetAngle;
        this.vision.targetAngle = null;
    }

    /**
     * Accelerates the unit
     */
    accelerate() {
        this.speed.target += this.speed.acceleration;
        if (this.speed.target > this.speed.max) {
            this.speed.target = this.speed.max;
        }
    }

    /**
     * Decelerates the unit
     */
    decelerate() {
        this.speed.target -= this.speed.deceleration;
        if (this.speed.target < 0) {
            this.speed.target = 0;
        }
    }

    /**
     * Stops the unit on the spot, ignoring deceleration
     */
    stopMoving() {
        this.speed.target = 0;
        this.speed.current = 0;
    }


}
