var Button = /** @class */ (function () {
    function Button(ctx, text, fillStyle, textStyle, x, y, width, height, onclick) {
        var _this = this;
        this.ctx = ctx;
        this.text = text;
        this.fillStyle = fillStyle;
        this.textStyle = textStyle;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onclick = onclick;
        this.handleClick = function (e) {
            if (_this.inBounds(e.x, e.y))
                _this.onclick();
        };
        ctx.canvas.addEventListener("click", this.handleClick);
    }
    Button.prototype.inBounds = function (mouseX, mouseY) {
        return !(mouseX < this.x || mouseX > this.x + this.width || mouseY < this.y || mouseY > this.y + this.height);
    };
    Button.prototype.render = function () {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = this.textStyle;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '25px arial';
        this.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2, this.width);
    };
    Button.prototype.clear = function () {
        this.ctx.canvas.removeEventListener("click", this.handleClick);
        clearCanvas(this.ctx);
    };
    return Button;
}());
