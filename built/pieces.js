var pieceNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var randomPiece = function () { return pieceNames[Math.floor(Math.random() * pieceNames.length)]; };
var S = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r + 1, c]; };
var N = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [g, r - 1, c]; };
var SW = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c + g - 1]; };
var SE = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g, c + g]; };
var NW = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g - 1, c + g - 1]; };
var NE = function (coord) { var g = coord[0], r = coord[1], c = coord[2]; return [1 - g, r + g - 1, c + g]; };
var pieceCoords0 = new Map([
    ["A", function (x) { return [x, S(x), S(S(x)), S(S(S(x)))]; }],
    ["B", function (x) { return [x, SE(x), S(SE(x)), S(S(SE(x)))]; }],
    ["C", function (x) { return [x, S(x), S(S(x)), SW(S(S(x)))]; }],
    ["D", function (x) { return [x, S(x), S(S(x)), SW(x)]; }],
    ["E", function (x) { return [x, S(x), S(S(x)), SW(S(x))]; }],
    ["F", function (x) { return [x, S(x), SE(x), S(SE(x))]; }],
    ["G", function (x) { return [x, SW(x), S(SW(x)), S(S(x))]; }],
    ["H", function (x) { return [x, SE(x), S(SE(x)), SE(S(SE(x)))]; }],
    ["I", function (x) { return [x, SW(x), S(SW(x)), SW(S(SW(x)))]; }],
    ["J", function (x) { return [x, SE(x), NE(SE(x)), S(SE(x))]; }]
]);
var pieceCoords60 = new Map([
    ["A", function (x) { return [x, SW(x), SW(SW(x)), SW(SW(SW(x)))]; }],
    ["B", function (x) { return [x, S(x), SW(S(x)), SW(SW(S(x)))]; }],
    ["C", function (x) { return [x, SW(x), SW(SW(x)), NW(SW(SW(x)))]; }],
    ["D", function (x) { return [x, NW(x), SW(x), SW(SW(x))]; }],
    ["E", function (x) { return [x, SW(x), SW(SW(x)), NW(SW(x))]; }],
    ["F", function (x) { return [x, S(x), SW(x), S(SW(x))]; }],
    ["G", function (x) { return [x, NW(x), SW(NW(x)), S(SW(NW(x)))]; }],
    ["H", function (x) { return [x, S(x), SW(S(x)), S(SW(S(x)))]; }],
    ["I", function (x) { return [x, NW(x), SW(NW(x)), NW(SW(NW(x)))]; }],
    ["J", function (x) { return [x, S(x), SW(S(x)), SE(S(x))]; }],
]);
var pieceCoords120 = new Map([
    ["A", function (x) { return [x, NW(x), NW(NW(x)), NW(NW(NW(x)))]; }],
    ["B", function (x) { return [x, SW(x), NW(SW(x)), NW(NW(SW(x)))]; }],
    ["C", function (x) { return [x, NW(x), NW(NW(x)), N(NW(NW(x)))]; }],
    ["D", function (x) { return [x, N(x), NW(x), NW(NW(x))]; }],
    ["E", function (x) { return [x, NW(x), NW(NW(x)), N(NW(x))]; }],
    ["F", function (x) { return [x, NW(x), SW(x), NW(SW(x))]; }],
    ["G", function (x) { return [x, N(x), NW(N(x)), SW(NW(N(x)))]; }],
    ["H", function (x) { return [x, SW(x), NW(SW(x)), SW(NW(SW(x)))]; }],
    ["I", function (x) { return [x, N(x), NW(N(x)), N(NW(N(x)))]; }],
    ["J", function (x) { return [x, SW(x), NW(SW(x)), S(SW(x))]; }],
]);
var pieceCoords180 = new Map([
    ["A", function (x) { return [x, N(x), N(N(x)), N(N(N(x)))]; }],
    ["B", function (x) { return [x, NW(x), N(NW(x)), N(N(NW(x)))]; }],
    ["C", function (x) { return [x, N(x), N(N(x)), NE(N(N(x)))]; }],
    ["D", function (x) { return [x, N(x), NE(x), N(N(x))]; }],
    ["E", function (x) { return [x, N(x), N(N(x)), NE(N(x))]; }],
    ["F", function (x) { return [x, N(x), NW(x), N(NW(x))]; }],
    ["G", function (x) { return [x, NE(x), N(NE(x)), NW(N(NE(x)))]; }],
    ["H", function (x) { return [x, NW(x), N(NW(x)), NW(N(NW(x)))]; }],
    ["I", function (x) { return [x, NE(x), N(NE(x)), NE(N(NE(x)))]; }],
    ["J", function (x) { return [x, NW(x), N(NW(x)), SW(NW(x))]; }],
]);
var pieceCoords240 = new Map([
    ["A", function (x) { return [x, NE(x), NE(NE(x)), NE(NE(NE(x)))]; }],
    ["B", function (x) { return [x, N(x), NE(N(x)), NE(NE(N(x)))]; }],
    ["C", function (x) { return [x, NE(x), NE(NE(x)), SE(NE(NE(x)))]; }],
    ["D", function (x) { return [x, NE(x), SE(x), NE(NE(x))]; }],
    ["E", function (x) { return [x, NE(x), NE(NE(x)), SE(NE(x))]; }],
    ["F", function (x) { return [x, N(x), NE(x), N(NE(x))]; }],
    ["G", function (x) { return [x, SE(x), NE(SE(x)), N(NE(SE(x)))]; }],
    ["H", function (x) { return [x, N(x), NE(N(x)), N(NE(N(x)))]; }],
    ["I", function (x) { return [x, SE(x), NE(SE(x)), SE(NE(SE(x)))]; }],
    ["J", function (x) { return [x, N(x), NW(N(x)), NE(N(x))]; }],
]);
var pieceCoords300 = new Map([
    ["A", function (x) { return [x, SE(x), SE(SE(x)), SE(SE(SE(x)))]; }],
    ["B", function (x) { return [x, NE(x), SE(NE(x)), SE(SE(NE(x)))]; }],
    ["C", function (x) { return [x, SE(x), SE(SE(x)), S(SE(SE(x)))]; }],
    ["D", function (x) { return [x, S(x), SE(x), SE(SE(x))]; }],
    ["E", function (x) { return [x, SE(x), SE(SE(x)), S(SE(x))]; }],
    ["F", function (x) { return [x, SE(x), NE(x), SE(NE(x))]; }],
    ["G", function (x) { return [x, S(x), SE(S(x)), NE(SE(S(x)))]; }],
    ["H", function (x) { return [x, NE(x), SE(NE(x)), NE(SE(NE(x)))]; }],
    ["I", function (x) { return [x, S(x), SE(S(x)), S(SE(S(x)))]; }],
    ["J", function (x) { return [x, NE(x), N(NE(x)), SE(NE(x))]; }],
]);
var pieceCoords = [pieceCoords0, pieceCoords60, pieceCoords120, pieceCoords180, pieceCoords240, pieceCoords300];
var PieceBag = /** @class */ (function () {
    function PieceBag(pieces) {
        this.pieces = pieces;
    }
    PieceBag.random = function (bagSize) {
        return new this(Array.from({ length: bagSize }, randomPiece));
    };
    PieceBag.prototype.next = function () {
        var res = this.pieces.shift();
        this.pieces.push(randomPiece());
        return res;
    };
    return PieceBag;
}());
