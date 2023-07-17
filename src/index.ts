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


const initGame = () => {
    let bag = PieceBag.random(BAG_SIZE)
    let grid = Array.from({ length: 2 },
        () => Array.from({ length: ROWS },
            () => Array.from({ length: Math.floor(COLS / 2) },
                () => new Hexagon(CellState.Empty, "#FFFFFF")
            )
        )
    )
    let fallingType = bag.next()
    return new Game(
        (<HTMLCanvasElement>document.querySelector("canvas")).getContext("2d"),
        grid,
        bag,
        fallingType,
        0,
        spawnPiece(grid, fallingType),
        null,
        20,
        0,
        5,
        0,
        true,
        generateGrcXyLut(ROWS, COLS)
    )
}

const main = () => {
    const game = initGame()
    setInterval(() => {
        game.update()
        game.render()
    }, 1000 / FPS)
}

main()
