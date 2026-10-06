export default class World {
    constructor(name, width, height) {
        this.name = name;
        this.grid = [];
        this.width = width;
        this.height = height;
    }

    static fromObject(j) {
        var w = new World(j.name, j.width, j.height);
        Object.assign(w, j);

        return w;
    }

    toJSON() {
        return JSON.stringify({ ...this });
    }
}