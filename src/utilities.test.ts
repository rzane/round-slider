import { expect, test } from "vitest";
import { convertDegreesToRadians, convertRadiansToCoordinates, isAngleOnArc } from "./utilities";

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
  // expect(isAngleOnArc(90, 0, 90)).toBe(true);
  expect(isAngleOnArc(90, 180, 225)).toBe(true);
  // expect(isAngleOnArc(360, 0, 0)).toBe(true);
  // expect(isAngleOnArc(360, 0, 360)).toBe(true);
  // expect(isAngleOnArc(360, 180, 180)).toBe(true);

  expect(isAngleOnArc(90, 0, 95)).toBe(false);
  expect(isAngleOnArc(90, 0, 180)).toBe(false);
  expect(isAngleOnArc(90, 180, 275)).toBe(false);

  expect(isAngleOnArc(90, -90, -45)).toBe(true);
  expect(isAngleOnArc(90, -90, 45)).toBe(false);
  // expect(isAngleOnArc(90, 0, -45)).toBe(true);
});

