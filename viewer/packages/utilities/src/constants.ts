/*!
 * Copyright 2022 Cognite AS
 */

import { Matrix4 } from 'three';

// The below is equal to new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
export const cadFromCdfToThreeMatrix = new Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);
export const cadFromThreeToCdfMatrix = new Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1).invert();
/**
 * The transformation matrix from CDF coordinates to ThreeJS/Reveal.
 * Note that this is already applied to Reveal models.
 */
export const CDF_TO_VIEWER_TRANSFORMATION: Matrix4 = cadFromCdfToThreeMatrix;
