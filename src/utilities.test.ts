import { expect, test } from "vitest";
import {
  Context,
  degreesToRadians,
  radiansToPoint,
  getViewBox,
  isAngleOnArc,
} from "./utilities";

const ctx = (lengthDegrees: number, startDegrees: number): Context => ({
  min: 0,
  max: 100,
  step: 1,
  lengthDegrees,
  lengthRadians: degreesToRadians(lengthDegrees),
  startDegrees,
  startRadians: degreesToRadians(startDegrees),
});

test("degreesToRadians", () => {
  expect(degreesToRadians(360)).toBeCloseTo(6.28);
});

test("convertRadiansToCoordinates", () => {
  expect(radiansToPoint(6.28)).toEqual({
    x: expect.closeTo(1),
    y: expect.closeTo(0),
  });
});

test("isAngleOnArc", () => {
  expect(isAngleOnArc(45, ctx(90, 0))).toBe(true);
  expect(isAngleOnArc(90, ctx(90, 0))).toBe(true);
  expect(isAngleOnArc(225, ctx(90, 180))).toBe(true);
  expect(isAngleOnArc(0, ctx(360, 0))).toBe(true);
  expect(isAngleOnArc(360, ctx(360, 0))).toBe(true);
  expect(isAngleOnArc(180, ctx(360, 180))).toBe(true);
  expect(isAngleOnArc(95, ctx(90, 0))).toBe(false);
  expect(isAngleOnArc(180, ctx(90, 0))).toBe(false);
  expect(isAngleOnArc(275, ctx(90, 180))).toBe(false);
  expect(isAngleOnArc(0, ctx(90, -90))).toBe(true);
  expect(isAngleOnArc(90, ctx(90, -90))).toBe(false);
});

test("getViewBox", () => {
  const circle = ctx(360, 0);
  expect(getViewBox(circle)).toEqual("-1 -1 2 2");

  const arc = ctx(270, 135);
  expect(getViewBox(arc)).toEqual("-1 -1 2 1.7071067811865475");
});
