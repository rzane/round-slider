import { expect, test } from "vitest";
import { Context, convertDegreesToRadians, convertRadiansToCoordinates, getViewBox, isAngleOnArc } from "./utilities";

const ctx = (lengthDegrees: number, startDegrees: number): Context => ({
  min: 0,
  max: 100,
  step: 1,
  lengthDegrees,
  lengthRadians: convertDegreesToRadians(lengthDegrees),
  startDegrees,
  startRadians: convertDegreesToRadians(startDegrees)
});

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
  expect(isAngleOnArc(ctx(90, 0), 45)).toBe(true);
  expect(isAngleOnArc(ctx(90, 0), 90)).toBe(true);
  expect(isAngleOnArc(ctx(90, 180), 225)).toBe(true);
  expect(isAngleOnArc(ctx(360, 0), 0)).toBe(true);
  expect(isAngleOnArc(ctx(360, 0), 360)).toBe(true);
  expect(isAngleOnArc(ctx(360, 180), 180)).toBe(true);
  expect(isAngleOnArc(ctx(90, 0), 95)).toBe(false);
  expect(isAngleOnArc(ctx(90, 0), 180)).toBe(false);
  expect(isAngleOnArc(ctx(90, 180), 275)).toBe(false);
  expect(isAngleOnArc(ctx(90, -90), 0)).toBe(true);
  expect(isAngleOnArc(ctx(90, -90), 90)).toBe(false);
});

test("getViewBox", () => {
  const circle = ctx(360, 0);
  expect(getViewBox(circle)).toEqual("-1 -1 2 2");

  const arc = ctx(270, 135);
  expect(getViewBox(arc)).toEqual("-1 -1 2 1.7071067811865475");
});

