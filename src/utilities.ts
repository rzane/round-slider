export interface Coordinates {
  x: number;
  y: number;
}

export function convertDegreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function convertRadiansToCoordinates(radians: number): Coordinates {
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

export function isAngleOnArc(arcLength: number, startAngle: number, degrees: number): boolean {
  const a = ((startAngle + arcLength / 2 - degrees + 180 + 360) % 360) - 180;
  return a < arcLength / 2 && a > -arcLength / 2;
}
