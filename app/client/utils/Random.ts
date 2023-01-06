const M_VAL = 4294967296;
const A_VAL = 1664525;
const C_VAL = 1013904223;
export default class Random {
    private seed: number;
    private z: number;

    constructor(seed = Math.random()) {
        this.seed = seed;
        this.z = (A_VAL * this.seed + C_VAL) % M_VAL;
    }

    get() {
        this.z = (A_VAL * this.z + C_VAL) % M_VAL;
        return this.z / M_VAL;
    }

    getFromMinus() {
        const value = this.get();
        return (value - 0.5) * 2;
    }
}
