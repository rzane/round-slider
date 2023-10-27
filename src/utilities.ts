type Radians = number;
type Degrees = number;

export interface Coordinates {
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

export function convertDegreesToRadians(degrees: Degrees) {
  return (degrees * Math.PI) / 180;
}

export function convertRadiansToCoordinates(radians: Radians): Coordinates {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function isAngleOnArc(ctx: Context, degrees: Degrees): boolean {
  const a =
    ((ctx.startDegrees + ctx.lengthDegrees / 2 - degrees + 180 + 360) % 360) -
    180;
  return a <= ctx.lengthDegrees / 2 && a >= -ctx.lengthDegrees / 2;
}

export function getBoundaries(ctx: Context): Rectangle {
  const arcStart = convertRadiansToCoordinates(ctx.startRadians);
  const arcEnd = convertRadiansToCoordinates(
    ctx.startRadians + ctx.lengthRadians,
  );

  const top = isAngleOnArc(ctx, 270) ? 1 : Math.max(-arcStart.y, -arcEnd.y);
  const bottom = isAngleOnArc(ctx, 90) ? 1 : Math.max(arcStart.y, arcEnd.y);
  const left = isAngleOnArc(ctx, 180) ? 1 : Math.max(-arcStart.x, -arcEnd.x);
  const right = isAngleOnArc(ctx, 0) ? 1 : Math.max(arcStart.x, arcEnd.x);

  return { top, left, height: top + bottom, width: left + right };
}

export function getViewBox(ctx: Context) {
  const { left, top, width, height } = getBoundaries(ctx);
  return `${-left} ${-top} ${width} ${height}`;
}

export function convertMouseEventToCoordinates(
  event: MouseEvent | TouchEvent,
): Coordinates {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

export function convertCoordinatesToRadians(
  ctx: Context,
  { x, y }: Coordinates,
): Radians {
  return (Math.atan2(y, x) - ctx.startRadians + 8 * Math.PI) % (2 * Math.PI);
}

export function convertRadiansToValue(ctx: Context, radians: Radians): number {
  return (
    Math.round(
      ((radians / ctx.lengthRadians) * (ctx.max - ctx.min) + ctx.min) /
        ctx.step,
    ) * ctx.step
  );
}

export function convertValueToRadians(ctx: Context, value: number): Radians {
  value = Math.min(ctx.max, Math.max(ctx.min, value));
  const fraction = (value - ctx.min) / (ctx.max - ctx.min);
  return ctx.startRadians + fraction * ctx.lengthRadians;
}

export function renderArc(startRadians: Radians, endRadians: Radians): string {
  const diff = endRadians - startRadians;
  const startXY = convertRadiansToCoordinates(startRadians);
  const endXY = convertRadiansToCoordinates(endRadians + 0.001);
  return `M ${startXY.x} ${startXY.y} A 1 1, 0, ${
    diff > Math.PI ? "1" : "0"
  } 1, ${endXY.x} ${endXY.y}`;
}
