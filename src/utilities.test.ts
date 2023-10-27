import { expect, test } from "vitest";
import {
  Context,
  degreesToRadians,
  radiansToPoint,
  getViewBox,
} from "./utilities";

const ctx = (lengthDegrees: number, startDegrees: number): Context => ({
  min: 0,
  max: 100,
  step: 1,
  lengthRadians: degreesToRadians(lengthDegrees),
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

test("getViewBox", () => {
  expect(getViewBox(ctx(360, 0))).toEqual("-1 -1 2 2");
  expect(getViewBox(ctx(270, 0))).toEqual("-1 -1 2 2");
  expect(getViewBox(ctx(180, 0))).toEqual("-1 0 2 1");
  expect(getViewBox(ctx(90, 0))).toEqual(
    "6.123233995736766e-17 0 0.9999999999999999 1",
  );
  expect(getViewBox(ctx(45, 0))).toEqual(
    "0.7071067811865476 0 0.2928932188134524 0.7071067811865475",
  );
});
