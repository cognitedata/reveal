/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorModelTransformation, SectorScene } from '../../../models/sector/types';
import { fromThreeVector3, fromThreeMatrix, toThreeMatrix4 } from '../utilities';
import { SectorActivator } from '../../../models/sector/initializeSectorLoader';
import { DetermineSectorsDelegate } from '../../../models/sector/delegates';
import { vec3, mat4 } from 'gl-matrix';

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

  private determineSectorsCb: DetermineSectorsDelegate;
  private simpleActivator: SectorActivator;
  private detailedActivator: SectorActivator;
  private readonly sectorScene: SectorScene;
  private readonly previousCameraMatrix = new THREE.Matrix4();

  constructor(
    sectorScene: SectorScene,
    modelTransformation: SectorModelTransformation,
    determineSectors: DetermineSectorsDelegate,
    simpleActivator: SectorActivator,
    detailedActivator: SectorActivator
  ) {
    super(0, '/');
    this.name = 'Sector model';
    this.sectorScene = sectorScene;
    this.determineSectorsCb = determineSectors;
    this.simpleActivator = simpleActivator;
    this.detailedActivator = detailedActivator;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this.previousCameraMatrix.elements[0] = Infinity;
    // Apply model matrix to this model
    this.applyMatrix(toThreeMatrix4(modelTransformation.modelMatrix));
  }

  set determineSectors(determineSectors: DetermineSectorsDelegate) {
    this.determineSectorsCb = determineSectors;
  }

  get determineSectors() {
    return this.determineSectorsCb;
  }

  public async update(camera: THREE.PerspectiveCamera): Promise<boolean> {
    let needsRedraw = false;
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    if (!this.previousCameraMatrix.equals(camera.matrixWorld)) {
      camera.matrixWorldInverse.getInverse(camera.matrixWorld);

      fromThreeVector3(cameraPosition, camera.position, this.modelTransformation);
      fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, this.modelTransformation);
      fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
      const wantedSectors = await this.determineSectorsCb({
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
