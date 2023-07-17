type Piece = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"
const pieceNames: Piece[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
const randomPiece = () => pieceNames[Math.floor(Math.random() * pieceNames.length)]
type PieceGenerator = (coord: Grc) => Grc[]

const S: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [g, r + 1, c] }
const N: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [g, r - 1, c] }
const SW: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [1 - g, r + g, c + g - 1] }
const SE: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [1 - g, r + g, c + g] }
const NW: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [1 - g, r + g - 1, c + g - 1] }
const NE: (coord: Grc) => Grc = (coord) => { let [g, r, c] = coord; return [1 - g, r + g - 1, c + g] }


const pieceCoords0 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, S(x), S(S(x)), S(S(S(x)))]],
    ["B", x => [x, SE(x), S(SE(x)), S(S(SE(x)))]],
    ["C", x => [x, S(x), S(S(x)), SW(S(S(x)))]],
    ["D", x => [x, S(x), S(S(x)), SW(x)]],
    ["E", x => [x, S(x), S(S(x)), SW(S(x))]],
    ["F", x => [x, S(x), SE(x), S(SE(x))]],
    ["G", x => [x, SW(x), S(SW(x)), S(S(x))]],
    ["H", x => [x, SE(x), S(SE(x)), SE(S(SE(x)))]],
    ["I", x => [x, SW(x), S(SW(x)), SW(S(SW(x)))]],
    ["J", x => [x, SE(x), NE(SE(x)), S(SE(x))]]
])

const pieceCoords60 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, SW(x), SW(SW(x)), SW(SW(SW(x)))]],
    ["B", x => [x, S(x), SW(S(x)), SW(SW(S(x)))]],
    ["C", x => [x, SW(x), SW(SW(x)), NW(SW(SW(x)))]],
    ["D", x => [x, NW(x), SW(x), SW(SW(x))]],
    ["E", x => [x, SW(x), SW(SW(x)), NW(SW(x))]],
    ["F", x => [x, S(x), SW(x), S(SW(x))]],
    ["G", x => [x, NW(x), SW(NW(x)), S(SW(NW(x)))]],
    ["H", x => [x, S(x), SW(S(x)), S(SW(S(x)))]],
    ["I", x => [x, NW(x), SW(NW(x)), NW(SW(NW(x)))]],
    ["J", x => [x, S(x), SW(S(x)), SE(S(x))]],
])

const pieceCoords120 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, NW(x), NW(NW(x)), NW(NW(NW(x)))]],
    ["B", x => [x, SW(x), NW(SW(x)), NW(NW(SW(x)))]],
    ["C", x => [x, NW(x), NW(NW(x)), N(NW(NW(x)))]],
    ["D", x => [x, N(x), NW(x), NW(NW(x))]],
    ["E", x => [x, NW(x), NW(NW(x)), N(NW(x))]],
    ["F", x => [x, NW(x), SW(x), NW(SW(x))]],
    ["G", x => [x, N(x), NW(N(x)), SW(NW(N(x)))]],
    ["H", x => [x, SW(x), NW(SW(x)), SW(NW(SW(x)))]],
    ["I", x => [x, N(x), NW(N(x)), N(NW(N(x)))]],
    ["J", x => [x, SW(x), NW(SW(x)), S(SW(x))]],
])

const pieceCoords180 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, N(x), N(N(x)), N(N(N(x)))]],
    ["B", x => [x, NW(x), N(NW(x)), N(N(NW(x)))]],
    ["C", x => [x, N(x), N(N(x)), NE(N(N(x)))]],
    ["D", x => [x, N(x), NE(x), N(N(x))]],
    ["E", x => [x, N(x), N(N(x)), NE(N(x))]],
    ["F", x => [x, N(x), NW(x), N(NW(x))]],
    ["G", x => [x, NE(x), N(NE(x)), NW(N(NE(x)))]],
    ["H", x => [x, NW(x), N(NW(x)), NW(N(NW(x)))]],
    ["I", x => [x, NE(x), N(NE(x)), NE(N(NE(x)))]],
    ["J", x => [x, NW(x), N(NW(x)), SW(NW(x))]],
])

const pieceCoords240 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, NE(x), NE(NE(x)), NE(NE(NE(x)))]],
    ["B", x => [x, N(x), NE(N(x)), NE(NE(N(x)))]],
    ["C", x => [x, NE(x), NE(NE(x)), SE(NE(NE(x)))]],
    ["D", x => [x, NE(x), SE(x), NE(NE(x))]],
    ["E", x => [x, NE(x), NE(NE(x)), SE(NE(x))]],
    ["F", x => [x, N(x), NE(x), N(NE(x))]],
    ["G", x => [x, SE(x), NE(SE(x)), N(NE(SE(x)))]],
    ["H", x => [x, N(x), NE(N(x)), N(NE(N(x)))]],
    ["I", x => [x, SE(x), NE(SE(x)), SE(NE(SE(x)))]],
    ["J", x => [x, N(x), NW(N(x)), NE(N(x))]],
])

const pieceCoords300 = new Map<Piece, PieceGenerator>([
    ["A", x => [x, SE(x), SE(SE(x)), SE(SE(SE(x)))]],
    ["B", x => [x, NE(x), SE(NE(x)), SE(SE(NE(x)))]],
    ["C", x => [x, SE(x), SE(SE(x)), S(SE(SE(x)))]],
    ["D", x => [x, S(x), SE(x), SE(SE(x))]],
    ["E", x => [x, SE(x), SE(SE(x)), S(SE(x))]],
    ["F", x => [x, SE(x), NE(x), SE(NE(x))]],
    ["G", x => [x, S(x), SE(S(x)), NE(SE(S(x)))]],
    ["H", x => [x, NE(x), SE(NE(x)), NE(SE(NE(x)))]],
    ["I", x => [x, S(x), SE(S(x)), S(SE(S(x)))]],
    ["J", x => [x, NE(x), N(NE(x)), SE(NE(x))]],
])

const pieceCoords = [pieceCoords0, pieceCoords60, pieceCoords120, pieceCoords180, pieceCoords240, pieceCoords300]

class PieceBag {
    pieces: Piece[];
    constructor(pieces: Piece[]) {
        this.pieces = pieces;
    }
    static random(bagSize: number) {
        return new this(Array.from({ length: bagSize }, randomPiece))
    }
    next() {
        let res = this.pieces.shift();
        this.pieces.push(randomPiece())
        return res;
    }
}
