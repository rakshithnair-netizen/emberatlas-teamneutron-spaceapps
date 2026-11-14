export const EXPLORATION_O2_PCT = 34;
export const EXPLORATION_PRESSURE_KPA = 56.5;
export const O2_SCALE = 10;
export const PRESSURE_SCALE = 40;
export const KPA_PER_PSIA = 6.894757;

export type Point = [number, number];

export function psiaToKpa(psia: number): number {
  return psia * KPA_PER_PSIA;
}

export function kpaToPsia(kpa: number): number {
  return kpa / KPA_PER_PSIA;
}

export function ppO2Kpa(o2Pct: number, pressureKpa: number): number {
  return (o2Pct / 100) * pressureKpa;
}

export function conditionDistance(
  o2Pct: number,
  pressureKpa: number,
  targetO2Pct: number,
  targetPressureKpa: number,
): number {
  return Math.sqrt(((o2Pct - targetO2Pct) / O2_SCALE) ** 2 + ((pressureKpa - targetPressureKpa) / PRESSURE_SCALE) ** 2);
}

export function habitatDistance(o2Pct: number, pressureKpa: number): number {
  return conditionDistance(o2Pct, pressureKpa, EXPLORATION_O2_PCT, EXPLORATION_PRESSURE_KPA);
}

function cross(origin: Point, a: Point, b: Point): number {
  return (a[0] - origin[0]) * (b[1] - origin[1]) - (a[1] - origin[1]) * (b[0] - origin[0]);
}

export function convexHull(points: Point[]): Point[] {
  const unique = Array.from(new Map(points.map((point) => [`${point[0]}|${point[1]}`, point])).values());
  const sorted = unique.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const lower: Point[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper: Point[] = [];
  for (let index = sorted.length - 1; index >= 0; index--) {
    const point = sorted[index];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
    upper.push(point);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

export function pointInConvexPolygon(point: Point, hull: Point[]): boolean {
  if (hull.length < 3) return false;
  let sign = 0;
  for (let index = 0; index < hull.length; index++) {
    const value = cross(hull[index], hull[(index + 1) % hull.length], point);
    if (value === 0) continue;
    const current = value > 0 ? 1 : -1;
    if (sign === 0) sign = current;
    else if (sign !== current) return false;
  }
  return true;
}

export function distanceEllipse(centerO2: number, centerPressure: number, radius: number, steps = 72): { pressure: number[]; o2: number[] } {
  const pressure: number[] = [];
  const o2: number[] = [];
  for (let step = 0; step <= steps; step++) {
    const angle = (step / steps) * Math.PI * 2;
    pressure.push(centerPressure + PRESSURE_SCALE * radius * Math.cos(angle));
    o2.push(centerO2 + O2_SCALE * radius * Math.sin(angle));
  }
  return { pressure, o2 };
}
