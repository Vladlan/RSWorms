import { TLoopCallback } from '../../../../../ts/types';
import Worm from '../../world/entity/worm/Worm';

export default class WormManager {
    private controlledWorm: Worm | null = null;
    private jumpButtonTimestamp = 0;
    private jumpButtonDelayMS = 200;
    private timer = 0;
    private aim: -1 | 0 | 1 = 0;
    private readonly aimSpeed = 5;

    public setWorm(worm: Worm) {
        if (this.controlledWorm) {
            this.controlledWorm.setAsSelected(false);
        }
        this.controlledWorm = worm;
        worm.setAsSelected(true);
    }

    public getWorm() {
        return this.controlledWorm;
    }

    public handleEvent(e: KeyboardEvent) {
        if (!this.controlledWorm) {
            return;
        }

        if (e.type === 'keydown') {
            return this.handleKeyDown(e);
        }
        if (e.type === 'keyup') {
            return this.handleKeyUp(e);
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (!this.controlledWorm) {
            return;
        }
        const worm = this.controlledWorm;

        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            if (e.code === 'ArrowLeft') {
                worm.setMoveFlags({ left: true });
            }
            if (e.code === 'ArrowRight') {
                worm.setMoveFlags({ right: true });
            }
        }

        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            if (e.code === 'ArrowUp') {
                this.aim = 1;
            }
            if (e.code === 'ArrowDown') {
                this.aim = -1;
            }
        }

        if (e.code === 'Space') {
            worm.changePower();
        }

        const jumpTimeout = () => {
            const t = setTimeout(() => {
                worm.jump();
            }, this.jumpButtonDelayMS + 1);
            return Number(t);
        };

        if (e.code === 'Enter') {
            const now = Date.now();
            const delta = now - this.jumpButtonTimestamp;
            this.jumpButtonTimestamp = now;
            if (delta > this.jumpButtonDelayMS) {
                this.timer = jumpTimeout();
            } else {
                clearTimeout(this.timer);
                worm.jump(true);
            }
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        if (!this.controlledWorm) {
            return;
        }
        const worm = this.controlledWorm;

        if (e.code === 'ArrowLeft') {
            worm.setMoveFlags({ left: false });
        }
        if (e.code === 'ArrowRight') {
            worm.setMoveFlags({ right: false });
        }

        if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
            if (e.code === 'ArrowUp' && this.aim > 0) {
                this.aim = 0;
            }
            if (e.code === 'ArrowDown' && this.aim < 0) {
                this.aim = 0;
            }
        }

        if (e.code === 'Space') {
            return worm.shoot();
        }
    }

    public update: TLoopCallback = () => {
        const worm = this.controlledWorm;
        if (worm) {
            worm.changeAngle(this.aim, this.aimSpeed);
        }
    };
}
