/*!
 * Copyright 2019 Cognite AS
 */

import { createParser, createQuadsParser } from '../../../models/sector/parseSectorData';
import { initializeSectorLoader, SectorActivator } from '../../../models/sector/initializeSectorLoader';
import { createSimpleCache } from '../../../models/createCache';
import { toThreeMatrix4, fromThreeVector3, fromThreeMatrix, toThreeVector3 } from '../utilities';
import { buildScene } from './buildScene';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { discardSector } from './discardSector';
import { consumeSectorSimple } from './consumeSectorSimple';
import { CadModel } from '../../../models/sector/CadModel';
import { SectorNode } from './SectorNode';
import * as THREE from 'three';
import { ConsumeSectorDelegate, DiscardSectorDelegate } from '../../../models/sector/delegates';
import { Sector, SectorQuads } from '../../../models/sector/types';
import { findSectorMetadata } from '../../../models/sector/findSectorMetadata';
import { SectorModelTransformation, SectorMetadata, SectorScene } from '../../../models/sector/types';
import { vec3, mat4 } from 'gl-matrix';
import { determineSectors } from '../../../models/sector/determineSectors';
import { createThreeJsSectorNode } from './createThreeJsSectorNode';
import { suggestCameraConfig } from '../../../utils/cameraUtils';

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export class CadNode extends THREE.Object3D {
  rootSector: SectorNode;

  public readonly modelTransformation: SectorModelTransformation;

  private readonly sectorScene: SectorScene;
  private readonly previousCameraMatrix = new THREE.Matrix4();
  private readonly simpleActivator: SectorActivator;
  private readonly detailedActivator: SectorActivator;

  constructor(model: CadModel) {
    super();
    const {
      fetchSectorMetadata,
      fetchSectorDetailed,
      fetchSectorSimple,
      fetchCtm,
      scene,
      modelTransformation,
      parseSimple,
      parseDetailed
    } = model;

    const { rootSector, simpleActivator, detailedActivator } = createThreeJsSectorNode(model);

    this.rootSector = rootSector;
    this.add(rootSector);

    this.name = 'Cad model';
    this.sectorScene = model.scene;
    this.modelTransformation = modelTransformation;
    // Ensure camera matrix is unequal on first frame
    this.previousCameraMatrix.elements[0] = Infinity;
    this.simpleActivator = simpleActivator;
    this.detailedActivator = detailedActivator;
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

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this.sectorScene.root);

    return {
      position: toThreeVector3(position, this.modelTransformation),
      target: toThreeVector3(target, this.modelTransformation),
      near,
      far
    };
  }
}
