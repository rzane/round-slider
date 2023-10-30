export type Radians = number;
export type Degrees = number;

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Context {
  min: number;
  max: number;
  step: number;
  arc: Radians;
  rotate: Radians;
}

export function degreesToRadians(degrees: Degrees) {
  return (degrees * Math.PI) / 180;
}

export function radiansToPoint(radians: Radians): Point {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

function isAngleOnArc(degrees: Degrees, ctx: Context): boolean {
  const radians = degreesToRadians(degrees);
  const epsilon = 1e-10;
  const middle = ctx.arc / 2;
  const delta =
    ((ctx.rotate + middle - radians + Math.PI + 2 * Math.PI) % (2 * Math.PI)) -
    Math.PI;
  return Math.abs(delta) <= middle + epsilon;
}

export function getBoundaries(ctx: Context): Rectangle {
  const arcStart = radiansToPoint(ctx.rotate);
  const arcEnd = radiansToPoint(ctx.rotate + ctx.arc);

  const top = isAngleOnArc(270, ctx) ? 1 : Math.max(-arcStart.y, -arcEnd.y);
  const bottom = isAngleOnArc(90, ctx) ? 1 : Math.max(arcStart.y, arcEnd.y);
  const left = isAngleOnArc(180, ctx) ? 1 : Math.max(-arcStart.x, -arcEnd.x);
  const right = isAngleOnArc(0, ctx) ? 1 : Math.max(arcStart.x, arcEnd.x);

  return { top, left, height: top + bottom, width: left + right };
}

export function getViewBox(ctx: Context) {
  const { left, top, width, height } = getBoundaries(ctx);
  return `${-left} ${-top} ${width} ${height}`;
}

export function isValidPress(event: MouseEvent | TouchEvent): boolean {
  return !(event instanceof MouseEvent && event.button !== 0);
}

export function mouseEventToPoint(event: MouseEvent | TouchEvent): Point {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

export function pointToValue({ x, y }: Point, ctx: Context): number {
  const radians = (Math.atan2(y, x) - ctx.rotate + 8 * Math.PI) % (2 * Math.PI);
  const scaledValue = (radians / ctx.arc) * (ctx.max - ctx.min) + ctx.min;
  const value = Math.round(scaledValue / ctx.step) * ctx.step;

  if (value > ctx.max) {
    return radians > Math.PI + ctx.arc / 2 ? ctx.min : ctx.max;
  } else {
    return value;
  }
}

export function valueToRadians(value: number, ctx: Context): Radians {
  const clampedValue = Math.min(ctx.max, Math.max(ctx.min, value));
  const fraction = (clampedValue - ctx.min) / (ctx.max - ctx.min);
  return ctx.rotate + fraction * ctx.arc;
}

export function renderArc(startRadians: Radians, endRadians: Radians): string {
  const delta = endRadians - startRadians;
  const startPoint = radiansToPoint(startRadians);
  const endPoint = radiansToPoint(endRadians + 0.001);
  const largeArcFlag = delta > Math.PI ? "1" : "0";
  return `M ${startPoint.x} ${startPoint.y} A 1 1, 0, ${largeArcFlag} 1, ${endPoint.x} ${endPoint.y}`;
}
