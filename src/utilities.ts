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
