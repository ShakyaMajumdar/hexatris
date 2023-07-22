const HEX_SIDE = 12;  //px
const ROWS = 20;
const COLS = 10;
const FPS = 30;
const BAG_SIZE = 5;

const canvas = <HTMLCanvasElement>document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cos60 = Math.cos(Math.PI / 3);
const sin60 = Math.sin(Math.PI / 3);

const pressedKeys = {}
document.addEventListener("keydown", (e) => {
    e.preventDefault()
    pressedKeys[e.key] = true;
})
document.addEventListener("keyup", (e) => {
    e.preventDefault()
    pressedKeys[e.key] = false;
})

const mouseClicks = new Set<[number, number]>();
document.addEventListener("mousedown", (e) => {
    mouseClicks.add([e.x, e.y])
})


interface Scene {
    enter(): void;
    update(): void;
    render(): void;
    exit(): void;
}

class Menu {
    startGameButton: Button
    constructor(private ctx: CanvasRenderingContext2D) {
        this.startGameButton = new Button(this.ctx, "START GAME", "#00FF00", "#000000", window.innerWidth/2 - 150, 200, 300, 120, () => sceneManager.changeScene(initGame()))
    }
    enter(): void {
        this.startGameButton.render()
    }
    exit(): void {
        this.startGameButton.clear()
    }
    update(): void {

    }
    render(): void {
        this.startGameButton.render()
    }
}
const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}
const initMenu = () => {
    const ctx = canvas.getContext("2d")

    return new Menu(ctx)
}

class SceneManager {
    constructor(public currentScene: Scene = null) {}
    changeScene(newScene: Scene) {
        this.currentScene?.exit()
        this.currentScene = newScene
        this.currentScene.enter()
    }
}
const sceneManager = new SceneManager()

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
        canvas.getContext("2d"),
        window.innerWidth/2 - (15*15/2),
        20,
        grid,
        bag,
        fallingType,
        0,
        spawnPiece(grid, fallingType),
        null,
        50,
        0,
        7,
        0,
        20,
        0,
        true,
        generateGrcXyLut(ROWS, COLS)
    )
}


const main = () => {
    requestAnimationFrame(main)
    sceneManager.currentScene.update()
    sceneManager.currentScene.render()
}
sceneManager.changeScene(initMenu())
// const game = initGame()
main()
