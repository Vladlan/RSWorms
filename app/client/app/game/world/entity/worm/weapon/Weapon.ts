import { IShootOptions } from '../../../../../../../ts/interfaces';
import { TRemoveEntityCallback } from '../../../../../../../ts/types';
import Bullet from './bullet/Bullet';

export default class Weapon {
    public aimRadius = 100;
    protected bulletType = Bullet;
    shoot(options: IShootOptions, removeEntityCallback: TRemoveEntityCallback) {
        const bullet = new this.bulletType(removeEntityCallback, Math.random().toString(), options);
        return bullet;
    }
}
