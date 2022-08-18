import { Object3D } from 'three';
import { IPhysics } from '../../../../../ts/interfaces';
import { Point2, Vector2 } from '../../../../utils/geometry';

export default abstract class Entity {
    protected abstract object3D: Object3D;
    protected position: Point2;
    protected radius: number;
    protected radiusUnitAngle: number;
    protected stable = false;

    public movesOptions = {
        flags: {
            left: false,
            right: false,
        },
        direction: 1,
        speed: 1.5,
        a: new Vector2(0, 0),
        v: new Vector2(0, 0),
        maxAngle: 80,
    };

    protected physics: IPhysics = {
        velocity: new Vector2(0, 0),
        g: 0.25,
        friction: 0.1,
    };

    constructor(radius = 1, x = 0, y = 0) {
        this.position = new Point2(x, y);
        this.radius = radius;
        this.radiusUnitAngle = Math.asin(0.5 / this.radius) * 2;
    }

    public getObject3D() {
        return this.object3D;
    }

    public update(matrix: number[][]) {
        if (matrix) {
            this.gravity(matrix);
            this.move(matrix);
        }

        this.object3D.position.set(this.position.x, this.position.y, 0);
    }

    public setMoveFlags(flags: { left?: boolean; right?: boolean }) {
        this.stable = false;
        Object.assign(this.movesOptions.flags, flags);
    }

    protected checkCollision(matrix: number[][], vec: Vector2, radAngleShift = this.radiusUnitAngle) {
        let responseX = 0;
        let responseY = 0;

        let collision = false;

        const potentialX = this.position.x + vec.x;
        const potentialY = this.position.y + vec.y;
        const vecAngle = Math.atan2(vec.y, vec.x);
        const PIhalf = Math.PI / 2;

        const startAngle = vecAngle - PIhalf + radAngleShift;
        const endAngle = vecAngle + PIhalf - radAngleShift;

        for (let ang = startAngle; ang < endAngle; ang += this.radiusUnitAngle) {
            const x = this.radius * Math.cos(ang) + potentialX;
            const y = this.radius * Math.sin(ang) + potentialY;

            let iX = Math.floor(x);
            let iY = Math.floor(y);

            if (iX < 0) {
                iX = 0;
            }
            if (iX >= matrix[0].length) {
                iX = matrix[0].length - 1;
            }

            if (iY < 0) {
                iY = 0;
            }
            if (iY >= matrix.length) {
                iY = matrix.length - 1;
            }

            if (matrix[iY] && matrix[iY][iX] && matrix[iY][iX] !== 0) {
                responseX += x - this.position.x;
                responseY += y - this.position.y;
                collision = true;
            }
        }

        return collision ? new Vector2(responseX, responseY) : null;
    }

    protected gravity(matrix: number[][]) {
        if (this.stable) {
            return;
        }

        const vel = this.physics.velocity.clone();
        vel.y -= this.physics.g;

        this.stable = false;

        const collision = this.checkCollision(matrix, vel);
        if (!collision) {
            this.position.x += vel.x;
            this.position.y += vel.y;
            this.physics.velocity = vel;
            return;
        }

        //normal here isn't mean 'normalize'
        const normalSurface = collision.normalize().scale(1);

        const dot = vel.dotProduct(normalSurface);
        const reflectionX = vel.x - 2 * dot * normalSurface.x;
        const reflectionY = vel.y - 2 * dot * normalSurface.y;

        const reflectedVector = new Vector2(reflectionX, reflectionY);

        const fallSpeed = this.physics.velocity.getLength() * this.physics.friction;
        this.physics.velocity = reflectedVector.normalize().scale(fallSpeed);

        if (this.physics.velocity.getLength() < 0.01) {
            this.physics.velocity.scale(0);
            this.stable = true;
        }
    }

    protected push(vec: Vector2) {
        const { velocity } = this.physics;
        velocity.x += vec.x;
        velocity.y += vec.y;
    }

    protected move(matrix: number[][]) {
        // if worm fly
        this.stable = false;
        if (this.physics.velocity.getLength() > 0.5) {
            return;
        }

        const { flags } = this.movesOptions;
        if (!flags.left && !flags.right) {
            return;
        }

        // direction for worm jump and sprite
        if (flags.left && !flags.right) {
            this.movesOptions.direction = -1;
        }
        if (flags.right && !flags.left) {
            this.movesOptions.direction = 1;
        }

        const { a, v, direction, speed, maxAngle } = this.movesOptions;
        a.x += direction;

        v.add(a).normalize().scale(speed);

        a.scale(0);

        const collision = this.checkCollision(matrix, v);
        if (!collision) {
            this.position.x += v.x;
            this.position.y += v.y;
            v.scale(0);
            return;
        }

        const newVec = collision.normalize().scale(-1);
        newVec
            .add(v.normalize())
            .normalize()
            .scale(speed * 2);

        const PIhalf = Math.PI / 2;
        const stepAngle = PIhalf - Math.abs(PIhalf - Math.atan2(newVec.y, newVec.x));
        if ((stepAngle * 180) / Math.PI < maxAngle) {
            this.movesOptions.a = newVec;
        }
        v.scale(0);
    }
}