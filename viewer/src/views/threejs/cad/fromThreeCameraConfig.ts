/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';
import { fromThreeVector3, fromThreeMatrix } from '../utilities';
import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { SectorModelTransformation } from '../../../models/cad/types';
import { SectorScene } from '../../../models/cad/SectorScene';
import { DetermineSectorsByProximityInput } from '../../../models/cad/determineSectors';
import { CadLoadingHints } from '../../../models/cad/CadLoadingHints';

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export interface ThreeCameraConfig {
  camera: THREE.PerspectiveCamera;
  modelTransformation: SectorModelTransformation;
  sectorScene: SectorScene;
  loadingHints: CadLoadingHints;
}

export function fromThreeCameraConfig(): OperatorFunction<ThreeCameraConfig, DetermineSectorsByProximityInput> {
  return map((input: ThreeCameraConfig) => {
    const { camera, modelTransformation, sectorScene, loadingHints } = input;
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    fromThreeVector3(cameraPosition, camera.position, modelTransformation);
    fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, modelTransformation);
    fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
    return {
      sectorScene,
      cameraFov: camera.fov,
      cameraPosition,
      cameraModelMatrix,
      projectionMatrix,
      loadingHints
    };
  });
}
