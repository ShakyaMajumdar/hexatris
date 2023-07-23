var GameState;
(function (GameState) {
    GameState[GameState["NotStarted"] = 0] = "NotStarted";
    GameState[GameState["Playing"] = 1] = "Playing";
    GameState[GameState["Paused"] = 2] = "Paused";
    GameState[GameState["Ended"] = 3] = "Ended";
})(GameState || (GameState = {}));
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
    function Game(ctx, x, y, grid, bag, framesPerSoftDrop, framesSinceLastSoftDrop, framesPerMove, framesSinceLastMove, framesBeforeHardDrop, framesSinceFreeze, canHold, grcXyLut) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.grid = grid;
        this.bag = bag;
        this.framesPerSoftDrop = framesPerSoftDrop;
        this.framesSinceLastSoftDrop = framesSinceLastSoftDrop;
        this.framesPerMove = framesPerMove;
        this.framesSinceLastMove = framesSinceLastMove;
        this.framesBeforeHardDrop = framesBeforeHardDrop;
        this.framesSinceFreeze = framesSinceFreeze;
        this.canHold = canHold;
        this.grcXyLut = grcXyLut;
        this.backToMenuButton = new Button(this.ctx, "BACK TO MAIN MENU", "#00FF00", "#000000", window.innerWidth / 2 - 250, 500, 500, 120, function () { return sceneManager.changeScene(initMenu()); });
        this.fallingType = bag.next();
        this.rotationState = 0;
        this.fallingCoords = this.spawnPiece(this.fallingType);
        this.heldType = null;
    }
    Game.prototype.enter = function () {
        this.backToMenuButton.render();
    };
    Game.prototype.exit = function () {
        this.backToMenuButton.clear();
        clearCanvas(this.ctx);
    };
    Game.prototype.spawnPiece = function (name, rotationState, coord) {
        var _this = this;
        if (rotationState === void 0) { rotationState = 0; }
        if (coord === void 0) { coord = [0, 0, Math.floor(COLS / 4)]; }
        var coords = PIECE_COORDS[rotationState].get(name)(coord);
        coords.forEach(function (_a) {
            var g = _a[0], r = _a[1], c = _a[2];
            if (_this.grid[g][r][c].state == CellState.Filled)
                _this.die();
            _this.grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000");
        });
        return coords;
    };
    Game.prototype.die = function () {
        // throw new Error("Method not implemented.");
        sceneManager.changeScene(initGameOver(10));
    };
    Game.prototype.translate = function (fn) {
        var _this = this;
        this.framesSinceLastMove = 0;
        return this.fallingCoords.map(function (coord) { return maybeNewCoord(_this.grid, coord, fn); });
    };
    Game.prototype.rotate = function (thetaIndex) {
        var _this = this;
        this.framesSinceLastMove = 0;
        var rpt = refPointTarget(this.fallingCoords, thetaIndex * Math.PI / 3, this.grcXyLut);
        if (!rpt)
            return [null, null, null, null];
        this.rotationState = (this.rotationState + thetaIndex) % 6;
        return PIECE_COORDS[this.rotationState].get(this.fallingType)(rpt).map(function (coord) { return maybeNewCoord(_this.grid, coord, function (x) { return x; }); });
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
    Game.prototype.tryRotationMove = function (thetaIndex) {
        var oldRotationState = this.rotationState;
        if (!this.tryMove(this.rotate(thetaIndex)))
            this.rotationState = oldRotationState;
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
        this.framesSinceFreeze = 0;
        this.fallingCoords.forEach(function (_a) {
            var g = _a[0], r = _a[1], c = _a[2];
            _this.grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000");
        });
        this.framesSinceLastSoftDrop = this.framesSinceLastMove = 0;
        this.fallingType = this.bag.next();
        this.fallingCoords = this.spawnPiece(this.fallingType);
        this.canHold = true;
        this.removeFilledLines();
    };
    Game.prototype.update = function () {
        var _a;
        var _this = this;
        var _b;
        this.framesSinceLastSoftDrop++;
        this.framesSinceLastMove++;
        this.framesSinceFreeze++;
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
                // this.tryMove(this.rotate(1))
                this.tryRotationMove(1);
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
            if (pressedKeys[" "] && this.framesSinceFreeze > this.framesBeforeHardDrop) {
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
                this.tryMove(this.spawnPiece(this.fallingType));
            }
        }
    };
    Game.prototype.render = function () {
        var _this = this;
        clearCanvas(this.ctx);
        this.grid.forEach(function (gr, g) { return gr.forEach(function (row, r) { return row.forEach(function (hex, c) {
            if (r < 2 && hex.state == CellState.Empty)
                return;
            var _a = grcToXy([g, r, c]), rawX = _a[0], rawY = _a[1];
            hex.draw(_this.ctx, _this.x + rawX, _this.y + rawY);
        }); }); });
        this.backToMenuButton.render();
    };
    return Game;
}());
