class Button {
    constructor(
        private ctx: CanvasRenderingContext2D,
        private text: string,
        private fillStyle: string,
        private textStyle: string,
        private x: number,
        private y: number,

        private width: number,
        private height: number,

        private onclick: () => void,
    ) {
        ctx.canvas.addEventListener("click", this.handleClick)
    }

    inBounds(mouseX: number, mouseY: number): boolean {
        return !(mouseX < this.x || mouseX > this.x + this.width || mouseY < this.y || mouseY > this.y + this.height);
    }
    handleClick = (e: MouseEvent) => {
        if (this.inBounds(e.x, e.y))
            this.onclick()
    }
    render() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.fillStyle = this.textStyle;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '30px arial';
        this.ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2, this.width);
    }
    clear() {
        this.ctx.canvas.removeEventListener("click", this.handleClick)
        this.ctx.clearRect(this.x, this.y, this.width, this.height)
    }
}