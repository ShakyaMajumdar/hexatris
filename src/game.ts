enum GameState {
    NotStarted,
    Playing,
    Paused,
    Ended
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
    private backToMenuButton: Button;
    private fallingType: Piece;
    private rotationState: number;
    private fallingCoords: Grc[];
    private heldType: Piece;
    constructor(
        private ctx: CanvasRenderingContext2D,
        private x: number, 
        private y: number,
        private grid: Hexagon[][][],
        private bag: PieceBag,        

        private framesPerSoftDrop: number,
        private framesSinceLastSoftDrop: number,
        private framesPerMove: number,
        private framesSinceLastMove: number,
        private framesBeforeHardDrop: number,
        private framesSinceFreeze: number,

        private canHold: Boolean,

        private grcXyLut: Map<Xy, Grc>
    ) { 
        this.backToMenuButton = new Button(this.ctx, "BACK TO MAIN MENU", "#00FF00", "#000000", window.innerWidth/2 - 250, 500, 500, 120, () => sceneManager.changeScene(initMenu()))
        this.fallingType = bag.next()
        this.rotationState = 0
        this.fallingCoords = this.spawnPiece(this.fallingType)
        this.heldType = null
    }
    enter() { 
        this.backToMenuButton.render()
    }
    exit() {
        this.backToMenuButton.clear() 
        clearCanvas(this.ctx)
    }
    private spawnPiece(name: Piece, rotationState: number = 0, coord: Grc = [0, 0, Math.floor(COLS / 4)]) {
        const coords = PIECE_COORDS[rotationState].get(name)(coord)
    
        coords.forEach(([g, r, c]) => {
            if (this.grid[g][r][c].state == CellState.Filled)
                this.die()
            this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000")
        })
        return coords;
    }
    die() {
        // throw new Error("Method not implemented.");
        sceneManager.changeScene(initGameOver(10))
    }
    private translate(fn: (coord: Grc) => Grc) {
        this.framesSinceLastMove = 0;
        return this.fallingCoords.map(coord => maybeNewCoord(this.grid, coord, fn))
    }
    private rotate(thetaIndex: number) {
        this.framesSinceLastMove = 0;
        let rpt = refPointTarget(this.fallingCoords, thetaIndex * Math.PI / 3, this.grcXyLut)
        if (!rpt)
            return [null, null, null, null] as Grc[]
        this.rotationState = (this.rotationState + thetaIndex) % 6
        return PIECE_COORDS[this.rotationState].get(this.fallingType)(rpt).map(coord => maybeNewCoord(this.grid, coord, x => x))
    }
    private tryMove(coords: Grc[]) {
        if (!coords.every(Boolean)) {
            return null;
        }
        // all falling hexagons have their desired new positions available
        this.fallingCoords.forEach(([g, r, c]) => { this.grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF") })
        coords.forEach(([g, r, c]) => { this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000") })
        this.fallingCoords = coords;
        return coords;
    }
    private tryRotationMove(thetaIndex: number) {
        let oldRotationState = this.rotationState;
        if (!this.tryMove(this.rotate(thetaIndex)))
            this.rotationState = oldRotationState
    }
    private removeFilledLines() {
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
    private tryMoveOrElse(coords: Grc[], fn: () => void) {
        if (this.tryMove(coords))
            return
        else {
            fn();
        }
    }
    private freeze() {
        this.framesSinceFreeze = 0;
        this.fallingCoords.forEach(([g, r, c]) => { this.grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000") })

        this.framesSinceLastSoftDrop = this.framesSinceLastMove = 0;

        this.fallingType = this.bag.next()
        this.fallingCoords = this.spawnPiece(this.fallingType);
        this.canHold = true;

        this.removeFilledLines()
    }
    update() {

        this.framesSinceLastSoftDrop++;
        this.framesSinceLastMove++;
        this.framesSinceFreeze++;

        if (this.framesSinceLastSoftDrop >= this.framesPerSoftDrop) {
            this.framesSinceLastSoftDrop = 0;
            this.tryMoveOrElse(this.translate(S), () => this.freeze())
            return
        }

        else if (this.framesSinceLastMove >= this.framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                this.tryMove(this.translate(SW))
            }
            if (pressedKeys["ArrowRight"]) {
                this.tryMove(this.translate(SE))
            }
            if (pressedKeys["ArrowDown"]) {
                this.tryMove(this.translate(S))
            }
            if (pressedKeys["ArrowUp"]) {
                // this.tryMove(this.rotate(1))
                this.tryRotationMove(1)
            }
            if (pressedKeys["q"]) {
                this.tryMove(this.rotate(2))
            }
            if (pressedKeys["a"]) {
                this.tryMove(this.rotate(3))
            }
            if (pressedKeys["e"]) {
                this.tryMove(this.rotate(4))
            }
            if (pressedKeys["z"]) {
                this.tryMove(this.rotate(5))
            }
            if (pressedKeys[" "] && this.framesSinceFreeze > this.framesBeforeHardDrop) {
                while (true) {
                    if (!this.tryMove(this.translate(S))) {
                        this.freeze()
                        return
                    }
                }
            }
            if (pressedKeys["Shift"] && this.canHold) {
                this.canHold = false;
                [this.heldType, this.fallingType] = [this.fallingType, this.heldType ?? this.bag.next()]
                this.tryMove(this.spawnPiece(this.fallingType));
            }
        }

    }
    render() {
        clearCanvas(this.ctx)
        this.grid.forEach((gr, g) => gr.forEach((row, r) => row.forEach((hex, c) => {
            if (r < 2 && hex.state == CellState.Empty)
                return
            let [rawX, rawY] = grcToXy([g, r, c])
            hex.draw(this.ctx, this.x + rawX, this.y + rawY)
        })))
        this.backToMenuButton.render()
    }
}