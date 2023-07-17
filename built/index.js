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
var initGame = function () {
    var bag = PieceBag.random(BAG_SIZE);
    var grid = Array.from({ length: 2 }, function () { return Array.from({ length: ROWS }, function () { return Array.from({ length: Math.floor(COLS / 2) }, function () { return new Hexagon(CellState.Empty, "#FFFFFF"); }); }); });
    var fallingType = bag.next();
    return new Game(document.querySelector("canvas").getContext("2d"), grid, bag, fallingType, 0, spawnPiece(grid, fallingType), null, 20, 0, 5, 0, true, generateGrcXyLut(ROWS, COLS));
};
var main = function () {
    var game = initGame();
    setInterval(function () {
        game.update();
    }, 1000 / FPS);
};
main();
