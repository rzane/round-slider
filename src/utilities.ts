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
  startRadians: number;
  lengthRadians: number;
  lengthDegrees: number;
  startDegrees: number;
}

export function convertDegreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function convertRadiansToCoordinates(radians: number): Coordinates {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function isAngleOnArc(ctx: Context, degrees: number): boolean {
  const a = ((ctx.startDegrees + ctx.lengthDegrees / 2 - degrees + 180 + 360) % 360) - 180;
  return a <= ctx.lengthDegrees / 2 && a >= -ctx.lengthDegrees / 2;
}

export function getBoundaries(ctx: Context): Rectangle {
  const arcStart = convertRadiansToCoordinates(ctx.startRadians);
  const arcEnd = convertRadiansToCoordinates(ctx.startRadians + ctx.lengthRadians);

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

export function convertMouseEventToCoordinates(event: MouseEvent | TouchEvent): Coordinates {
  if (event instanceof MouseEvent) {
    return { x: event.clientX, y: event.clientY };
  } else {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }
}

export function convertCoordinatesToRadians(ctx: Context, { x, y }: Coordinates): number {
  return (Math.atan2(y, x) - ctx.startRadians + 8 * Math.PI) % (2 * Math.PI);
}

export function convertRadiansToValue(ctx: Context, radians: number): number {
  return (
    Math.round(
      ((radians / ctx.lengthRadians) * (ctx.max - ctx.min) + ctx.min) / ctx.step
    ) * ctx.step
  );
}


