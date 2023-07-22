var HEX_SIDE = 12; //px
var ROWS = 20;
var COLS = 10;
var FPS = 30;
var BAG_SIZE = 5;
var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var cos60 = Math.cos(Math.PI / 3);
var sin60 = Math.sin(Math.PI / 3);
var pressedKeys = {};
document.addEventListener("keydown", function (e) {
    e.preventDefault();
    pressedKeys[e.key] = true;
});
document.addEventListener("keyup", function (e) {
    e.preventDefault();
    pressedKeys[e.key] = false;
});
var mouseClicks = new Set();
document.addEventListener("mousedown", function (e) {
    mouseClicks.add([e.x, e.y]);
});
var Menu = /** @class */ (function () {
    function Menu(ctx) {
        this.ctx = ctx;
        this.startGameButton = new Button(this.ctx, "START GAME", "#00FF00", "#000000", window.innerWidth / 2 - 150, 200, 300, 120, function () { return sceneManager.changeScene(initGame()); });
    }
    Menu.prototype.enter = function () {
        this.startGameButton.render();
    };
    Menu.prototype.exit = function () {
        this.startGameButton.clear();
    };
    Menu.prototype.update = function () {
    };
    Menu.prototype.render = function () {
        this.startGameButton.render();
    };
    return Menu;
}());
var clearCanvas = function (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
var initMenu = function () {
    var ctx = canvas.getContext("2d");
    return new Menu(ctx);
};
var SceneManager = /** @class */ (function () {
    function SceneManager(currentScene) {
        if (currentScene === void 0) { currentScene = null; }
        this.currentScene = currentScene;
    }
    SceneManager.prototype.changeScene = function (newScene) {
        var _a;
        (_a = this.currentScene) === null || _a === void 0 ? void 0 : _a.exit();
        this.currentScene = newScene;
        this.currentScene.enter();
    };
    return SceneManager;
}());
var sceneManager = new SceneManager();
var initGame = function () {
    var bag = PieceBag.random(BAG_SIZE);
    var grid = Array.from({ length: 2 }, function () { return Array.from({ length: ROWS }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }); });
    var fallingType = bag.next();
    return new Game(canvas.getContext("2d"), window.innerWidth / 2 - (15 * 15 / 2), 20, grid, bag, fallingType, 0, spawnPiece(grid, fallingType), null, 50, 0, 7, 0, 20, 0, true, generateGrcXyLut(ROWS, COLS));
};
var main = function () {
    requestAnimationFrame(main);
    sceneManager.currentScene.update();
    sceneManager.currentScene.render();
};
sceneManager.changeScene(initMenu());
// const game = initGame()
main();
