import { Ray, Vector3 } from 'three';
import { describe, test } from 'vitest';
import { getClosestPointOnLine } from './rayExtensions';
import { expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';

describe('getClosestPointOnLine', () => {
  test('should get closest when orthogonal', () => {
    const ray = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0)); // positive x axis
    const lineDirection = new Vector3(0, 0, 1);
    const pointOnLine = new Vector3(1, 1, 0);
    {
      const result = getClosestPointOnLine(ray, lineDirection, pointOnLine);
      expectEqualVector3(result, pointOnLine);
    }
    {
      pointOnLine.set(0, 3, -2);
      const result = getClosestPointOnLine(ray, lineDirection, pointOnLine);
      expectEqualVector3(result, new Vector3(0, 3, 0));
    }
  });

  test('should get closest when line is parallel to ray', () => {
    const lineDirection = new Vector3(1, 0, 0);
    const pointOnLine = new Vector3(0, 1, 0);
    const ray = new Ray(new Vector3(0, 0, 0), lineDirection); // positive x axis
    const result = getClosestPointOnLine(ray, lineDirection, pointOnLine);
    expectEqualVector3(result, new Vector3(100, 1, 0)); // X is an arbitrary value here, so just use the one that is calculated
  });

  test('should get closest when line is equal ray', () => {
    const lineDirection = new Vector3(1, 0, 0);
    const pointOnLine = new Vector3(0, 0, 0);
    const ray = new Ray(pointOnLine, lineDirection); // positive x axis
    const result = getClosestPointOnLine(ray, lineDirection, pointOnLine);
    expectEqualVector3(result, pointOnLine); // X is an arbitrary value here, so just use the one that is calculated
  });
});
