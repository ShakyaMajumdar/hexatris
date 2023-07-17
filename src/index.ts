const HEX_SIDE = 15;  //px
const ROWS = 20;
const COLS = 10;
const FPS = 30;
const BAG_SIZE = 5;

const cos60 = Math.cos(Math.PI / 3);
const sin60 = Math.sin(Math.PI / 3);

const pressedKeys = {}
document.addEventListener("keydown", (e) => {
    pressedKeys[e.key] = true;
})
document.addEventListener("keyup", (e) => {
    pressedKeys[e.key] = false;
})

enum CellState {
    Empty,
    Falling,
    Filled
}
class Hexagon {
    state: CellState;
    fillStyle?: string;
    constructor(state: CellState, fillStyle?: string) {
        this.state = state
        this.fillStyle = fillStyle
    }

    draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + HEX_SIDE, y);
        ctx.lineTo(x + HEX_SIDE + HEX_SIDE * cos60, y + HEX_SIDE * sin60);
        ctx.lineTo(x + HEX_SIDE, y + 2 * HEX_SIDE * sin60);
        ctx.lineTo(x, y + 2 * HEX_SIDE * sin60);
        ctx.lineTo(x - HEX_SIDE * cos60, y + HEX_SIDE * sin60);
        ctx.closePath();

        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle
            ctx.fill();
        }
        ctx.stroke();
    }
}
type Grc = [number, number, number]
type Xy = [number, number]


const grcToXy: (coord: Grc) => Xy = (coord) => {
    let [g, r, c] = coord;
    if (g === 0)
        return [HEX_SIDE * cos60 + c * (3 * HEX_SIDE), r * 2 * HEX_SIDE * sin60]
    else
        return [HEX_SIDE * cos60 + HEX_SIDE + HEX_SIDE * cos60 + c * (3 * HEX_SIDE), HEX_SIDE * sin60 + r * 2 * HEX_SIDE * sin60]
}

const grcXyLut = new Map<Xy, Grc>();
for (let g = 0; g < 2; g++) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < Math.floor(COLS / 2); c++) {
            grcXyLut.set(grcToXy([g, r, c]), [g, r, c])
        }
    }
}
const dist = (xy0: Xy, xy1: Xy) => {
    let [[x0, y0], [x1, y1]] = [xy0, xy1];
    return Math.hypot(x1 - x0, y1 - y0)
}
const xyToGrc: (xy: Xy) => Grc = (xy) => {
    let [x, y] = xy;
    let upperleft = Array.from(grcXyLut.keys()).filter(xy0 => { let [x0, y0] = xy0; return x0 <= x && y0 <= y })
    let sortedbydist = upperleft.sort((xy1, xy2) => dist(xy, xy1) - dist(xy, xy2))
    return grcXyLut.get(sortedbydist[0])
}

class PieceBag {
    pieces: Piece[];
    constructor(pieces: Piece[]) {
        this.pieces = pieces;
    }
    static random() {
        return new this(Array.from({ length: BAG_SIZE }, randomPiece))
    }
    next() {
        let res = this.pieces.shift();
        this.pieces.push(randomPiece())
        return res;
        // return <Piece>"A"
    }
}

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

const refPointTarget = (coords: Grc[], theta: number) => {
    let xy = grcToXy(coords[0])
    let [x, y] = xy
    let xys = coords.map(coord => grcToXy(coord))
    let x0 = xys.reduce((acc, curr) => acc + curr[0], 0) / xys.length
    let y0 = xys.reduce((acc, curr) => acc + curr[1], 0) / xys.length
    let rotated: Xy = [x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta), (y0 + (y - y0) * Math.cos(theta) + (x - x0) * Math.sin(theta))]
    return xyToGrc(rotated);
}

const main = () => {
    const canvas = <HTMLCanvasElement>document.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const height = canvas.height;
    const width = canvas.width;

    const grid: Hexagon[][][] = Array.from({ length: 2 },
        () => Array.from({ length: ROWS },
            () => Array.from({ length: Math.floor(COLS / 2) },
                () => new Hexagon(CellState.Empty, "#FFFFFF")
            )
        )
    );

    let framesPerDrop = 20;
    let framesSinceLastDrop = 0;
    let framesPerMove = 5;
    let framesSinceLastMove = 0;

    let bag = PieceBag.random()
    let fallingType: Piece = bag.next()
    let rotationState = 0;
    let fallingCoords = spawnPiece(grid, fallingType)

    let heldType: Piece = null;
    let canHold = true;

    setInterval(() => {
        let shouldFreeze = false;
        let maybeNewCoords: Grc[] = null;
        framesSinceLastDrop++;
        framesSinceLastMove++;
        if (framesSinceLastDrop >= framesPerDrop) {
            framesSinceLastDrop = 0;
            shouldFreeze = true;
            maybeNewCoords = fallingCoords.map(coord => maybeNewCoord(grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
        }
        else if (framesSinceLastMove >= framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(coord => maybeNewCoord(grid, coord, (coord => { let [g, r, c] = coord; return [1 - g, r + g, c - (1 - g)] })))
            }
            if (pressedKeys["ArrowRight"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(coord => maybeNewCoord(grid, coord, (coord => { let [g, r, c] = coord; return [1 - g, r + g, c + g] })))
            }
            if (pressedKeys["ArrowDown"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(coord => maybeNewCoord(grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
            }
            if (pressedKeys["ArrowUp"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 1) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 1 * Math.PI / 3)).map(coord => maybeNewCoord(grid, coord, x => x))
            }
            if (pressedKeys["q"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 2) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 2 * Math.PI / 3)).map(coord => maybeNewCoord(grid, coord, x => x))
            }
            if (pressedKeys["a"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 3) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 3 * Math.PI / 3)).map(coord => maybeNewCoord(grid, coord, x => x))
            }
            if (pressedKeys["e"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 4) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 4 * Math.PI / 3)).map(coord => maybeNewCoord(grid, coord, x => x))
            }
            if (pressedKeys["z"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 5) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 5 * Math.PI / 3)).map(coord => maybeNewCoord(grid, coord, x => x))
            }
            if (pressedKeys[" "]) {
                let fallingCoordsCopy = fallingCoords;
                while (true) {
                    maybeNewCoords = fallingCoordsCopy.map(coord => maybeNewCoord(grid, coord, (coord => { let [g, r, c] = coord; return [g, r + 1, c] })))
                    if (maybeNewCoords.every(Boolean))
                        fallingCoordsCopy = maybeNewCoords;
                    else { maybeNewCoords = fallingCoordsCopy; shouldFreeze = true; break; }
                }
                shouldFreeze = true;
            }
            if (pressedKeys["Shift"] && canHold) {
                canHold = false;
                const newFallingType = heldType ?? bag.next();
                maybeNewCoords = spawnPiece(grid, newFallingType);
                heldType = fallingType;
                fallingType = newFallingType;
            }
        }
        if (maybeNewCoords) {
            if (maybeNewCoords.every(Boolean)) {
                // all falling hexagons have their desired new positions available
                fallingCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF")
                })
                maybeNewCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000")
                })
                fallingCoords = maybeNewCoords;
            }
            else if (shouldFreeze) {
                // some or all hexagons are unable to fall further; lock piece
                fallingCoords.forEach(coord => {
                    let [g, r, c] = coord;
                    grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000")
                })

                framesSinceLastDrop = framesSinceLastMove = 0;

                fallingType = bag.next()
                fallingCoords = spawnPiece(grid, fallingType);
                canHold = true;

                let nRemoves = 0;
                for (let r0 = ROWS - 1; r0 >= 0; r0--) {
                    let r1: number;
                    if (grid[0][r0] && !grid[0][r0].every(hex => hex.state === CellState.Filled))
                        continue
                    if (grid[1][r0] && grid[1][r0].every(hex => hex.state === CellState.Filled)) {
                        r1 = r0
                    }
                    else if (r0 > 0 && grid[1][r0 - 1].every(hex => hex.state === CellState.Filled)) {
                        r1 = r0 - 1
                    }
                    else
                        continue
                    nRemoves++;
                    grid[0][r0] = null;
                    grid[1][r1] = null;
                }
                grid[0] = Array.from({ length: nRemoves }, () => Array.from({ length: Math.floor(COLS / 2) }, () => new Hexagon(CellState.Empty, "#FFFFFF"))).concat(grid[0].filter(Boolean))
                grid[1] = Array.from({ length: nRemoves }, () => Array.from({ length: Math.floor(COLS / 2) }, () => new Hexagon(CellState.Empty, "#FFFFFF"))).concat(grid[1].filter(Boolean))
            }
        }
        grid.forEach((gr, g) => gr.forEach((row, r) => row.forEach((hex, c) => hex.draw(ctx, ...grcToXy([g, r, c])))))
    }, 1000 / FPS)
}

main()
