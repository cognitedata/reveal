/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorModelTransformation, SectorMetadata, SectorScene } from '../../../models/sector/types';
import { vec3, mat4 } from 'gl-matrix';
import { fromThreeVector3, fromThreeMatrix } from '../utilities';
import { determineSectors } from '../../../models/sector/determineSectors';
import { SectorActivator } from '../../../models/sector/initializeSectorLoader';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export class RootSectorNode extends SectorNode {
  public readonly modelTransformation: SectorModelTransformation;

  private readonly simpleActivator: SectorActivator;
  private readonly detailedActivator: SectorActivator;
  private readonly sectorScene: SectorScene;
  private readonly previousCameraMatrix = new THREE.Matrix4();

  constructor(
    sectorScene: SectorScene,
    modelTransformation: SectorModelTransformation,
    simpleActivator: SectorActivator,
    detailedActivator: SectorActivator
  ) {
    super(0, '/');
    this.name = 'Sector model';
    this.sectorScene = sectorScene;
    this.simpleActivator = simpleActivator;
    this.detailedActivator = detailedActivator;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this.previousCameraMatrix.elements[0] = Infinity;
  }

  public async update(camera: THREE.PerspectiveCamera): Promise<boolean> {
    let needsRedraw = false;
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    if (!this.previousCameraMatrix.equals(camera.matrixWorld)) {
      // Need to trigger reload of data
      // camera.updateMatrix();
      // camera.updateMatrixWorld();
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      fromThreeVector3(cameraPosition, camera.position, this.modelTransformation);
      fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, this.modelTransformation);
      fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
      const wantedSectors = await determineSectors({
        scene: this.sectorScene,
        cameraFov: camera.fov,
        cameraPosition,
        cameraModelMatrix,
        projectionMatrix
      });
      needsRedraw = this.detailedActivator.update(wantedSectors.detailed) || needsRedraw;
      needsRedraw = this.simpleActivator.update(wantedSectors.simple) || needsRedraw;

      this.previousCameraMatrix.copy(camera.matrixWorld);
    }
    needsRedraw = this.detailedActivator.refresh() || needsRedraw;
    needsRedraw = this.simpleActivator.refresh() || needsRedraw;
    return needsRedraw;
  }
}
