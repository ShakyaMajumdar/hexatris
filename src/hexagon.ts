
enum CellState {
    Empty,
    Falling,
    Filled
}
class Hexagon {
    state: CellState;
    fillStyle: string;
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