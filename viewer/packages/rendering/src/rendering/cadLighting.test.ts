/*!
 * Copyright 2026 Cognite AS
 */

import { PerspectiveCamera, Vector3 } from 'three';
import { CAD_LIGHT_WORLD, cadLightDirectionView, cadUpDirectionView } from './cadLighting';

describe('cadLighting', () => {
  const camera = new PerspectiveCamera();
  camera.position.set(1, 2, 3);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  test.each([
    ['light', cadLightDirectionView, CAD_LIGHT_WORLD],
    ['up', cadUpDirectionView, new Vector3(0, 1, 0)]
  ])('transforms the %s direction into normalized view space', (_, toViewSpace, worldDirection) => {
    const viewDirection = toViewSpace(camera, new Vector3());

    expect(viewDirection.length()).toBeCloseTo(1);
    expect(viewDirection.transformDirection(camera.matrixWorld).distanceTo(worldDirection)).toBeCloseTo(0);
  });
});
