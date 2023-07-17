var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var spawnPiece = function (grid, name, rotationState, coord) {
    if (rotationState === void 0) { rotationState = 0; }
    if (coord === void 0) { coord = [0, 0, Math.floor(COLS / 4)]; }
    var coords = pieceCoords[rotationState].get(name)(coord);
    coords.forEach(function (coord) {
        grid[coord[0]][coord[1]][coord[2]] = new Hexagon(CellState.Falling, "#FF0000");
    });
    return coords;
};
var maybeNewCoord = function (grid, coord, fn) {
    var ncoord = fn(coord);
    var ng = ncoord[0], nr = ncoord[1], nc = ncoord[2];
    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= Math.floor(COLS / 2))
        return null;
    if (grid[ng][nr][nc].state === CellState.Filled)
        return null;
    return ncoord;
};
var refPointTarget = function (coords, theta, grcXyLut) {
    var xy = grcToXy(coords[0]);
    var x = xy[0], y = xy[1];
    var xys = coords.map(function (coord) { return grcToXy(coord); });
    var x0 = xys.reduce(function (acc, curr) { return acc + curr[0]; }, 0) / xys.length;
    var y0 = xys.reduce(function (acc, curr) { return acc + curr[1]; }, 0) / xys.length;
    var rotated = [x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta), (y0 + (y - y0) * Math.cos(theta) + (x - x0) * Math.sin(theta))];
    return xyToGrc(rotated, grcXyLut);
};
var Game = /** @class */ (function () {
    function Game(ctx, grid, bag, fallingType, rotationState, fallingCoords, heldType, framesPerDrop, framesSinceLastDrop, framesPerMove, framesSinceLastMove, canHold, grcXyLut) {
        this.ctx = ctx;
        this.grid = grid;
        this.bag = bag;
        this.fallingType = fallingType;
        this.rotationState = rotationState;
        this.fallingCoords = fallingCoords;
        this.heldType = heldType;
        this.framesPerDrop = framesPerDrop;
        this.framesSinceLastDrop = framesSinceLastDrop;
        this.framesPerMove = framesPerMove;
        this.framesSinceLastMove = framesSinceLastMove;
        this.canHold = canHold;
        this.grcXyLut = grcXyLut;
    }
    Game.prototype.update = function () {
        var _this = this;
        var _a;
        var shouldFreeze = false;
        var maybeNewCoords = null;
        this.framesSinceLastDrop++;
        this.framesSinceLastMove++;
        if (this.framesSinceLastDrop >= this.framesPerDrop) {
            this.framesSinceLastDrop = 0;
            shouldFreeze = true;
            maybeNewCoords = this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
        }
        else if (this.framesSinceLastMove >= this.framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c - (1 - g)]; })); });
            }
            if (pressedKeys["ArrowRight"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c + g]; })); });
            }
            if (pressedKeys["ArrowDown"]) {
                this.framesSinceLastMove = 0;
                maybeNewCoords = this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
            }
            if (pressedKeys["ArrowUp"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 1) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 1 * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["q"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 2) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 2 * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["a"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 3) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 3 * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["e"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 4) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 4 * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["z"]) {
                this.framesSinceLastMove = 0;
                this.rotationState = (this.rotationState + 5) % 6;
                maybeNewCoords = pieceCoords[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, 5 * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys[" "]) {
                var fallingCoordsCopy = this.fallingCoords;
                while (true) {
                    maybeNewCoords = fallingCoordsCopy.map(function (coord) { return maybeNewCoord(_this.grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
                    if (maybeNewCoords.every(Boolean))
                        fallingCoordsCopy = maybeNewCoords;
                    else {
                        maybeNewCoords = fallingCoordsCopy;
                        shouldFreeze = true;
                        break;
                    }
                }
                shouldFreeze = true;
            }
            if (pressedKeys["Shift"] && this.canHold) {
                this.canHold = false;
                var newFallingType = (_a = this.heldType) !== null && _a !== void 0 ? _a : this.bag.next();
                maybeNewCoords = spawnPiece(this.grid, newFallingType);
                this.heldType = this.fallingType;
                this.fallingType = newFallingType;
            }
        }
        if (maybeNewCoords) {
            if (maybeNewCoords.every(Boolean)) {
                // all falling hexagons have their desired new positions available
                this.fallingCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    _this.grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF");
                });
                maybeNewCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    _this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000");
                });
                this.fallingCoords = maybeNewCoords;
            }
            else if (shouldFreeze) {
                // some or all hexagons are unable to fall further; lock piece
                this.fallingCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    _this.grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000");
                });
                this.framesSinceLastDrop = this.framesSinceLastMove = 0;
                this.fallingType = this.bag.next();
                this.fallingCoords = spawnPiece(this.grid, this.fallingType);
                this.canHold = true;
                var nRemoves = 0;
                for (var r0 = ROWS - 1; r0 >= 0; r0--) {
                    var r1 = void 0;
                    if (this.grid[0][r0] && !this.grid[0][r0].every(function (hex) { return hex.state === CellState.Filled; }))
                        continue;
                    if (this.grid[1][r0] && this.grid[1][r0].every(function (hex) { return hex.state === CellState.Filled; })) {
                        r1 = r0;
                    }
                    else if (r0 > 0 && this.grid[1][r0 - 1].every(function (hex) { return hex.state === CellState.Filled; })) {
                        r1 = r0 - 1;
                    }
                    else
                        continue;
                    nRemoves++;
                    this.grid[0][r0] = null;
                    this.grid[1][r1] = null;
                }
                this.grid[0] = Array.from({ length: nRemoves }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }).concat(this.grid[0].filter(Boolean));
                this.grid[1] = Array.from({ length: nRemoves }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }).concat(this.grid[1].filter(Boolean));
            }
        }
        this.render();
    };
    Game.prototype.render = function () {
        var _this = this;
        this.grid.forEach(function (gr, g) { return gr.forEach(function (row, r) { return row.forEach(function (hex, c) { return hex.draw.apply(hex, __spreadArray([_this.ctx], grcToXy([g, r, c]), false)); }); }); });
    };
    return Game;
}());
