import { expect, test } from "vitest";
import { convertDegreesToRadians, convertRadiansToCoordinates, getViewBox, isAngleOnArc } from "./utilities";

test("convertDegreesToRadians", () => {
  expect(convertDegreesToRadians(360)).toBeCloseTo(6.28);
});

test("convertRadiansToCoordinates", () => {
  expect(convertRadiansToCoordinates(6.28)).toEqual({
    x: expect.closeTo(1),
    y: expect.closeTo(0)
  });
});

test("isAngleOnArc", () => {
  expect(isAngleOnArc(90, 0, 45)).toBe(true);
  expect(isAngleOnArc(90, 0, 90)).toBe(true);
  expect(isAngleOnArc(90, 180, 225)).toBe(true);
  expect(isAngleOnArc(360, 0, 0)).toBe(true);
  expect(isAngleOnArc(360, 0, 360)).toBe(true);
  expect(isAngleOnArc(360, 180, 180)).toBe(true);
  expect(isAngleOnArc(90, 0, 95)).toBe(false);
  expect(isAngleOnArc(90, 0, 180)).toBe(false);
  expect(isAngleOnArc(90, 180, 275)).toBe(false);
  expect(isAngleOnArc(90, -90, 0)).toBe(true);
  expect(isAngleOnArc(90, -90, 90)).toBe(false);
});

test("getViewBox", () => {
  const arc = getViewBox({
    lengthDegrees: 270,
    lengthRadians: convertDegreesToRadians(270),
    startDegrees: 135,
    startRadians: convertDegreesToRadians(135)
  });
  expect(arc).toEqual("-1 -1 2 1.7071067811865475");

  const circle = getViewBox({
    lengthDegrees: 360,
    lengthRadians: convertDegreesToRadians(360),
    startDegrees: 0,
    startRadians: convertDegreesToRadians(0)
  });
  expect(circle).toEqual("-1 -1 2 2");
});

