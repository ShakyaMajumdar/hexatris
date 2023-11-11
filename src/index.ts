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
        this.startGameButton = new Button(this.ctx, "Start Game", "#53917e", "#fcd0a1", window.innerWidth/2 - 75, 100, 150, 60, () => sceneManager.changeScene(initGame()))
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
    let holdGrid = Array.from({ length: 2 },
        () => Array.from({ length: 6 },
            () => Array.from({ length: 3 },
                () => new Hexagon(CellState.Empty, "#FFFFFF")
            )
        )
    )
    // let fallingType = bag.next()
    return new Game(
        canvas.getContext("2d"),
        window.innerWidth/2 - (15*15/2),  // x
        20,  // y
        grid,
        holdGrid,
        bag,
        50,  // frames per soft drop
        0,  // frames since last soft drop
        7,  // frames per move
        0,  // frames since last move
        20,  // frames before hard drop
        0,  // frames since freeze
        true,  //can hold
        generateGrcXyLut(ROWS, COLS)
    )
}

class GameOver {
    private playAgainButton: Button
    private mainMenuButton: Button
    constructor(private ctx: CanvasRenderingContext2D, private score: number) {
        this.playAgainButton = new Button(this.ctx, "Play Again", "#53917e", "#fcd0a1", window.innerWidth/2 - 75, 100, 150, 60, () => sceneManager.changeScene(initGame()))
        this.mainMenuButton = new Button(this.ctx, "Back To Main Menu", "#53917e", "#fcd0a1", window.innerWidth/2 - 120, 175, 240, 60, () => sceneManager.changeScene(initMenu()))
    }
    enter(): void {
        this.playAgainButton.render()
        this.mainMenuButton.render()
    }
    exit(): void {
        this.playAgainButton.clear()
        this.mainMenuButton.clear()
    }
    update(): void {

    }
    render(): void {
        this.playAgainButton.render()
        this.mainMenuButton.render()
    }
}
const initGameOver = (score: number) => {
    return new GameOver(canvas.getContext("2d"), score)
}

const main = () => {
    requestAnimationFrame(main)
    sceneManager.currentScene.update()
    sceneManager.currentScene.render()
}
sceneManager.changeScene(initMenu())
// const game = initGame()
main()
