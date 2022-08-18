import {
    BufferGeometry,
    CircleBufferGeometry,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    Scene,
    Vector3,
} from 'three';
import { Point2, Vector2 } from '../../../../utils/geometry';
import Entity from './Entity';

const linePoints = [new Vector3(0, 0, 0), new Vector3(100, 100, 0)];
const material = new LineBasicMaterial({ color: 0x0000ff });
const geometry = new BufferGeometry().setFromPoints(linePoints);
const line = new Line(geometry, material);

function drawVector(start: Point2, end: Point2) {
    const positions = line.geometry.attributes.position.array as Array<number>;
    positions[0] = start.x;
    positions[1] = start.y;
    positions[3] = end.y;
    positions[4] = end.y;
    line.geometry.attributes.position.needsUpdate = true;
}

export default class Worm extends Entity {
    protected object3D: Object3D;
    constructor(scene: Scene, x = 0, y = 0) {
        super(scene, 20, x, y);
        scene.add(line);
        this.physics.friction = 0.1;
        const geometry = new CircleBufferGeometry(this.radius, 120);
        const material = new MeshBasicMaterial({ color: 0xc48647, transparent: true, opacity: 0.5 });
        this.object3D = new Mesh(geometry, material);
        this.object3D.position.set(x, y, 0);
        this.physics = {
            acceleration: new Vector2(0, 0),
            velocity: new Vector2(0, 0),
            // direction: 0,
            speed: 1.2,
            g: 0.1,
            maxAngle: 85,
            friction: 0.01,
        };
    }

    public update(matrix: number[][]) {
        if (matrix) {
            super.update(matrix);
            this.move(matrix);
        }

        this.object3D.position.set(this.position.x, this.position.y, 0);
    }

    public push(vec: Vector2) {
        this.physics.velocity.x = vec.x;
        this.physics.velocity.y = vec.y;
    }

    move(matrix: number[][]) {
        if (
            (Math.abs(this.physics.velocity.x) < 0.1 && Math.abs(this.physics.velocity.y) < 0.1) ||
            this.stable === 'falling'
        )
            return;
        // this.stable = false;
        const v = this.physics.velocity;

        v.setStart(this.position);
        const collision = this.checkCollision(matrix, this.physics.velocity, this.radiusUnitAngle * 2);

        if (!collision) {
            this.position.x += this.physics.velocity.x;
            this.position.y += this.physics.velocity.y;
            // this.moves.v.x += this.moves.a.x;
            this.physics.velocity.y -= this.physics.g;
            return;
        }

        const normalSurface = collision.normalize().scale(-1);
        normalSurface.setStart(this.position);

        const newVec = normalSurface.clone();
        newVec.add(v.normalize());

        newVec.setStart(this.position);


        // const oldX = newVec.x;
        // const newX = 1 / oldX;

        newVec.normalize().scale(this.physics.speed || 1);
        // console.log(oldX)
        // console.log(newX)
        // console.log(newVec.x)

        const PIhalf = Math.PI / 2;
        const stepAngle = PIhalf - Math.abs(PIhalf - Math.atan2(newVec.y, newVec.x));

        if ((stepAngle * 180) / Math.PI < this.physics.maxAngle) {
            this.physics.velocity.x = newVec.x;
            this.physics.velocity.y = newVec.y;
        }
    }
}
