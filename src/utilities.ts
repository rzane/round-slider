export interface Coordinates {
  x: number;
  y: number;
}

export interface Context {
  startRadians: number;
  lengthRadians: number;
  arcLength: number;
  startAngle: number;
}

export function convertDegreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function convertRadiansToCoordinates(radians: number): Coordinates {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function isAngleOnArc(arcLength: number, startAngle: number, degrees: number): boolean {
  const a = ((startAngle + arcLength / 2 - degrees + 180 + 360) % 360) - 180;
  return a <= arcLength / 2 && a >= -arcLength / 2;
}

export function getBoundaries(ctx: Context) {
  const arcStart = convertRadiansToCoordinates(ctx.startRadians);
  const arcEnd = convertRadiansToCoordinates(ctx.startRadians + ctx.lengthRadians);

  const top = isAngleOnArc(ctx.arcLength, ctx.startAngle, 270) ? 1 : Math.max(-arcStart.y, -arcEnd.y);
  const bottom = isAngleOnArc(ctx.arcLength, ctx.startAngle, 90) ? 1 : Math.max(arcStart.y, arcEnd.y);
  const left = isAngleOnArc(ctx.arcLength, ctx.startAngle, 180) ? 1 : Math.max(-arcStart.x, -arcEnd.x);
  const right = isAngleOnArc(ctx.arcLength, ctx.startAngle, 0) ? 1 : Math.max(arcStart.x, arcEnd.x);

  return { top, left, height: top + bottom, width: left + right };
}

export function getViewBox(ctx: Context) {
  const bounds = getBoundaries(ctx);
  return `${-bounds.left} ${-bounds.top} ${bounds.width} ${bounds.height}`
}
