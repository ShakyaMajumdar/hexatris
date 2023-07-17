var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var HEX_SIDE = 15; //px
var ROWS = 20;
var COLS = 10;
var FPS = 30;
var BAG_SIZE = 5;
var cos60 = Math.cos(Math.PI / 3);
var sin60 = Math.sin(Math.PI / 3);
var pressedKeys = {};
document.addEventListener("keydown", function (e) {
    pressedKeys[e.key] = true;
});
document.addEventListener("keyup", function (e) {
    pressedKeys[e.key] = false;
});
var CellState;
(function (CellState) {
    CellState[CellState["Empty"] = 0] = "Empty";
    CellState[CellState["Falling"] = 1] = "Falling";
    CellState[CellState["Filled"] = 2] = "Filled";
})(CellState || (CellState = {}));
var Hexagon = /** @class */ (function () {
    function Hexagon(state, fillStyle) {
        this.state = state;
        this.fillStyle = fillStyle;
    }
    Hexagon.prototype.draw = function (ctx, x, y) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + HEX_SIDE, y);
        ctx.lineTo(x + HEX_SIDE + HEX_SIDE * cos60, y + HEX_SIDE * sin60);
        ctx.lineTo(x + HEX_SIDE, y + 2 * HEX_SIDE * sin60);
        ctx.lineTo(x, y + 2 * HEX_SIDE * sin60);
        ctx.lineTo(x - HEX_SIDE * cos60, y + HEX_SIDE * sin60);
        ctx.closePath();
        if (this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        ctx.stroke();
    };
    return Hexagon;
}());
var grcToXy = function (coord) {
    var g = coord[0], r = coord[1], c = coord[2];
    if (g === 0)
        return [HEX_SIDE * cos60 + c * (3 * HEX_SIDE), r * 2 * HEX_SIDE * sin60];
    else
        return [HEX_SIDE * cos60 + HEX_SIDE + HEX_SIDE * cos60 + c * (3 * HEX_SIDE), HEX_SIDE * sin60 + r * 2 * HEX_SIDE * sin60];
};
var grcXyLut = new Map();
for (var g = 0; g < 2; g++) {
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < Math.floor(COLS / 2); c++) {
            grcXyLut.set(grcToXy([g, r, c]), [g, r, c]);
        }
    }
}
var dist = function (xy0, xy1) {
    var _a = [xy0, xy1], _b = _a[0], x0 = _b[0], y0 = _b[1], _c = _a[1], x1 = _c[0], y1 = _c[1];
    return Math.hypot(x1 - x0, y1 - y0);
};
var xyToGrc = function (xy) {
    var x = xy[0], y = xy[1];
    var upperleft = Array.from(grcXyLut.keys()).filter(function (xy0) { var x0 = xy0[0], y0 = xy0[1]; return x0 <= x && y0 <= y; });
    var sortedbydist = upperleft.sort(function (xy1, xy2) { return dist(xy, xy1) - dist(xy, xy2); });
    return grcXyLut.get(sortedbydist[0]);
};
var PieceBag = /** @class */ (function () {
    function PieceBag(pieces) {
        this.pieces = pieces;
    }
    PieceBag.random = function () {
        return new this(Array.from({ length: BAG_SIZE }, randomPiece));
    };
    PieceBag.prototype.next = function () {
        var res = this.pieces.shift();
        this.pieces.push(randomPiece());
        return res;
        // return <Piece>"A"
    };
    return PieceBag;
}());
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
var refPointTarget = function (coords, theta) {
    var xy = grcToXy(coords[0]);
    var x = xy[0], y = xy[1];
    var xys = coords.map(function (coord) { return grcToXy(coord); });
    var x0 = xys.reduce(function (acc, curr) { return acc + curr[0]; }, 0) / xys.length;
    var y0 = xys.reduce(function (acc, curr) { return acc + curr[1]; }, 0) / xys.length;
    var rotated = [x0 + (x - x0) * Math.cos(theta) - (y - y0) * Math.sin(theta), (y0 + (y - y0) * Math.cos(theta) + (x - x0) * Math.sin(theta))];
    return xyToGrc(rotated);
};
var main = function () {
    var canvas = document.querySelector("canvas");
    var ctx = canvas.getContext("2d");
    var height = canvas.height;
    var width = canvas.width;
    var grid = Array.from({ length: 2 }, function () { return Array.from({ length: ROWS }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }); });
    var framesPerDrop = 20;
    var framesSinceLastDrop = 0;
    var framesPerMove = 5;
    var framesSinceLastMove = 0;
    var bag = PieceBag.random();
    var fallingType = bag.next();
    var rotationState = 0;
    var fallingCoords = spawnPiece(grid, fallingType);
    var heldType = null;
    var canHold = true;
    setInterval(function () {
        var shouldFreeze = false;
        var maybeNewCoords = null;
        framesSinceLastDrop++;
        framesSinceLastMove++;
        if (framesSinceLastDrop >= framesPerDrop) {
            framesSinceLastDrop = 0;
            shouldFreeze = true;
            maybeNewCoords = fallingCoords.map(function (coord) { return maybeNewCoord(grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
        }
        else if (framesSinceLastMove >= framesPerMove) {
            if (pressedKeys["ArrowLeft"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(function (coord) { return maybeNewCoord(grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c - (1 - g)]; })); });
            }
            if (pressedKeys["ArrowRight"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(function (coord) { return maybeNewCoord(grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c + g]; })); });
            }
            if (pressedKeys["ArrowDown"]) {
                framesSinceLastMove = 0;
                maybeNewCoords = fallingCoords.map(function (coord) { return maybeNewCoord(grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
            }
            if (pressedKeys["ArrowUp"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 1) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 1 * Math.PI / 3)).map(function (coord) { return maybeNewCoord(grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["q"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 2) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 2 * Math.PI / 3)).map(function (coord) { return maybeNewCoord(grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["a"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 3) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 3 * Math.PI / 3)).map(function (coord) { return maybeNewCoord(grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["e"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 4) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 4 * Math.PI / 3)).map(function (coord) { return maybeNewCoord(grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys["z"]) {
                framesSinceLastMove = 0;
                rotationState = (rotationState + 5) % 6;
                maybeNewCoords = pieceCoords[rotationState].get(fallingType)(refPointTarget(fallingCoords, 5 * Math.PI / 3)).map(function (coord) { return maybeNewCoord(grid, coord, function (x) { return x; }); });
            }
            if (pressedKeys[" "]) {
                var fallingCoordsCopy = fallingCoords;
                while (true) {
                    maybeNewCoords = fallingCoordsCopy.map(function (coord) { return maybeNewCoord(grid, coord, (function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; })); });
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
            if (pressedKeys["Shift"] && canHold) {
                canHold = false;
                var newFallingType = heldType !== null && heldType !== void 0 ? heldType : bag.next();
                maybeNewCoords = spawnPiece(grid, newFallingType);
                heldType = fallingType;
                fallingType = newFallingType;
            }
        }
        if (maybeNewCoords) {
            if (maybeNewCoords.every(Boolean)) {
                // all falling hexagons have their desired new positions available
                fallingCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    grid[g][r][c] = new Hexagon(CellState.Empty, "#FFFFFF");
                });
                maybeNewCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    grid[g][r][c] = new Hexagon(CellState.Falling, "#FF0000");
                });
                fallingCoords = maybeNewCoords;
            }
            else if (shouldFreeze) {
                // some or all hexagons are unable to fall further; lock piece
                fallingCoords.forEach(function (coord) {
                    var g = coord[0], r = coord[1], c = coord[2];
                    grid[g][r][c] = new Hexagon(CellState.Filled, "#FF0000");
                });
                framesSinceLastDrop = framesSinceLastMove = 0;
                fallingType = bag.next();
                fallingCoords = spawnPiece(grid, fallingType);
                canHold = true;
                var nRemoves = 0;
                for (var r0 = ROWS - 1; r0 >= 0; r0--) {
                    var r1 = void 0;
                    if (grid[0][r0] && !grid[0][r0].every(function (hex) { return hex.state === CellState.Filled; }))
                        continue;
                    if (grid[1][r0] && grid[1][r0].every(function (hex) { return hex.state === CellState.Filled; })) {
                        r1 = r0;
                    }
                    else if (r0 > 0 && grid[1][r0 - 1].every(function (hex) { return hex.state === CellState.Filled; })) {
                        r1 = r0 - 1;
                    }
                    else
                        continue;
                    nRemoves++;
                    grid[0][r0] = null;
                    grid[1][r1] = null;
                }
                grid[0] = Array.from({ length: nRemoves }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }).concat(grid[0].filter(Boolean));
                grid[1] = Array.from({ length: nRemoves }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }).concat(grid[1].filter(Boolean));
            }
        }
        grid.forEach(function (gr, g) { return gr.forEach(function (row, r) { return row.forEach(function (hex, c) { return hex.draw.apply(hex, __spreadArray([ctx], grcToXy([g, r, c]), false)); }); }); });
    }, 1000 / FPS);
};
main();
