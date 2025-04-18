/**
 * 2D vector utility class for basic vector math.
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.anglePrecision = 0.01;
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

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    normalize() {
        const len = this.length;
        return len > 0
            ? this.multiplyScalar(1 / len)
            : new Vector2(0, 0);
    }

    rotate(angle) {
        return new Vector2(
            this.x * Math.cos(angle) - this.y * Math.sin(angle), 
            this.x * Math.sin(angle) + this.y * Math.cos(angle)
        );
    }

    angleTo(v) {
        const dot = this.x * v.x + this.y * v.y;
        const det = this.x * v.y - this.y * v.x;
        return Math.atan2(det, dot);
    }

    isParalelTo(v) {
        return Math.abs(this.angleTo(v)) < this.anglePrecision;
    }
}

if (typeof module !== 'undefined') {
    module.exports = Vector2;
}
