const spawnPiece = (grid: Hexagon[][][], name: Piece, rotationState: number = 0, coord: Grc = [0, 0, Math.floor(COLS / 4)]) => {
    const coords = pieceCoords[rotationState].get(name)(coord)

    coords.forEach((coord) => {
        grid[coord[0]][coord[1]][coord[2]] = new Hexagon(CellState.Falling, "#FF0000")
    })
    return coords;
}

const maybeNewCoord = (grid: Hexagon[][][], coord: Grc, fn: (coord: Grc) => Grc) => {
    let ncoord = fn(coord);
    let [ng, nr, nc] = ncoord;
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= Math.floor(COLS / 2))
        return null;
    if (grid[ng][nr][nc].state === CellState.Filled)
        return null;
    return ncoord;
}

const refPointTarget = (coords: Grc[], theta: number, grcXyLut: Map<Xy, Grc>) => {
    let xy = grcToXy(coords[0])
    let [x, y] = xy
    let xys = coords.map(coord => grcToXy(coord))
    let x0 = xys.reduce((acc, curr) => acc + curr[0], 0) / xys.length
    let y0 = xys.reduce((acc, curr) => acc + curr[1], 0) / xys.length
    let rotated: Xy = [x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta), (y0 + (y - y0) * Math.cos(theta) + (x - x0) * Math.sin(theta))]
    return xyToGrc(rotated, grcXyLut);
}


class Game {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private grid: Hexagon[][][],
        private bag: PieceBag,
        private fallingType: Piece,
        private rotationState: number,
        private fallingCoords: Grc[],
        private heldType: Piece,

        private framesPerDrop: number,
        private framesSinceLastDrop: number,
        private framesPerMove: number,
        private framesSinceLastMove: number,
        private canHold: Boolean,

        private grcXyLut: Map<Xy, Grc>
    ) { }
    
    update() {
        let shouldFreeze = false;
        let maybeNewCoords: Grc[] = null;
        this.framesSinceLastDrop++;
        this.framesSinceLastMove++;
        if (this.framesSinceLastDrop >= this.framesPerDrop) {
            this.framesSinceLastDrop = 0;
            shouldFreeze = true;
            maybeNewCoords = this.fallingCoords.map(coord => maybeNewCoord(this.grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
        }
        else if (this.framesSinceLastMove >= this.framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(coord => maybeNewCoord(this.grid, coord, (coord => { let [g, r, c] = coord; return [1 - g, r + g, c - (1 - g)] })))
            }
            if (pressedKeys["ArrowRight"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(coord => maybeNewCoord(this.grid, coord, (coord => { let [g, r, c] = coord; return [1 - g, r + g, c + g] })))
            }
            if (pressedKeys["ArrowDown"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(coord => maybeNewCoord(this.grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
            }
            if (pressedKeys["ArrowUp"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 1) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 1 * Math.PI / 3, this.grcXyLut),).map(coord => maybeNewCoord(this.grid, coord, x => x))
            }
            if (pressedKeys["q"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 2) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 2 * Math.PI / 3, this.grcXyLut)).map(coord => maybeNewCoord(this.grid, coord, x => x))
            }
            if (pressedKeys["a"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 3) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 3 * Math.PI / 3, this.grcXyLut)).map(coord => maybeNewCoord(this.grid, coord, x => x))
            }
            if (pressedKeys["e"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 4) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 4 * Math.PI / 3, this.grcXyLut)).map(coord => maybeNewCoord(this.grid, coord, x => x))
            }
            if (pressedKeys["z"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 5) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 5 * Math.PI / 3, this.grcXyLut)).map(coord => maybeNewCoord(this.grid, coord, x => x))
            }
            if (pressedKeys[" "]) {
                let fallingCoordsCopy = this.fallingCoords;
                while (true) {
                    maybeNewCoords = fallingCoordsCopy.map(coord => maybeNewCoord(this.grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
                    if (maybeNewCoords.every(Boolean))
                        fallingCoordsCopy = maybeNewCoords;
                    else { maybeNewCoords = fallingCoordsCopy; shouldFreeze = true; break; }
                }
                shouldFreeze = true;
            }
            if (pressedKeys["Shift"] && this.canHold) {
                this.canHold = false;
                const newFallingType = this.heldType ?? this.bag.next();
                maybeNewCoords = spawnPiece(this.grid, newFallingType);
                this.heldType = this.fallingType;
                this.fallingType = newFallingType;
            }
        }
        if (maybeNewCoords) {
            if (maybeNewCoords.every(Boolean)) {
                // all falling hexagons have their desired new positions available
                this.fallingCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    this.grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF")
                })
                maybeNewCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000")
                })
                this.fallingCoords = maybeNewCoords;
            }
            else if (shouldFreeze) {
                // some or all hexagons are unable to fall further; lock piece
                this.fallingCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    this.grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000")
                })

                this.framesSinceLastDrop = this.framesSinceLastMove = 0;

                this.fallingType = this.bag.next()
                this.fallingCoords = spawnPiece(this.grid, this.fallingType);
                this.canHold = true;

                let nRemoves = 0;
                for (let r0 = ROWS - 1; r0 >= 0; r0--) {
                    let r1: number;
                    if (this.grid[0][r0] && !this.grid[0][r0].every(hex => hex.state === CellState.Filled))
                        continue
                    if (this.grid[1][r0] && this.grid[1][r0].every(hex => hex.state === CellState.Filled)) {
                        r1 = r0
                    }
                    else if (r0 > 0 && this.grid[1][r0 - 1].every(hex => hex.state === CellState.Filled)) {
                        r1 = r0 - 1
                    }
                    else
                        continue
                    nRemoves++;
                    this.grid[0][r0] = null;
                    this.grid[1][r1] = null;
                }
                this.grid[0] = Array.from({ length: nRemoves }, () => Array.from({ length: Math.floor(COLS / 2) }, () => new Hexagon(CellState.Empty, "#FFFFFF"))).concat(this.grid[0].filter(Boolean))
                this.grid[1] = Array.from({ length: nRemoves }, () => Array.from({ length: Math.floor(COLS / 2) }, () => new Hexagon(CellState.Empty, "#FFFFFF"))).concat(this.grid[1].filter(Boolean))
            }
        }
        this.render()
    }
    render() {
        this.grid.forEach((gr, g) => gr.forEach((row, r) => row.forEach((hex, c) => hex.draw(this.ctx, ...grcToXy([g, r, c])))))
    }
}