import { expect, test } from "vitest";
import { convertDegreesToRadians, convertRadiansToCoordinates } from "./utilities";

test("convertDegreesToRadians", () => {
  expect(convertDegreesToRadians(360)).toBeCloseTo(6.28);
});

test("convertRadiansToCoordinates", () => {
  expect(convertRadiansToCoordinates(6.28)).toEqual({
    x: expect.closeTo(1),
    y: expect.closeTo(0)
  });
});
