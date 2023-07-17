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
