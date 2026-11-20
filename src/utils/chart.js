/** Smooth curve through [x, y] points (cardinal spline -> cubic Béziers), as an SVG path. */
export function smoothPath(pts, tension = 0.18) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension, p1[1] + (p2[1] - p0[1]) * tension];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension, p2[1] - (p3[1] - p1[1]) * tension];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** An id that is safe inside url(#id) references (React's useId can contain other characters). */
export const svgId = (reactId) => `g${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
