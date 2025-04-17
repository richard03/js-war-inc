/**
 * 2D vector utility class for basic vector math.
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiplyScalar(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    get length() {
        return Math.hypot(this.x, this.y);
    }

    normalize() {
        const len = this.length;
        return len > 0
            ? this.multiplyScalar(1 / len)
            : new Vector2(0, 0);
    }
}

/**
 * Physics helper for steering, movement, and basic kinematics.
 */
class Physics {
    // configurable constants
    static DEFAULT_ACCELERATION = 0.1;
    static DEFAULT_FRICTION     = 0.01;
    static STOP_THRESHOLD       = 0.01;
    static CLOSE_ENOUGH_DIST    = 1.0;

    /**
     * Compute a force vector pointing from `current` to `target`.
     * @param {Vector2} target       Desired destination.
     * @param {Vector2} current      Current position.
     * @param {number}   [mass=1]    Mass of the object.
     * @param {number}   [acc=Physics.DEFAULT_ACCELERATION]  Desired acceleration magnitude.
     * @returns {{ force: Vector2, magnitude: number }}
     */
    static calculateForce(target, current, mass = 1, acc = Physics.DEFAULT_ACCELERATION) {
        const offset   = target.subtract(current);
        const distance = offset.length;
        if (distance <= Physics.CLOSE_ENOUGH_DIST) {
            return { force: new Vector2(0, 0), magnitude: 0 };
        }
        const magnitude = mass * acc;
        const force     = offset.normalize().multiplyScalar(magnitude);
        return { force, magnitude };
    }

    /**
     * Applies a force to the velocity vector, returns a new velocity including friction.
     * @param {Vector2} force        Force vector to apply.
     * @param {Vector2} velocity     Current velocity.
     * @param {number}   [mass=1]    Mass of the object.
     * @param {number}   [fr=Physics.DEFAULT_FRICTION]   Friction coefficient [0..1).
     * @returns {Vector2}            New velocity.
     */
    static applyForce(force, velocity, mass = 1, fr = Physics.DEFAULT_FRICTION) {
        // a = F / m
        const accel   = force.multiplyScalar(1 / mass);
        // v' = (v + a) * (1 - friction)
        let newVel     = velocity.clone().add(accel).multiplyScalar(1 - fr);

        // stop threshold
        if (newVel.length < Physics.STOP_THRESHOLD) {
            newVel = new Vector2(0, 0);
        }
        return newVel;
    }

    /**
     * Compute next position given current position and velocity.
     * @param {Vector2} velocity
     * @param {Vector2} position
     * @returns {Vector2}
     */
    static calculateMovement(velocity, position) {
        return position.clone().add(velocity);
    }

    /**
     * Euclidean distance between two points.
     * @param {Vector2} a
     * @param {Vector2} b
     * @returns {number}
     */
    static calculateDistance(a, b) {
        return a.subtract(b).length;
    }

    /**
     * Angle (radians) from point a to point b.
     * @param {Vector2} a
     * @param {Vector2} b
     * @returns {number}
     */
    static calculateAngle(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }
}

// Example usage:
const pos      = new Vector2(0, 0);
const target   = new Vector2(10, 5);
const { force } = Physics.calculateForce(target, pos);
let velocity  = new Vector2(0, 0);
velocity      = Physics.applyForce(force, velocity);
const nextPos = Physics.calculateMovement(velocity, pos);
console.log({ force, velocity, nextPos });
