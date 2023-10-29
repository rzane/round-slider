import { expect, test } from "vitest";
import {
  Context,
  Degrees,
  degreesToRadians,
  radiansToPoint,
  getViewBox,
  getBoundaries,
  pointToValue,
  renderArc,
} from "./utilities";

const ctx = (arc: Degrees, rotate: Degrees = 0): Context => ({
  min: 0,
  max: 100,
  step: 1,
  arc: degreesToRadians(arc),
  rotate: degreesToRadians(rotate),
});

test("degreesToRadians", () => {
  expect(degreesToRadians(360)).toBeCloseTo(6.28);
});

test("radiansToPoint", () => {
  expect(radiansToPoint(6.28)).toEqual({
    x: expect.closeTo(1),
    y: expect.closeTo(0),
  });
});

test("getBoundaries", () => {
  expect(getBoundaries(ctx(360))).toEqual({
    height: 2,
    left: 1,
    top: 1,
    width: 2,
  });
  expect(getBoundaries(ctx(180))).toEqual({
    height: 1,
    left: 1,
    top: -0,
    width: 2,
  });
});

test("getViewBox", () => {
  expect(getViewBox(ctx(360))).toEqual("-1 -1 2 2");
  expect(getViewBox(ctx(270))).toEqual("-1 -1 2 2");
  expect(getViewBox(ctx(180))).toEqual("-1 0 2 1");
  expect(getViewBox(ctx(90))).toEqual(
    "6.123233995736766e-17 0 0.9999999999999999 1",
  );
  expect(getViewBox(ctx(45))).toEqual(
    "0.7071067811865476 0 0.2928932188134524 0.7071067811865475",
  );
});

test("pointToValue", () => {
  const arc = ctx(270, 135);

  expect(pointToValue({ x: 0, y: -78.63333129882812 }, arc)).toEqual(50);
  expect(pointToValue({ x: -99, y: -16.633331298828125 }, arc)).toEqual(20);
  expect(pointToValue({ x: -33, y: 106.36666870117188 }, arc)).toEqual(0);
  expect(pointToValue({ x: 16, y: 79.36666870117188 }, arc)).toEqual(100);
});

test("renderArc", () => {
  expect(renderArc(0, degreesToRadians(360))).toEqual(
    "M 1 0 A 1 1, 0, 1 1, 0.9999995000000417 0.0009999998333334306",
  );
  expect(renderArc(0, degreesToRadians(270))).toEqual(
    "M 1 0 A 1 1, 0, 1 1, 0.000999999833333492 -0.9999995000000417",
  );
});
