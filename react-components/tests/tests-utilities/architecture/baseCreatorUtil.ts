/*!
 * Copyright 2025 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION } from '@cognite/reveal';
import { type BaseCreator } from '../../../src/architecture';
import { Ray, type Vector3 } from 'three';
import { expect } from 'vitest';

export function click(
  creator: BaseCreator,
  origin: Vector3,
  direction: Vector3,
  isFinished: boolean,
  startPoint?: Vector3
): void {
  const ray = new Ray(origin.clone(), direction.clone().normalize());
  ray.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  if (startPoint !== undefined) {
    startPoint = startPoint.clone();
    startPoint.applyMatrix4(CDF_TO_VIEWER_TRANSFORMATION);
  }
  creator.addPoint(ray, startPoint);
  expect(creator.isFinished).toBe(isFinished);
}
