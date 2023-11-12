type Grc = [number, number, number]
type Xy = [number, number]


const grcToXy = (coord: Grc) => {
    let [g, r, c] = coord;
    if (g === 0)
        return <Xy> [HEX_SIDE * cos60 + c * (3 * HEX_SIDE), r * 2 * HEX_SIDE * sin60]
    else
        return <Xy> [HEX_SIDE * cos60 + HEX_SIDE + HEX_SIDE * cos60 + c * (3 * HEX_SIDE), HEX_SIDE * sin60 + r * 2 * HEX_SIDE * sin60]
}

const generateGrcXyLut = (rows: number, cols: number) => {
    const grcXyLut = new Map<Xy, Grc>();
    for (let g = 0; g < 2; g++) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < Math.floor(cols / 2); c++) {
                grcXyLut.set(grcToXy([g, r, c]), [g, r, c])
            }
        }
    }
    return grcXyLut;
}
const dist = (xy0: Xy, xy1: Xy) => {
    let [[x0, y0], [x1, y1]] = [xy0, xy1];
    return Math.hypot(x1 - x0, y1 - y0)
}
const xyToGrc = (xy: Xy, grcXyLut: Map<Xy, Grc>) => {
    let [x, y] = xy;
    let upperleft = Array.from(grcXyLut.keys()).filter(xy0 => { let [x0, y0] = xy0; return x0 <= x && y0 <= y })
    let sortedbydist = upperleft.sort((xy1, xy2) => dist(xy, xy1) - dist(xy, xy2))
    return grcXyLut.get(sortedbydist[0])
}
