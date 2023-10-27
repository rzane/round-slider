type Radians = number;
type Degrees = number;

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

/**
 * TODO: Pick degrees or radians and stick with it
 */
export interface Context {
  min: number;
  max: number;
  step: number;
  startRadians: Radians;
  lengthRadians: Radians;
  lengthDegrees: Degrees;
  startDegrees: Degrees;
}

export function degreesToRadians(degrees: Degrees) {
  return (degrees * Math.PI) / 180;
}

export function radiansToPoint(radians: Radians): Point {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function isAngleOnArc(degrees: Degrees, ctx: Context): boolean {
  const a =
    ((ctx.startDegrees + ctx.lengthDegrees / 2 - degrees + 180 + 360) % 360) -
    180;
  return a <= ctx.lengthDegrees / 2 && a >= -ctx.lengthDegrees / 2;
}

export function getBoundaries(ctx: Context): Rectangle {
  const arcStart = radiansToPoint(ctx.startRadians);
  const arcEnd = radiansToPoint(ctx.startRadians + ctx.lengthRadians);

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

export function mouseEventToPoint(event: MouseEvent | TouchEvent): Point {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

export function pointToValue({ x, y }: Point, ctx: Context): number {
  const radians =
    (Math.atan2(y, x) - ctx.startRadians + 8 * Math.PI) % (2 * Math.PI);

  return (
    Math.round(
      ((radians / ctx.lengthRadians) * (ctx.max - ctx.min) + ctx.min) /
      ctx.step,
    ) * ctx.step
  );
}

export function valueToRadians(value: number, ctx: Context): Radians {
  value = Math.min(ctx.max, Math.max(ctx.min, value));
  const fraction = (value - ctx.min) / (ctx.max - ctx.min);
  return ctx.startRadians + fraction * ctx.lengthRadians;
}

export function renderArc(startRadians: Radians, endRadians: Radians): string {
  const diff = endRadians - startRadians;
  const startXY = radiansToPoint(startRadians);
  const endXY = radiansToPoint(endRadians + 0.001);
  return `M ${startXY.x} ${startXY.y} A 1 1, 0, ${diff > Math.PI ? "1" : "0"
    } 1, ${endXY.x} ${endXY.y}`;
}
