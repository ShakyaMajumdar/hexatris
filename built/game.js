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
    var coords = PIECE_COORDS[rotationState].get(name)(coord);
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
    function Game(ctx, grid, bag, fallingType, rotationState, fallingCoords, heldType, framesPerSoftDrop, framesSinceLastSoftDrop, framesPerMove, framesSinceLastMove, canHold, grcXyLut) {
        this.ctx = ctx;
        this.grid = grid;
        this.bag = bag;
        this.fallingType = fallingType;
        this.rotationState = rotationState;
        this.fallingCoords = fallingCoords;
        this.heldType = heldType;
        this.framesPerSoftDrop = framesPerSoftDrop;
        this.framesSinceLastSoftDrop = framesSinceLastSoftDrop;
        this.framesPerMove = framesPerMove;
        this.framesSinceLastMove = framesSinceLastMove;
        this.canHold = canHold;
        this.grcXyLut = grcXyLut;
    }
    Game.prototype.translate = function (fn) {
        var _this = this;
        this.framesSinceLastMove = 0;
        return this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, fn); });
    };
    Game.prototype.rotate = function (thetaIndex) {
        var _this = this;
        this.framesSinceLastMove = 0;
        this.rotationState = (this.rotationState + thetaIndex) % 6;
        return PIECE_COORDS[this.rotationState].get(this.fallingType)(refPointTarget(this.fallingCoords, thetaIndex * Math.PI / 3, this.grcXyLut)).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
    };
    Game.prototype.tryMove = function (coords) {
        var _this = this;
        if (!coords.every(Boolean)) {
            return null;
        }
        // all falling hexagons have their desired new positions available
        this.fallingCoords.forEach(function (_a) {
            var g = _a[0], r = _a[1], c = _a[2];
            _this.grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF");
        });
        coords.forEach(function (_a) {
            var g = _a[0], r = _a[1], c = _a[2];
            _this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000");
        });
        this.fallingCoords = coords;
        return coords;
    };
    Game.prototype.removeFilledLines = function () {
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
    };
    Game.prototype.tryMoveOrElse = function (coords, fn) {
        if (this.tryMove(coords))
            return;
        else {
            fn();
        }
    };
    Game.prototype.freeze = function () {
        var _this = this;
        this.fallingCoords.forEach(function (_a) {
            var g = _a[0], r = _a[1], c = _a[2];
            _this.grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000");
        });
        this.framesSinceLastSoftDrop = this.framesSinceLastMove = 0;
        this.fallingType = this.bag.next();
        this.fallingCoords = spawnPiece(this.grid, this.fallingType);
        this.canHold = true;
        this.removeFilledLines();
    };
    Game.prototype.update = function () {
        var _a;
        var _this = this;
        var _b;
        this.framesSinceLastSoftDrop++;
        this.framesSinceLastMove++;
        if (this.framesSinceLastSoftDrop >= this.framesPerSoftDrop) {
            this.framesSinceLastSoftDrop = 0;
            this.tryMoveOrElse(this.translate(S), function () { return _this.freeze(); });
            return;
        }
        else if (this.framesSinceLastMove >= this.framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                this.tryMove(this.translate(SW));
            }
            if (pressedKeys["ArrowRight"]) {
                this.tryMove(this.translate(SE));
            }
            if (pressedKeys["ArrowDown"]) {
                this.tryMove(this.translate(S));
            }
            if (pressedKeys["ArrowUp"]) {
                this.tryMove(this.rotate(1));
            }
            if (pressedKeys["q"]) {
                this.tryMove(this.rotate(2));
            }
            if (pressedKeys["a"]) {
                this.tryMove(this.rotate(3));
            }
            if (pressedKeys["e"]) {
                this.tryMove(this.rotate(4));
            }
            if (pressedKeys["z"]) {
                this.tryMove(this.rotate(5));
            }
            if (pressedKeys[" "]) {
                while (true) {
                    if (!this.tryMove(this.translate(S))) {
                        this.freeze();
                        return;
                    }
                }
            }
            if (pressedKeys["Shift"] && this.canHold) {
                this.canHold = false;
                _a = [this.fallingType, (_b = this.heldType) !== null && _b !== void 0 ? _b : this.bag.next()], this.heldType = _a[0], this.fallingType = _a[1];
                this.tryMove(spawnPiece(this.grid, this.fallingType));
            }
        }
    };
    Game.prototype.render = function () {
        var _this = this;
        this.grid.forEach(function (gr, g) { return gr.forEach(function (row, r) { return row.forEach(function (hex, c) { return hex.draw.apply(hex, __spreadArray([_this.ctx], grcToXy([g, r, c]), false)); }); }); });
    };
    return Game;
}());
