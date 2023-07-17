var grcToXy = function (coord) {
    var g = coord[0], r = coord[1], c = coord[2];
    if (g === 0)
        return [HEX_SIDE * cos60 + c * (3 * HEX_SIDE), r * 2 * HEX_SIDE * sin60];
    else
        return [HEX_SIDE * cos60 + HEX_SIDE + HEX_SIDE * cos60 + c * (3 * HEX_SIDE), HEX_SIDE * sin60 + r * 2 * HEX_SIDE * sin60];
};
var generateGrcXyLut = function (rows, cols) {
    var grcXyLut = new Map();
    for (var g = 0; g < 2; g++) {
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < Math.floor(cols / 2); c++) {
                grcXyLut.set(grcToXy([g, r, c]), [g, r, c]);
            }
        }
    }
    return grcXyLut;
};
var dist = function (xy0, xy1) {
    var _a = [xy0, xy1], _b = _a[0], x0 = _b[0], y0 = _b[1], _c = _a[1], x1 = _c[0], y1 = _c[1];
    return Math.hypot(x1 - x0, y1 - y0);
};
var xyToGrc = function (xy, grcXyLut) {
    var x = xy[0], y = xy[1];
    var upperleft = Array.from(grcXyLut.keys()).filter(function (xy0) { var x0 = xy0[0], y0 = xy0[1]; return x0 <= x && y0 <= y; });
    var sortedbydist = upperleft.sort(function (xy1, xy2) { return dist(xy, xy1) - dist(xy, xy2); });
    return grcXyLut.get(sortedbydist[0]);
};
