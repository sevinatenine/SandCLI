export default class World {
    constructor(name, width, height) {
        this.name = name;
        this.grid = [];
        this.width = width;
        this.height = height;
        this.particleCount = 0;
    }

    static fromObject(j) {
        var w = new World(j.name, j.width, j.height);
        Object.assign(w, j);

        return w;
    }

    toObject() {
        if (this.grid) {
            return { ...this, grid: Array.from(this.grid) };
        } else return { ...this };
    }
}